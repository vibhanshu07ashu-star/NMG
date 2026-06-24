import React, { useState, useEffect } from 'react';
import api from '../api';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  ArrowLeft, Plus, Trash2, Edit2, Check, X, 
  UserPlus, GripVertical, Calendar, Tag as TagIcon, Users, Clock 
} from 'lucide-react';
import CardModal from './CardModal';

// Droppable List wrapper
function DroppableListContainer({ listId, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `list-${listId}`,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`flex-1 flex flex-col gap-3 min-h-[300px] rounded-xl p-1.5 transition-colors duration-200 ${
        isOver ? 'bg-indigo-950/20 border border-dashed border-indigo-500/30' : 'bg-transparent'
      }`}
    >
      {children}
    </div>
  );
}

// Draggable Card item
function DraggableCardItem({ card, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: { card },
  });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  // Determine if card is overdue
  const isOverdue = () => {
    if (!card.due_date) return false;
    const due = new Date(card.due_date);
    const now = new Date();
    // Normalize times (remove hours/minutes/seconds) to check date
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return due < now;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      class="group relative border border-slate-850 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col gap-3 select-none"
      onClick={() => onClick(card)}
    >
      {/* Top row: tags and drag handle */}
      <div class="flex items-start justify-between gap-2">
        <div class="flex flex-wrap gap-1">
          {card.tags && card.tags.map(tag => (
            <span 
              key={tag.id} 
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ 
                backgroundColor: `${tag.color}15`, 
                borderColor: `${tag.color}30`, 
                color: tag.color 
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        
        {/* Drag handle */}
        <div 
          {...listeners} 
          {...attributes} 
          onClick={(e) => e.stopPropagation()} // Stop modal from triggering when grabbing handle
          class="text-slate-600 hover:text-slate-300 p-1 hover:bg-slate-800 rounded cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Card Title */}
      <h4 class="font-semibold text-slate-200 text-sm leading-tight group-hover:text-white transition-colors">
        {card.title}
      </h4>

      {/* Card Description Snippet */}
      {card.description && (
        <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* Footer row: due date and members */}
      {(card.due_date || (card.members && card.members.length > 0)) && (
        <div class="flex items-center justify-between border-t border-slate-850/60 pt-3 mt-1 text-xs">
          {/* Due date */}
          {card.due_date ? (
            <div 
              className={`flex items-center gap-1 font-medium ${
                isOverdue() 
                  ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg' 
                  : 'text-slate-400 bg-slate-800/40 border border-slate-800/60 px-2 py-0.5 rounded-lg'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{formatDate(card.due_date)}</span>
            </div>
          ) : <div />}

          {/* Members list */}
          <div class="flex -space-x-1.5 overflow-hidden">
            {card.members && card.members.map(member => (
              <div 
                key={member.id}
                title={member.name}
                class="w-5 h-5 rounded-full bg-indigo-600/80 border border-slate-900 flex items-center justify-center text-[9px] font-bold text-white uppercase"
              >
                {member.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BoardView({ boardId, onBack }) {
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // List management states
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Card creation states
  const [addingCardListId, setAddingCardListId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  // Member management states
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Modal card state
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchBoardDetails();
  }, [boardId]);

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/boards/${boardId}`);
      setBoard(response.data);
      // Ensure lists are ordered by position
      const sortedLists = (response.data.lists || []).sort((a, b) => a.position - b.position);
      setLists(sortedLists);
    } catch (err) {
      console.error('Error fetching board details:', err);
      alert('Failed to load board details.');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const response = await api.post(`/boards/${boardId}/lists`, {
        name: newListName,
      });
      setLists([...lists, { ...response.data, cards: [] }]);
      setNewListName('');
      setShowAddList(false);
    } catch (err) {
      console.error('Error creating list:', err);
    }
  };

  const handleUpdateListTitle = async (id) => {
    if (!editingListName.trim()) {
      setEditingListId(null);
      return;
    }

    try {
      await api.put(`/lists/${id}`, {
        name: editingListName,
      });
      setLists(lists.map(l => l.id === id ? { ...l, name: editingListName } : l));
      setEditingListId(null);
    } catch (err) {
      console.error('Error updating list:', err);
    }
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Delete this list and all its cards?')) return;

    try {
      await api.delete(`/lists/${id}`);
      setLists(lists.filter(l => l.id !== id));
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  const handleCreateCard = async (e, listId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    try {
      const response = await api.post(`/lists/${listId}/cards`, {
        title: newCardTitle,
      });
      
      setLists(lists.map(l => {
        if (l.id === listId) {
          return {
            ...l,
            cards: [...(l.cards || []), response.data].sort((a, b) => a.position - b.position),
          };
        }
        return l;
      }));

      setNewCardTitle('');
      setAddingCardListId(null);
    } catch (err) {
      console.error('Error creating card:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    try {
      const response = await api.post(`/boards/${boardId}/members`, {
        name: newMemberName,
        email: newMemberEmail,
      });

      // Update board members
      setBoard({
        ...board,
        members: [...(board.members || []), response.data],
      });

      setNewMemberName('');
      setNewMemberEmail('');
      setShowAddMember(false);
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Failed to add member to board.');
    }
  };

  // Drag and Drop End handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const draggedCardId = active.id.replace('card-', '');
    let targetListId = null;
    let targetPosition = 0;

    // Case 1: Dropped over list container
    if (over.id.startsWith('list-')) {
      targetListId = over.id.replace('list-', '');
      const targetList = lists.find(l => l.id == targetListId);
      targetPosition = targetList ? (targetList.cards?.length || 0) : 0;
    } 
    // Case 2: Dropped over another card
    else if (over.id.startsWith('card-')) {
      const targetCardId = over.id.replace('card-', '');
      
      for (const list of lists) {
        const idx = list.cards?.findIndex(c => c.id == targetCardId);
        if (idx !== undefined && idx !== -1) {
          targetListId = list.id;
          targetPosition = idx;
          break;
        }
      }
    }

    if (targetListId) {
      // Find list and verify if card actually moved
      const sourceList = lists.find(l => l.cards?.some(c => c.id == draggedCardId));
      const targetList = lists.find(l => l.id == targetListId);
      
      // If same list and same position, do nothing
      if (sourceList && sourceList.id == targetListId) {
        const oldIndex = sourceList.cards.findIndex(c => c.id == draggedCardId);
        if (oldIndex === targetPosition) return;
      }

      // Snappy Optimistic UI Update
      setLists(prevLists => {
        let cardToMove = null;
        
        // Remove from old list
        const updatedLists = prevLists.map(list => {
          const card = list.cards?.find(c => c.id == draggedCardId);
          if (card) {
            cardToMove = card;
            return {
              ...list,
              cards: list.cards.filter(c => c.id != draggedCardId)
            };
          }
          return list;
        });

        if (!cardToMove) return prevLists;

        // Insert into new list
        return updatedLists.map(list => {
          if (list.id == targetListId) {
            const cards = [...(list.cards || [])];
            cards.splice(targetPosition, 0, {
              ...cardToMove,
              list_id: parseInt(targetListId)
            });
            return {
              ...list,
              cards: cards.map((c, i) => ({ ...c, position: i + 1 }))
            };
          }
          return list;
        });
      });

      // Background API request
      try {
        await api.patch(`/cards/${draggedCardId}/move`, {
          list_id: targetListId,
          position: targetPosition,
        });
        
        // Refetch to sync any deep relationships and correct sequencing
        const response = await api.get(`/boards/${boardId}`);
        const sortedLists = (response.data.lists || []).sort((a, b) => a.position - b.position);
        setLists(sortedLists);
      } catch (err) {
        console.error('Error saving card move:', err);
        fetchBoardDetails(); // Revert on failure
      }
    }
  };

  if (loading || !board) {
    return (
      <div class="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-400 font-medium">Loading board details...</p>
      </div>
    );
  }

  return (
    <div class="flex-1 flex flex-col min-h-0 w-full">
      {/* Board Header */}
      <div class="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start gap-4">
          <button 
            onClick={onBack}
            class="p-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-2xl font-bold text-slate-100 flex items-center gap-3">
              {board.name}
            </h2>
            <p class="text-sm text-slate-400 mt-1 max-w-xl">
              {board.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Member Action / Section */}
        <div class="flex items-center gap-3 self-end md:self-auto">
          {/* List of members preview */}
          <div class="flex items-center -space-x-2">
            {board.members && board.members.slice(0, 5).map(member => (
              <div 
                key={member.id}
                title={`${member.name} (${member.email})`}
                class="w-8 h-8 rounded-full bg-slate-850 hover:bg-indigo-600 border border-slate-900 flex items-center justify-center text-xs font-bold text-slate-200 hover:text-white uppercase transition-colors"
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {board.members && board.members.length > 5 && (
              <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-xs font-semibold text-slate-400">
                +{board.members.length - 5}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddMember(true)}
            class="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 font-semibold text-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* Drag & Drop Board Columns Wrapper */}
      <DndContext onDragEnd={handleDragEnd}>
        <div class="flex-1 overflow-x-auto flex items-start gap-5 p-6 min-h-0 bg-slate-950/20">
          
          {/* Lists loop */}
          {lists.map(list => (
            <div 
              key={list.id} 
              class="w-[290px] max-h-full flex-shrink-0 bg-slate-900/40 border border-slate-850/80 rounded-2xl flex flex-col p-4 shadow-sm backdrop-blur-sm"
            >
              {/* List Header */}
              <div class="flex items-center justify-between mb-4 group/list-head">
                {editingListId === list.id ? (
                  <div class="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={editingListName}
                      onChange={(e) => setEditingListName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateListTitle(list.id)}
                      class="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-sm font-semibold text-slate-200 outline-none w-full focus:border-indigo-500"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleUpdateListTitle(list.id)}
                      class="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingListId(null)}
                      class="p-1 text-slate-400 hover:bg-slate-800 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 
                      onDoubleClick={() => {
                        setEditingListId(list.id);
                        setEditingListName(list.name);
                      }}
                      class="font-bold text-slate-200 text-sm cursor-pointer select-none hover:text-indigo-400 transition-colors flex-1"
                    >
                      {list.name}
                    </h3>
                    <div class="flex items-center opacity-0 group-hover/list-head:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingListId(list.id);
                          setEditingListName(list.name);
                        }}
                        class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* List Cards Droppable Zone */}
              <div class="overflow-y-auto flex-1 mb-2 pr-0.5">
                <DroppableListContainer listId={list.id}>
                  {list.cards && list.cards.map(card => (
                    <DraggableCardItem 
                      key={card.id} 
                      card={card} 
                      onClick={setSelectedCard} 
                    />
                  ))}
                </DroppableListContainer>
              </div>

              {/* List Footer / Add Card */}
              {addingCardListId === list.id ? (
                <form onSubmit={(e) => handleCreateCard(e, list.id)} class="mt-2 space-y-2">
                  <textarea
                    rows="2"
                    placeholder="Enter a title for this card..."
                    required
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateCard(e, list.id);
                      }
                    }}
                    class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-xs text-slate-200 placeholder-slate-600 transition-all resize-none"
                    autoFocus
                  />
                  <div class="flex items-center gap-2">
                    <button
                      type="submit"
                      class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      Add Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingCardListId(null)}
                      class="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setAddingCardListId(list.id);
                    setNewCardTitle('');
                  }}
                  class="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-950/10 text-slate-400 hover:text-indigo-400 text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task Card
                </button>
              )}
            </div>
          ))}

          {/* Add List Column */}
          {showAddList ? (
            <div class="w-[290px] flex-shrink-0 bg-slate-900/60 border border-slate-850/80 rounded-2xl p-4 flex flex-col shadow-sm">
              <form onSubmit={handleCreateList} class="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Enter list title..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all"
                  autoFocus
                />
                <div class="flex items-center gap-2">
                  <button
                    type="submit"
                    class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    Save List
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddList(false)}
                    class="p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAddList(true);
                setNewListName('');
              }}
              class="w-[290px] flex-shrink-0 flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/10 text-slate-400 hover:text-indigo-400 font-bold text-sm transition-all duration-300 h-16 self-start"
            >
              <Plus className="w-4 h-4" />
              Add Column List
            </button>
          )}

        </div>
      </DndContext>

      {/* Add Board Member Modal */}
      {showAddMember && (
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 class="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-indigo-500" />
              Invite Member
            </h2>
            <form onSubmit={handleAddMember} class="space-y-5">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-600 transition-all text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-600 transition-all text-sm"
                />
              </div>
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMemberName('');
                    setNewMemberEmail('');
                  }}
                  class="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Details Modal */}
      {selectedCard && (
        <CardModal 
          card={selectedCard}
          boardMembers={board.members || []}
          onClose={() => {
            setSelectedCard(null);
            fetchBoardDetails(); // Refresh list to get updated card state
          }}
        />
      )}
    </div>
  );
}
