import React, { useState } from 'react';
import BoardList from './components/BoardList';
import BoardView from './components/BoardView';
import { Kanban } from 'lucide-react';

export default function App() {
  const [currentBoardId, setCurrentBoardId] = useState(null);

  return (
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header class="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => setCurrentBoardId(null)}
            class="flex items-center gap-2.5 cursor-pointer group"
          >
            <div class="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/25 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/40 transition-all duration-300">
              <Kanban className="w-5 h-5 text-indigo-500" />
            </div>
            <span class="font-extrabold tracking-tight text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:text-white transition-all">
              ZenBoard
            </span>
          </div>

          <div class="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span>Forge 2 Edition 1 Qualifier</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main class="flex-1 flex flex-col min-h-0">
        {currentBoardId ? (
          <BoardView 
            boardId={currentBoardId} 
            onBack={() => setCurrentBoardId(null)} 
          />
        ) : (
          <BoardList 
            onSelectBoard={setCurrentBoardId} 
          />
        )}
      </main>
    </div>
  );
}
