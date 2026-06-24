import React, { useState, useEffect } from 'react';
import api from '../api';
import { Kanban, Plus, Trash2, Users, FileText, ArrowRight } from 'lucide-react';

export default function BoardList({ onSelectBoard }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/boards');
      setBoards(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError('Could not connect to the backend server. Make sure it is running at http://localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const response = await api.post('/boards', {
        name: newBoardName,
        description: newBoardDesc,
      });
      setBoards([...boards, response.data]);
      setNewBoardName('');
      setNewBoardDesc('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating board:', err);
      alert('Failed to create board. Please try again.');
    }
  };

  const handleDeleteBoard = async (e, id) => {
    e.stopPropagation(); // Prevent opening the board
    if (!window.confirm('Are you sure you want to delete this board? All lists and cards will be lost.')) return;

    try {
      await api.delete(`/boards/${id}`);
      setBoards(boards.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting board:', err);
      alert('Failed to delete board.');
    }
  };

  if (loading) {
    return (
      <div class="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-400 font-medium">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div class="max-w-6xl mx-auto px-4 py-10 flex-1 flex flex-col w-full">
      {/* Header */}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent flex items-center gap-3">
            <Kanban className="w-8 h-8 text-indigo-500" />
            ZenBoard Workspace
          </h1>
          <p class="mt-2 text-slate-400 max-w-lg">
            Manage your projects, lists, and tasks in a clean, modern collaborative workspace.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          class="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 self-start md:self-auto group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Create New Board
        </button>
      </div>

      {error && (
        <div class="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex flex-col gap-3">
          <p>{error}</p>
          <button 
            onClick={fetchBoards}
            class="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold rounded-lg text-xs self-start transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Grid */}
      {boards.length === 0 && !error ? (
        <div class="flex-1 border border-dashed border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-slate-900/10 backdrop-blur-sm min-h-[300px]">
          <Kanban className="w-16 h-16 text-slate-600 mb-4 stroke-[1.5]" />
          <h3 class="text-xl font-bold text-slate-300">No boards created yet</h3>
          <p class="mt-2 text-slate-500 max-w-sm text-sm">
            Create your first board to start organizing your lists, tags, and collaborative cards.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            class="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/20 font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Get Started
          </button>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              class="group relative border border-slate-850 hover:border-indigo-500/40 rounded-2xl p-6 bg-slate-900/30 hover:bg-slate-900/50 backdrop-blur-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[190px]"
            >
              {/* Delete Button (floating) */}
              <button
                onClick={(e) => handleDeleteBoard(e, board.id)}
                class="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                title="Delete Board"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <h3 class="text-xl font-bold text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center gap-2 mb-2 pr-8">
                  {board.name}
                </h3>
                <p class="text-sm text-slate-400 line-clamp-3 mb-4">
                  {board.description || 'No description provided.'}
                </p>
              </div>

              <div class="flex items-center justify-between border-t border-slate-850 pt-4 mt-auto">
                <div class="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span class="font-medium text-slate-400">{board.members?.length || 0}</span>
                  <span>members</span>
                </div>
                <span class="text-xs text-indigo-400 group-hover:text-indigo-300 font-bold flex items-center gap-1 transition-all group-hover:translate-x-1">
                  Open Board
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 class="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
              <Kanban className="w-6 h-6 text-indigo-500" />
              Create Board
            </h2>
            <form onSubmit={handleCreateBoard} class="space-y-5">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Board Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Launch, Sprint Board"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-600 transition-all text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Outline the scope, goals, or schedule..."
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-600 transition-all text-sm resize-none"
                />
              </div>
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBoardName('');
                    setNewBoardDesc('');
                  }}
                  class="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
