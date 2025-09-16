export interface InterviewQuestion {
  question: string;
  sampleAnswer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface InteractiveCodeExample {
  setupCode: string;
  interactiveCode: string;
  solution: string[];
  explanation: string;
}

export interface Lesson {
  explanation: string;
  interactiveCodeExample: InteractiveCodeExample;
  interviewQuestion: InterviewQuestion;
  quiz: QuizQuestion[];
}