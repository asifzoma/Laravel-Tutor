import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Lesson, QuizQuestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

/**
 * A helper function to retry an async operation with exponential backoff.
 * @param fn The async function to execute.
 * @param functionName A name for the operation for logging purposes.
 * @returns The result of the async function.
 */
async function retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    functionName: string,
): Promise<T> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await fn(); // Attempt to execute the function
        } catch (error) {
            console.error(`Attempt ${attempt + 1} for ${functionName} failed:`, error);
            if (attempt === MAX_RETRIES - 1) {
                console.error(`All ${MAX_RETRIES} attempts for ${functionName} failed.`);
                throw error; // Rethrow the last error after all retries fail
            }
            const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
            console.log(`Retrying ${functionName} in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    // This part should be unreachable, but it satisfies TypeScript's need for a return path.
    throw new Error(`${functionName} failed after ${MAX_RETRIES} attempts.`);
}


const quizQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "A multiple-choice question about the topic." },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 4 possible answers for the question.",
        },
        correctAnswer: {
            type: Type.STRING,
            description: "The correct answer from the provided options.",
        },
    },
    required: ["question", "options", "correctAnswer"],
};

const interactiveCodeExampleSchema = {
    type: Type.OBJECT,
    properties: {
        setupCode: {
            type: Type.STRING,
            description: "The initial part of the code example that sets the context. This code will be displayed as static text. Can be empty.",
        },
        interactiveCode: {
            type: Type.STRING,
            description: "The part of the code with placeholders for the user to fill in. Use placeholders like [[BLANK_1]], [[BLANK_2]], etc. for the parts the user needs to complete.",
        },
        solution: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of strings that are the correct answers for the corresponding blanks in 'interactiveCode'. E.g., the first string is the solution for [[BLANK_1]].",
        },
        explanation: {
            type: Type.STRING,
            description: "A brief explanation of what the complete code does. This will be shown after the user solves the interactive part. Use markdown for formatting.",
        },
    },
    required: ["setupCode", "interactiveCode", "solution", "explanation"],
};


const lessonSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: "A clear and concise explanation of the Laravel topic, suitable for a beginner. Use markdown for formatting.",
        },
        interactiveCodeExample: {
            ...interactiveCodeExampleSchema,
            description: "A relevant and simple interactive code example in PHP for the Laravel topic. It should be a fill-in-the-blanks exercise.",
        },
        interviewQuestion: {
            type: Type.OBJECT,
            properties: {
                question: {
                    type: Type.STRING,
                    description: "A potential interview question about the topic to test deep understanding.",
                },
                sampleAnswer: {
                    type: Type.STRING,
                    description: "An ideal, expert-level answer to the interview question. Use markdown for formatting."
                }
            },
            required: ["question", "sampleAnswer"],
        },
        quiz: {
            type: Type.ARRAY,
            description: "An array of exactly 7 multiple-choice quiz questions based on the explanation and code example.",
            items: quizQuestionSchema,
        },
    },
    required: ["explanation", "interactiveCodeExample", "interviewQuestion", "quiz"],
};

export const generateLessonContent = async (topic: string): Promise<Lesson> => {
    const prompt = `Generate a lesson for a beginner learning about "${topic}" in Laravel. The lesson should include a simple explanation, an interactive fill-in-the-blanks code example, a relevant interview question with a sample expert answer, and a quiz with 7 multiple-choice questions to test understanding.`;
    
    try {
        // FIX: Explicitly specify the generic type for retryWithExponentialBackoff to ensure 'response' is correctly typed.
        const response = await retryWithExponentialBackoff<GenerateContentResponse>(
            () => ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: "You are an expert Laravel tutor creating educational content for a beginner-friendly interactive web app. Your responses must be clear, concise, and accurate. Provide content structured as JSON.",
                    responseMimeType: "application/json",
                    responseSchema: lessonSchema,
                },
            }),
            `generateLessonContent for "${topic}"`
        );
        
        const jsonText = response.text.trim();
        const lessonData: Lesson = JSON.parse(jsonText);
        
        if (
            !lessonData.explanation ||
            !lessonData.interactiveCodeExample?.interactiveCode ||
            !lessonData.interactiveCodeExample?.solution ||
            !lessonData.interviewQuestion?.question ||
            !lessonData.interviewQuestion?.sampleAnswer ||
            !lessonData.quiz ||
            !Array.isArray(lessonData.quiz) ||
            lessonData.quiz.length === 0
        ) {
            // This is a data structure error from the API, not a transient network error.
            // Retrying won't help, so we throw immediately.
            throw new Error("Invalid lesson structure received from API.");
        }

        return lessonData;
    } catch (error) {
        console.error("Error generating lesson content:", error);
        throw new Error(`Failed to generate content for topic "${topic}". Please try again.`);
    }
};

export const generatePlacementQuiz = async (): Promise<QuizQuestion[]> => {
    const prompt = `Generate a placement quiz to assess a developer's beginner-level knowledge of Laravel. Create exactly 10 multiple-choice questions covering a range of fundamental topics like Routing, Eloquent ORM, Blade Templates, Controllers, and Middleware. Ensure each question has 4 options and one correct answer.`;

    try {
        // FIX: Explicitly specify the generic type for retryWithExponentialBackoff to ensure 'response' is correctly typed.
        const response = await retryWithExponentialBackoff<GenerateContentResponse>(
            () => ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: "You are an expert Laravel tutor creating educational content. Your responses must be structured as a valid JSON array.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        description: "An array of exactly 10 multiple-choice quiz questions.",
                        items: quizQuestionSchema,
                    },
                },
            }),
            `generatePlacementQuiz`
        );
        
        const jsonText = response.text.trim();
        const quizData: QuizQuestion[] = JSON.parse(jsonText);
        
        if (!Array.isArray(quizData) || quizData.length === 0) {
            throw new Error("Invalid quiz structure received from API.");
        }

        return quizData;
    } catch (error) {
        console.error("Error generating placement quiz:", error);
        throw new Error("Failed to generate the placement quiz. Please try again.");
    }
}

export const getAnswerFeedback = async (question: string, userAnswer: string): Promise<string> => {
    const prompt = `As an expert Laravel interviewer, provide constructive and encouraging feedback on a candidate's answer.
    
    Interview Question: "${question}"
    Candidate's Answer: "${userAnswer}"

    Analyze their response for correctness, clarity, and completeness. Keep the feedback concise (2-4 sentences) and focus on reinforcing correct concepts and gently correcting any misunderstandings. Start with a positive note. Do not provide a sample answer, only feedback on their response. Use markdown for formatting.`;

    try {
        // FIX: Explicitly specify the generic type for retryWithExponentialBackoff to ensure 'response' is correctly typed.
        const response = await retryWithExponentialBackoff<GenerateContentResponse>(
            () => ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            }),
            `getAnswerFeedback`
        );
        return response.text;
    } catch (error) {
        console.error("Error generating feedback:", error);
        throw new Error("Failed to get feedback. Please try again.");
    }
}