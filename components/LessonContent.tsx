import React, { useState, useEffect } from 'react';
import { generateLessonContent, generatePlacementQuiz } from '../services/geminiService';
import type { Lesson, QuizQuestion } from '../types';
import InteractiveCodeBlock from './InteractiveCodeBlock';
import InterviewQuestion from './InterviewQuestion';
import Spinner from './Spinner';
import Quiz from './Quiz';
import MarkdownRenderer from './MarkdownRenderer';

interface LessonContentProps {
  topic: string | null;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

const LessonContent: React.FC<LessonContentProps> = ({ topic, onNextLesson, hasNextLesson }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [placementQuiz, setPlacementQuiz] = useState<QuizQuestion[] | null>(null);
  const [isLoadingPlacementQuiz, setIsLoadingPlacementQuiz] = useState(false);

  useEffect(() => {
    if (!topic) {
      setLesson(null);
      return;
    }

    const fetchLesson = async () => {
      setIsLoading(true);
      setError(null);
      setLesson(null);
      try {
        const content = await generateLessonContent(topic);
        setLesson(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
    
  }, [topic]);

  const handleStartPlacementQuiz = async () => {
    setIsLoadingPlacementQuiz(true);
    setError(null);
    setPlacementQuiz(null);
    try {
      const questions = await generatePlacementQuiz();
      setPlacementQuiz(questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoadingPlacementQuiz(false);
    }
  };

  if (!topic) {
    if (isLoadingPlacementQuiz) {
       return (
        <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md p-8">
          <Spinner />
          <p className="ml-4 text-slate-600">Generating your placement quiz...</p>
        </div>
      );
    }
    if (placementQuiz) {
      return (
         <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
           <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">Laravel Knowledge Check</h3>
           <Quiz 
            questions={placementQuiz} 
            key="placement-quiz" 
            onRestart={() => setPlacementQuiz(null)}
            restartButtonText="Back to Topics"
          />
         </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md p-8 text-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-700">Welcome to Laravel Tutor AI!</h2>
          <p className="text-slate-500 mt-2">Please select a topic from the sidebar to begin your lesson, or test your knowledge with our placement quiz.</p>
          <button 
            onClick={handleStartPlacementQuiz}
            className="mt-6 px-6 py-2 bg-laravel-red text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors"
          >
            Test Your Knowledge
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md p-8">
        <Spinner />
        <p className="ml-4 text-slate-600">Generating your lesson on "{topic}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 border border-red-200 rounded-lg shadow-md p-8 text-red-700">
        <p><strong>Error:</strong> {error}</p>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Explanation</h3>
        <MarkdownRenderer content={lesson.explanation} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Interactive Code Example</h3>
        <InteractiveCodeBlock example={lesson.interactiveCodeExample} key={topic}/>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Test Your Knowledge</h3>
        <InterviewQuestion interviewQuestion={lesson.interviewQuestion} key={topic} />
      </div>
      {lesson.quiz && lesson.quiz.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Quiz Time!</h3>
          <Quiz 
            questions={lesson.quiz} 
            key={`${topic}-quiz`}
            onNextLesson={onNextLesson}
            hasNextLesson={hasNextLesson}
          />
        </div>
      )}
    </div>
  );
};

export default LessonContent;