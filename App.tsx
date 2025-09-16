import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LessonContent from './components/LessonContent';
import { HamburgerIcon } from './components/icons/HamburgerIcon';
import { LARAVEL_TOPICS } from './constants';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setIsSidebarOpen(false); // Close sidebar on selection
  };
  
  const handleNextLesson = () => {
    if (!selectedTopic) return;
    const currentIndex = LARAVEL_TOPICS.indexOf(selectedTopic);
    if (currentIndex > -1 && currentIndex < LARAVEL_TOPICS.length - 1) {
      setSelectedTopic(LARAVEL_TOPICS[currentIndex + 1]);
    }
  };

  const hasNextLesson = selectedTopic
    ? LARAVEL_TOPICS.indexOf(selectedTopic) < LARAVEL_TOPICS.length - 1
    : false;

  return (
    <div className="relative min-h-screen font-sans bg-slate-100">
      <Sidebar
        onSelectTopic={handleSelectTopic}
        selectedTopic={selectedTopic}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <main className="transition-all duration-300">
        <div className="p-6 sm:p-8 md:p-10">
          <header className="mb-8 flex items-center gap-4">
            <button
              className="p-2 text-slate-600 rounded-md hover:bg-slate-200"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <HamburgerIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="text-laravel-red">Laravel</span>
                <span className="text-slate-800"> Tutor </span>
                <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500">Your personal AI-powered guide to mastering Laravel</p>
            </div>
          </header>
          <LessonContent 
            topic={selectedTopic} 
            onNextLesson={handleNextLesson}
            hasNextLesson={hasNextLesson}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
