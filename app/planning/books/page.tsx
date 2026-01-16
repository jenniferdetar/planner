'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0f3d91]">Books to Read</h1>
          <p className="text-gray-600">Your reading wishlist and progress</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => saveBooks(books)}
            disabled={saving}
            className="px-6 py-2 bg-[#0f3d91] text-white rounded-full font-bold hover:bg-[#0a2f5f] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/planning" className="px-4 py-2 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition-all">
            Back
          </Link>
        </div>
      </header>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 italic">Loading your library...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Author</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {books.map((book, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <input 
                      type="text" 
                      value={book.title} 
                      onChange={(e) => updateBook(index, 'title', e.target.value)}
                      placeholder="Book Title"
                      className="w-full bg-transparent border-none focus:ring-0 font-medium text-gray-900 placeholder:text-gray-300"
                    />
                  </td>
                  <td className="p-4">
                    <input 
                      type="text" 
                      value={book.author} 
                      onChange={(e) => updateBook(index, 'author', e.target.value)}
                      placeholder="Author Name"
                      className="w-full bg-transparent border-none focus:ring-0 text-gray-600 placeholder:text-gray-300"
                    />
                  </td>
                  <td className="p-4">
                    <select 
                      value={book.status} 
                      onChange={(e) => updateBook(index, 'status', e.target.value as Book['status'])}
                      className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-[#0f3d91]"
                    >
                      <option>Want to Read</option>
                      <option>Reading</option>
                      <option>Finished</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => removeBook(index)}
                      className="text-red-300 hover:text-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="p-4">
                  <button 
                    onClick={addBook}
                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 font-bold hover:border-[#0f3d91] hover:text-[#0f3d91] transition-all"
                  >
                    + Add New Book
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
