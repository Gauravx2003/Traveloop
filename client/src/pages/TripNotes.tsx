import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Loader2, ArrowLeft, FileText, Clock, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

interface TripNote {
  id: number;
  tripId: number;
  stopId: number | null;
  content: string;
  createdAt: string;
}

const TripNotes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/trips/notes/${id}`);
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/trips/notes`, {
        tripId: parseInt(id as string),
        content: newNote
      });
      // Add to top of list since they are sorted by desc
      setNotes([res.data, ...notes]);
      setNewNote('');
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      setNotes(notes.filter(n => n.id !== noteId));
      await api.delete(`/trips/notes/${noteId}`);
    } catch (err) {
      alert("Failed to delete note");
      fetchNotes(); // Revert on error
    }
  };

  const handleEditSave = async (noteId: number) => {
    if (!editContent.trim()) return;
    try {
      const res = await api.put(`/trips/notes/${noteId}`, { content: editContent });
      setNotes(notes.map(n => n.id === noteId ? res.data : n));
      setEditingNoteId(null);
    } catch (err) {
      alert("Failed to update note");
    }
  };

  const startEdit = (note: TripNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-indigo-600"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <Link to={`/trips/${id}/itinerary`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Itinerary
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> Trip Notes & Reminders
          </h1>
          <p className="text-sm text-gray-500 mt-1">Keep track of local contacts, check-in info, or general thoughts.</p>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="mb-10 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a quick reminder... (e.g., Hotel Check-in at 3 PM, Local guide: +1 234 567 890)"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[100px]"
            required
          />
          <div className="mt-3 flex justify-end">
            <button type="submit" disabled={isSubmitting || !newNote.trim()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors shadow-sm">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Note
            </button>
          </div>
        </form>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notes yet.</p>
              <p className="text-sm text-gray-400 mt-1">Add your first reminder above!</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <div className="flex items-center text-xs font-medium text-gray-400 gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(note.createdAt).toLocaleString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingNoteId !== note.id && (
                      <button onClick={() => startEdit(note)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(note.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingNoteId === note.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px] text-gray-800"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingNoteId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => handleEditSave(note.id)} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5">
                        <Save className="w-4 h-4" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TripNotes;
