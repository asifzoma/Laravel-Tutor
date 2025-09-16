import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { InteractiveCodeExample } from '../types';
import CodeBlock from './CodeBlock';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
// Fix: Import MarkdownRenderer to resolve 'Cannot find name' error.
import MarkdownRenderer from './MarkdownRenderer';

declare const hljs: any;

interface InteractiveCodeBlockProps {
    example: InteractiveCodeExample;
}

const InteractiveCodeBlock: React.FC<InteractiveCodeBlockProps> = ({ example }) => {
    const { setupCode, interactiveCode, solution, explanation } = example;

    const numBlanks = solution.length;
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(numBlanks).fill(''));
    const [feedback, setFeedback] = useState<(boolean | null)[]>(Array(numBlanks).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            // Find all spans that are not part of the input wrappers and highlight them
            const elementsToHighlight = codeRef.current.querySelectorAll('span.code-part');
            elementsToHighlight.forEach(el => {
                hljs.highlightElement(el as HTMLElement);
            });
        }
    }, [setupCode, interactiveCode]);


    const handleInputChange = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);

        // Reset feedback for the specific input being changed
        if (isSubmitted) {
            const newFeedback = [...feedback];
            newFeedback[index] = null;
            setFeedback(newFeedback);
        }
    };

    const handleCheckAnswers = () => {
        const newFeedback = userAnswers.map((answer, index) => {
            // Normalize by removing extra whitespace and quotes, and making it case-insensitive
            const formattedUserAnswer = answer.trim().replace(/['"`]/g, '');
            const formattedSolution = solution[index].trim().replace(/['"`]/g, '');
            return formattedUserAnswer.toLowerCase() === formattedSolution.toLowerCase();
        });
        setFeedback(newFeedback);
        setIsSubmitted(true);
    };

    const handleTryAgain = () => {
        setIsSubmitted(false);
        setFeedback(Array(numBlanks).fill(null));
    }

    const isCorrect = useMemo(() => {
        if (!isSubmitted) return false;
        return feedback.every(f => f === true);
    }, [feedback, isSubmitted]);

    const renderInteractivePart = () => {
        // Split by the placeholder, but keep the delimiter
        const parts = interactiveCode.split(/(\[\[BLANK_\d+\]\])/g);
        let blankIndex = 0;

        return parts.filter(part => part.trim() !== '').map((part, i) => {
            if (part.match(/\[\[BLANK_\d+\]\]/)) {
                const currentIndex = blankIndex;
                blankIndex++;
                const feedbackStatus = feedback[currentIndex];

                let inputBorderColor = 'border-slate-400 focus:border-laravel-red';
                if (isSubmitted) {
                    inputBorderColor = feedbackStatus ? 'border-green-500' : 'border-red-500';
                }

                return (
                    <span key={`blank-${currentIndex}`} className="relative inline-flex items-center mx-1">
                        <input
                            type="text"
                            value={userAnswers[currentIndex]}
                            onChange={(e) => handleInputChange(currentIndex, e.target.value)}
                            disabled={isCorrect}
                            aria-label={`Code blank ${currentIndex + 1}`}
                            className={`bg-slate-200 text-slate-800 font-mono text-sm rounded-md p-1 border-2 transition-colors ${inputBorderColor} focus:ring-2 focus:ring-laravel-red focus:outline-none`}
                            style={{ width: `${Math.max(solution[currentIndex].length, userAnswers[currentIndex].length, 6) + 2}ch` }}
                        />
                        {isSubmitted && (
                            <span className="absolute right-[-24px]">
                                {feedbackStatus ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5 text-red-500" />
                                )}
                            </span>
                        )}
                    </span>
                );
            }
            return <span key={`code-${i}`} className="code-part">{part}</span>;
        });
    };

    const fullCode = useMemo(() => {
        let tempCode = interactiveCode;
        solution.forEach((sol, index) => {
            tempCode = tempCode.replace(`[[BLANK_${index + 1}]]`, sol);
        });
        return setupCode + tempCode;
    }, [setupCode, interactiveCode, solution]);

    return (
        <div className="space-y-4">
            <p className="text-slate-600">Complete the code snippet below by filling in the blanks.</p>
            <div className="relative group bg-gray-900 rounded-lg p-4">
                <pre className="whitespace-pre-wrap">
                    <code ref={codeRef} className="php text-sm leading-relaxed">
                        {setupCode && <span className="code-part">{setupCode}</span>}
                        {renderInteractivePart()}
                    </code>
                </pre>
            </div>
            
            {!isCorrect && (
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={handleCheckAnswers}
                        className="px-6 py-2 bg-laravel-red text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:bg-slate-400"
                        disabled={userAnswers.some(a => a === '')}
                    >
                        Check Answer
                    </button>
                    {isSubmitted && !isCorrect && (
                         <button 
                            onClick={handleTryAgain}
                            className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                 </div>
            )}
            
            {isCorrect && (
                <div className="space-y-4 mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        <h4 className="text-lg font-bold text-green-900">Correct! Well done.</h4>
                    </div>
                    <MarkdownRenderer content={explanation} className="prose-sm" />
                    <h5 className="font-semibold text-green-900 pt-2">Here is the complete code:</h5>
                    <CodeBlock code={fullCode} />
                </div>
            )}
        </div>
    );
};

export default InteractiveCodeBlock;