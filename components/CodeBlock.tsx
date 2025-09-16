import React, { useState, useEffect, useRef } from 'react';
import { CopyIcon } from './icons/CopyIcon';

declare const hljs: any;

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
        hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group">
       <button 
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 bg-slate-700 rounded-md text-slate-300 hover:bg-slate-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
        aria-label="Copy code"
      >
        {copied ? (
          <span className="text-xs px-1">Copied!</span>
        ) : (
          <CopyIcon className="h-5 w-5" />
        )}
      </button>
      <pre className="rounded-lg">
        <code ref={codeRef} className="php rounded-lg">
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;