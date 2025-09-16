import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { BrainIcon } from './icons/BrainIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface QuizProps {
  questions: QuizQuestion[];
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
  onRestart?: () => void;
  restartButtonText?: string;
}

const Quiz: React.FC<QuizProps> = ({ 
  questions, 
  onNextLesson, 
  hasNextLesson,
  onRestart,
  restartButtonText = 'Try Again' 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      if (answer === questions[index].correctAnswer) {
        return score + 1;
      }
      return score;
    }, 0);
  };
  
  const handleRestart = () => {
    if (onRestart) {
        onRestart();
    } else {
        setCurrentQuestionIndex(0);
        setSelectedAnswers(Array(questions.length).fill(null));
        setShowResults(false);
    }
  }

  if (showResults) {
    const score = calculateScore();
    const scorePercentage = (score / questions.length) * 100;

    let feedbackMessage = '';
    let feedbackColor = '';
    let FeedbackIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;

    if (scorePercentage === 100) {
      feedbackMessage = "Excellent! You aced it!";
      feedbackColor = 'text-green-600';
      FeedbackIcon = TrophyIcon;
    } else if (scorePercentage >= 70) {
      feedbackMessage = "Great job! You have a solid understanding.";
      feedbackColor = 'text-blue-600';
      FeedbackIcon = BrainIcon;
    } else if (scorePercentage >= 50) {
      feedbackMessage = "Good effort! A little more review might help.";
      feedbackColor = 'text-yellow-600';
      FeedbackIcon = LightbulbIcon;
    } else {
      feedbackMessage = "Don't worry, learning is a process. Let's try again!";
      feedbackColor = 'text-red-600';
      FeedbackIcon = BookOpenIcon;
    }


    return (
      <div className="space-y-6">
        <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Quiz Results</h3>
            <p className="text-4xl font-extrabold text-laravel-red mb-2">{score} / {questions.length}</p>
            <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${feedbackColor}`}>
              <FeedbackIcon className="h-6 w-6" />
              <span>{feedbackMessage}</span>
            </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, index) => (
             <div key={index} className="p-4 rounded-lg bg-white border border-slate-200">
                <p className="font-semibold text-slate-800 mb-3">{index + 1}. {q.question}</p>
                <div className="space-y-2">
                    {q.options.map((option, optionIndex) => {
                        const isCorrectAnswer = option === q.correctAnswer;
                        const isSelectedAnswer = option === selectedAnswers[index];

                        let optionClasses = 'flex items-center justify-between w-full p-3 text-left border rounded-md text-sm ';
                        let icon = null;
                        let labelText: string | null = null;
                        let labelClasses: string | null = null;

                        // Case 1: Correctly chosen by user
                        if (isSelectedAnswer && isCorrectAnswer) {
                            optionClasses += 'bg-green-50 border-green-300 text-green-900 font-medium';
                            icon = <CheckCircleIcon className="h-5 w-5 text-green-600" />;
                            labelText = "Your Answer";
                            labelClasses = "text-green-700";
                        } 
                        // Case 2: Incorrectly chosen by user
                        else if (isSelectedAnswer && !isCorrectAnswer) {
                            optionClasses += 'bg-red-50 border-red-300 text-red-900';
                            icon = <XCircleIcon className="h-5 w-5 text-red-600" />;
                            labelText = "Your Answer";
                            labelClasses = "text-red-700";
                        }
                        // Case 3: The correct answer, but not chosen by user
                        else if (!isSelectedAnswer && isCorrectAnswer) {
                            optionClasses += 'bg-green-50 border-green-300 text-green-900 font-medium';
                            icon = <CheckCircleIcon className="h-5 w-5 text-green-600" />;
                            labelText = "Correct Answer";
                            labelClasses = "text-green-700";
                        }
                        // Case 4: An incorrect answer, not chosen by user
                        else {
                            optionClasses += 'bg-slate-50 border-slate-200 text-slate-600 opacity-70';
                        }
                        
                        return (
                             <div key={optionIndex} className={optionClasses}>
                                <span>{option}</span>
                                <div className="flex items-center gap-2">
                                    {labelText && <span className={`text-xs font-semibold ${labelClasses}`}>{labelText}</span>}
                                    {icon}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4">
            <button onClick={handleRestart} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">
              {restartButtonText}
            </button>
            {hasNextLesson && onNextLesson && scorePercentage >= 70 && (
                <button onClick={onNextLesson} className="px-6 py-2 bg-laravel-red text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors">
                    Next Lesson
                </button>
            )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-laravel-red tracking-wider">QUESTION {currentQuestionIndex + 1} OF {questions.length}</p>
        <h4 className="text-xl font-bold text-slate-800 mt-1">{currentQuestion.question}</h4>
      </div>
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option)}
            className={`flex items-center justify-between w-full text-left p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedAnswers[currentQuestionIndex] === option
                ? 'border-laravel-red ring-2 ring-red-200 bg-red-50'
                : 'border-slate-300 bg-white hover:border-laravel-red hover:bg-red-50'
            }`}
          >
            <span className="font-medium text-slate-800">{option}</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                selectedAnswers[currentQuestionIndex] === option
                ? 'border-laravel-red bg-laravel-red'
                : 'border-slate-400 bg-white'
            }`}>
              {selectedAnswers[currentQuestionIndex] === option && (
                <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        {isLastQuestion ? (
          <button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestionIndex]} className="px-8 py-3 bg-laravel-red text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
            Submit Quiz
          </button>
        ) : (
          <button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]} className="px-8 py-3 bg-laravel-red text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;