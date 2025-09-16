import React, { useState, useEffect, useRef } from 'react';
import type { InterviewQuestion } from '../types';
import { getAnswerFeedback } from '../services/geminiService';
import Spinner from './Spinner';
import { MicIcon } from './icons/MicIcon';
import MarkdownRenderer from './MarkdownRenderer';

// Fix for TypeScript not knowing about Web Speech API
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface InterviewQuestionProps {
  interviewQuestion: InterviewQuestion;
}

const InterviewQuestionComponent: React.FC<InterviewQuestionProps> = ({ interviewQuestion }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setUserAnswer(prev => prev + finalTranscript + interimTranscript);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }
  }, []);

  const handleListen = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    } else {
        setUserAnswer('');
        recognitionRef.current?.start();
        setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const result = await getAnswerFeedback(interviewQuestion.question, userAnswer);
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-slate-800">{interviewQuestion.question}</p>
      
      <div className="relative">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type or record your answer here..."
          rows={5}
          className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-laravel-red focus:border-laravel-red transition-shadow"
          disabled={isLoading}
        />
        <button
            onClick={handleListen}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-laravel-red text-white animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
            <MicIcon className="h-5 w-5" />
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !userAnswer.trim()}
        className="px-6 py-2 bg-laravel-red text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center"
      >
        {isLoading && <Spinner />}
        <span className={isLoading ? 'ml-2' : ''}>Get Feedback</span>
      </button>

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <h4 className="font-bold">Error</h4>
            <p className="mt-1">{error}</p>
        </div>
      )}

      {feedback && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-bold text-blue-900">Feedback on Your Answer</h4>
            <MarkdownRenderer content={feedback} className="prose-sm mt-2" />
          </div>
           <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <h4 className="font-bold text-green-900">Sample Expert Answer</h4>
            <MarkdownRenderer content={interviewQuestion.sampleAnswer} className="prose-sm mt-2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionComponent;