'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Save, Plus, Trash2, Library, BookText, Bookmark } from 'lucide-react';

interface Book {
  title: string;
  author: string;
  status: 'Want to Read' | 'Reading' | 'Finished';
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = 'planning-books';

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    setLoading(true);
    const { data: metadata, error } = await supabase
      .from('opus_metadata')
      .select('value')
      .eq('key', storageKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching books:', error);
    } else if (metadata?.value) {
      setBooks(metadata.value.books || []);
    }
    setLoading(false);
  }

  async function saveBooks(newBooks: Book[]) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('opus_metadata')
      .upsert({
        user_id: user.id,
        key: storageKey,
        value: { books: newBooks },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,key' });

    if (error) {
      console.error('Error saving books:', error);
    }
    setSaving(false);
  }

  const addBook = () => {
    const newBooks: Book[] = [...books, { title: '', author: '', status: 'Want to Read' }];
    setBooks(newBooks);
  };

  const updateBook = (index: number, field: keyof Book, value: string) => {
    const newBooks = [...books];
    newBooks[index] = { ...newBooks[index], [field]: value };
    setBooks(newBooks);
  };

  const removeBook = (index: number) => {
    const newBooks = books.filter((_, i) => i !== index);
    setBooks(newBooks);
    saveBooks(newBooks);
  };

  const getStatusStyle = (status: Book['status']) => {
    switch (status) {
      case 'Finished': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Reading': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto bg-[#fdfdfd] min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00326b] flex items-center justify-center shadow-xl shadow-[#00326b]/20">
              <Library className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#00326b] tracking-tight uppercase leading-none mb-1">Library Registry</h1>
              <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase">Official Literary Pursuit & Reading Log</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/planning" className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#00326b]/10 rounded-full font-bold text-[#00326b] hover:bg-[#00326b]/5 transition-all shadow-sm">
            <ChevronLeft size={20} />
            Back
          </Link>
          <button 
            onClick={() => saveBooks(books)}
            disabled={saving}
            className="group flex items-center gap-3 px-8 py-2 bg-[#00326b] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-[#0a2f5f] transition-all disabled:opacity-50 shadow-xl shadow-[#00326b]/20"
          >
            <Save size={18} className="group-hover:scale-110 transition-transform" />
            {saving ? 'Syncing...' : 'Save Registry'}
          </button>
        </div>
      </header>

      <section className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl overflow-hidden mb-12">
        <div className="bg-[#00326b] p-8 text-white relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black tracking-widest uppercase mb-1">Book Wishlist & Progress</h2>
              <p className="text-xs text-white/50 font-bold uppercase">Tracking {books.filter(b => b.status === 'Finished').length} Completed Works</p>
            </div>
            <BookOpen className="opacity-20" size={40} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-5 pointer-events-none font-black select-none">BOOKS</div>
        </div>

        {loading ? (
          <div className="p-20 text-center opacity-20 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00326b]"></div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em]">Opening Archive...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-10">Literary Title</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Author / Creator</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Reading Status</th>
                  <th className="p-6 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {books.map((book, index) => (
                  <tr key={index} className="group hover:bg-[#f8fafc] transition-colors">
                    <td className="p-4 pl-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-white group-hover:text-[#00326b] transition-all shadow-inner border border-transparent group-hover:border-gray-100">
                          <BookText size={20} />
                        </div>
                        <input 
                          type="text" 
                          value={book.title} 
                          onChange={(e) => updateBook(index, 'title', e.target.value)}
                          placeholder="Enter book title..."
                          className="w-full bg-transparent border-none focus:ring-0 font-black text-[#0a2f5f] placeholder:text-gray-100 text-lg"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={book.author} 
                        onChange={(e) => updateBook(index, 'author', e.target.value)}
                        placeholder="Author's name..."
                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-500 placeholder:text-gray-100"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <select 
                          value={book.status} 
                          onChange={(e) => updateBook(index, 'status', e.target.value as Book['status'])}
                          className={`px-4 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer ${getStatusStyle(book.status)}`}
                        >
                          <option>Want to Read</option>
                          <option>Reading</option>
                          <option>Finished</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 pr-10 text-right">
                      <button 
                        onClick={() => removeBook(index)}
                        className="p-2 text-gray-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Remove Entry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="p-8">
                    <button 
                      onClick={addBook}
                      className="group w-full py-6 border-4 border-dashed border-gray-50 rounded-[2rem] text-gray-200 font-black uppercase tracking-[0.3em] text-xs hover:border-[#00326b]/10 hover:text-[#00326b]/30 hover:bg-[#00326b]/5 transition-all flex items-center justify-center gap-4"
                    >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                      Add New Literary Record
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#FFC68D]/10 p-10 rounded-[3rem] border-2 border-[#FFC68D]/20 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC68D]/20 flex items-center justify-center text-[#00326b] group-hover:-rotate-6 transition-transform">
              <Bookmark size={20} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00326b]/60">Currently Reading</h4>
          </div>
          <p className="text-[#00326b] font-serif italic text-xl leading-relaxed">
            {books.find(b => b.status === 'Reading')?.title || 'No active book selected.'}
          </p>
        </div>
        <div className="bg-[#FFA1AB]/10 p-10 rounded-[3rem] border-2 border-[#FFA1AB]/20 flex items-center justify-center text-center">
          <div>
            <div className="text-4xl font-black text-[#00326b] mb-1">{books.filter(b => b.status === 'Finished').length}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00326b]/40">Books Completed</div>
          </div>
        </div>
      </div>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">Literary Pursuit Registry © 2026</p>
      </footer>
    </div>
  );
}
