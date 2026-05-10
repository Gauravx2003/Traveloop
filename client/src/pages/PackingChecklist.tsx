import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Loader2, ArrowLeft, CheckSquare, Square, Trash2, Plus, RotateCcw } from 'lucide-react';

interface PackingItem {
  id: number;
  item: string;
  isPacked: boolean;
  category: string;
}

const CATEGORIES = ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'General'];

const PackingChecklist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await api.get(`/trips/${id}/packing`);
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch packing list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [id]);

  const toggleItem = async (itemId: number, currentStatus: boolean) => {
    try {
      setItems(items.map(i => i.id === itemId ? { ...i, isPacked: !currentStatus } : i));
      await api.patch(`/trips/packing/${itemId}`, { isPacked: !currentStatus });
    } catch (err) {
      // Revert on error
      setItems(items.map(i => i.id === itemId ? { ...i, isPacked: currentStatus } : i));
    }
  };

  const deleteItem = async (itemId: number) => {
    try {
      setItems(items.filter(i => i.id !== itemId));
      await api.delete(`/trips/packing/${itemId}`);
    } catch (err) {
      fetchItems();
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/trips/${id}/packing`, {
        item: newItem,
        category: newCategory
      });
      setItems([...items, res.data]);
      setNewItem('');
    } catch (err) {
      console.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetList = async () => {
    if (!window.confirm('Are you sure you want to uncheck all items?')) return;
    try {
      setItems(items.map(i => ({ ...i, isPacked: false })));
      await api.patch(`/trips/${id}/packing/reset`, {});
    } catch (err) {
      fetchItems();
    }
  };

  // Group items by category
  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, PackingItem[]>);

  // Put any custom categories under 'General'
  items.forEach(item => {
    if (!CATEGORIES.includes(item.category)) {
      if (!groupedItems['General']) groupedItems['General'] = [];
      if (!groupedItems['General'].find(i => i.id === item.id)) {
        groupedItems['General'].push(item);
      }
    }
  });

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-indigo-600"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  }

  const packedCount = items.filter(i => i.isPacked).length;
  const progress = items.length === 0 ? 0 : Math.round((packedCount / items.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <Link to={`/trips/${id}/itinerary`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Itinerary
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Packing Checklist</h1>
            <p className="text-sm text-gray-500 mt-1">Don't forget the essentials.</p>
          </div>
          {items.length > 0 && (
            <button onClick={resetList} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
              <RotateCcw className="w-4 h-4" /> Reset List
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-gray-700">Packing Progress</span>
            <span className="text-sm font-bold text-indigo-600">{packedCount} of {items.length} packed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add a new item..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button type="submit" disabled={isSubmitting || !newItem.trim()} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center font-medium transition-colors">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </button>
        </form>

        {/* Categories list */}
        {Object.entries(groupedItems).length === 0 ? (
           <div className="text-center py-10 text-gray-400 italic">Your packing list is empty. Add items above to get started!</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, catItems]) => (
              <div key={category} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 flex justify-between">
                    {category}
                    <span className="text-sm font-medium text-gray-500">
                      {catItems.filter(i => i.isPacked).length}/{catItems.length}
                    </span>
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {catItems.map(item => (
                    <div key={item.id} className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 ${item.isPacked ? 'opacity-60' : ''}`}>
                      <button 
                        onClick={() => toggleItem(item.id, item.isPacked)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        {item.isPacked ? (
                          <CheckSquare className="w-6 h-6 text-indigo-500 shrink-0" />
                        ) : (
                          <Square className="w-6 h-6 text-gray-300 shrink-0" />
                        )}
                        <span className={`text-base font-medium ${item.isPacked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {item.item}
                        </span>
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingChecklist;
