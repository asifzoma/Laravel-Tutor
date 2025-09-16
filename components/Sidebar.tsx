import React, { useState } from 'react';
import { LARAVEL_TOPICS } from '../constants';
import { XIcon } from './icons/XIcon';
import { SearchIcon } from './icons/SearchIcon';

interface SidebarProps {
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTopic, onSelectTopic, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = LARAVEL_TOPICS.filter(topic =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 text-white flex flex-col p-4 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-2xl font-bold">Topics</span>
        <button
          className="p-1 rounded-md text-slate-300 hover:bg-slate-700"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      
      <div className="relative mb-4 px-2">
        <span className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search topics..."
          className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-laravel-red"
          aria-label="Search topics"
        />
      </div>

      <nav className="flex-grow overflow-y-auto">
        <ul>
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => (
              <li key={topic} className="mb-2">
                <button
                  onClick={() => onSelectTopic(topic)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-laravel-red focus:ring-opacity-50 ${
                    selectedTopic === topic
                      ? 'bg-laravel-red text-white font-semibold'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  {topic}
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-slate-400">No topics found.</li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;