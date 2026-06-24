import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  X, Calendar, Tag as TagIcon, Users, Trash2, 
  FileText, Clock, AlertCircle, Plus, Check 
} from 'lucide-react';

const PRESETS = [
  { name: 'Bug', color: '#f43f5e' },
  { name: 'Feature', color: '#10b981' },
  { name: 'Design', color: '#f59e0b' },
  { name: 'Refactor', color: '#8b5cf6' },
  { name: 'Docs', color: '#0ea5e9' },
];

export default function CardModal({ card, boardMembers, onClose }) {
  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(
    card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : ''
  );
  
  const [tags, setTags] = useState(card.tags || []);
  const [members, setMembers] = useState(card.members || []);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // New tag custom creation states
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#10b981'); // Default green

  const handleUpdateField = async (field, value) => {
    try {
      const payload = {
        [field]: value
      };
      
      const response = await api.put(`/cards/${card.id}`, payload);
      
      if (field === 'title') setTitle(response.data.title);
      if (field === 'description') setDescription(response.data.description);
      if (field === 'due_date') {
        setDueDate(
          response.data.due_date ? new Date(response.data.due_date).toISOString().split('T')[0] : ''
        );
      }
    } catch (err) {
      console.error(`Error updating card ${field}:`, err);
    }
  };

  const handleDeleteCard = async () => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;

    try {
      await api.delete(`/cards/${card.id}`);
      onClose();
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const handleAddTag = async (tagName, tagColor) => {
    if (!tagName.trim()) return;

    try {
      const response = await api.post(`/cards/${card.id}/tags`, {
        name: tagName,
        color: tagColor,
      });
      setTags(response.data.tags);
      setNewTagName('');
      setShowAddTag(false);
    } catch (err) {
      console.error('Error adding tag:', err);
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      const response = await api.delete(`/cards/${card.id}/tags/${tagId}`);
      setTags(response.data.tags);
    } catch (err) {
      console.error('Error detaching tag:', err);
    }
  };

  const handleToggleMember = async (memberId) => {
    const isAssigned = members.some(m => m.id === memberId);
    const action = isAssigned ? 'unassign' : 'assign';

    try {
      const response = await api.post(`/cards/${card.id}/assign`, {
        member_id: memberId,
        action: action
      });
      setMembers(response.data.members);
    } catch (err) {
      console.error('Error assigning member:', err);
    }
  };

  const isOverdue = () => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return due < now;
  };

  return (
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div class="flex items-start justify-between border-b border-slate-800/80 pb-4 mb-6">
          <div class="flex-1 mr-4">
            {isEditingTitle ? (
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => {
                    setIsEditingTitle(false);
                    handleUpdateField('title', title);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingTitle(false);
                      handleUpdateField('title', title);
                    }
                  }}
                  class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xl font-bold text-slate-100 outline-none w-full focus:border-indigo-500"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    setIsEditingTitle(false);
                    handleUpdateField('title', title);
                  }}
                  class="p-2 bg-slate-850 hover:bg-slate-800 rounded-xl text-emerald-400"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <h2 
                onClick={() => setIsEditingTitle(true)}
                class="text-2xl font-extrabold text-slate-100 hover:text-indigo-400 cursor-pointer transition-colors"
                title="Double click to edit title"
              >
                {title}
              </h2>
            )}
          </div>
          
          <button 
            onClick={onClose}
            class="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scroll Container */}
        <div class="flex-1 overflow-y-auto space-y-6 pr-2">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column - Details */}
            <div class="md:col-span-2 space-y-6">
              
              {/* Description */}
              <div class="space-y-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Description
                </h4>
                {isEditingDesc ? (
                  <div class="space-y-3">
                    <textarea
                      rows="4"
                      placeholder="Add a detailed description for this task card..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-sm text-slate-200 placeholder-slate-600 transition-all resize-none"
                      autoFocus
                    />
                    <div class="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEditingDesc(false);
                          handleUpdateField('description', description);
                        }}
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingDesc(false)}
                        class="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingDesc(true)}
                    class="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850 p-4 rounded-2xl cursor-pointer min-h-[100px] text-sm text-slate-300 leading-relaxed transition-all"
                    title="Click to edit description"
                  >
                    {description ? description : <span className="text-slate-600 italic">No description added yet. Click to write details.</span>}
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div class="space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-indigo-500" />
                  Tags / Labels
                </h4>
                <div class="flex flex-wrap gap-2 items-center">
                  {tags.map(tag => (
                    <span 
                      key={tag.id}
                      className="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5"
                      style={{ 
                        backgroundColor: `${tag.color}15`, 
                        borderColor: `${tag.color}35`, 
                        color: tag.color 
                      }}
                    >
                      {tag.name}
                      <button 
                        onClick={() => handleRemoveTag(tag.id)}
                        class="hover:bg-slate-800/80 p-0.5 rounded-full text-slate-500 hover:text-slate-200 transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  
                  <button
                    onClick={() => setShowAddTag(!showAddTag)}
                    class="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border border-dashed border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-950/10 text-slate-400 hover:text-indigo-400 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Tag
                  </button>
                </div>

                {/* Create Tag Drawer */}
                {showAddTag && (
                  <div class="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl space-y-4">
                    <div class="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Tag name (e.g. Bug, Urg)"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        class="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-xs text-slate-200"
                      />
                      <div class="flex items-center gap-2">
                        <label class="text-xs text-slate-400">Color:</label>
                        <input
                          type="color"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                          class="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    {/* Presets */}
                    <div class="flex flex-wrap gap-2 items-center">
                      <span class="text-[10px] uppercase font-bold text-slate-500 mr-1">Presets:</span>
                      {PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAddTag(preset.name, preset.color)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg border hover:scale-105 transition-transform"
                          style={{ 
                            backgroundColor: `${preset.color}15`, 
                            borderColor: `${preset.color}35`, 
                            color: preset.color 
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>

                    <div class="flex justify-end gap-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => setShowAddTag(false)}
                        class="px-3 py-1.5 rounded-lg border border-slate-900 text-slate-400 text-xs hover:bg-slate-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddTag(newTagName, newTagColor)}
                        class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                      >
                        Save Custom
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Controls & Actions */}
            <div class="space-y-6 md:border-l md:border-slate-800/80 md:pl-6">
              
              {/* Due Date */}
              <div class="space-y-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Due Date
                </h4>
                <div class="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      handleUpdateField('due_date', e.target.value);
                    }}
                    class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-xs text-slate-200 cursor-pointer"
                  />
                </div>
                {dueDate && isOverdue() && (
                  <div class="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Overdue Task!</span>
                  </div>
                )}
              </div>

              {/* Members Assign */}
              <div class="space-y-2.5">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Assign Members
                </h4>
                <div class="max-h-[160px] overflow-y-auto space-y-1.5 border border-slate-850 p-3 rounded-2xl bg-slate-950/20">
                  {boardMembers.length === 0 ? (
                    <p class="text-slate-650 text-xs italic p-1">No board members yet. Invite them in the board view.</p>
                  ) : (
                    boardMembers.map(member => {
                      const isAssigned = members.some(m => m.id === member.id);
                      return (
                        <div 
                          key={member.id}
                          onClick={() => handleToggleMember(member.id)}
                          class={`flex items-center justify-between p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-200 select-none ${
                            isAssigned 
                              ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-200' 
                              : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div class="flex items-center gap-2">
                            <div class="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                              {member.name.charAt(0)}
                            </div>
                            <span class="truncate max-w-[110px]">{member.name}</span>
                          </div>
                          {isAssigned && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Actions */}
              <div class="pt-4 border-t border-slate-800/60">
                <button
                  onClick={handleDeleteCard}
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/15 text-rose-400 font-semibold text-xs transition-all active:scale-[0.98]"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Card
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
