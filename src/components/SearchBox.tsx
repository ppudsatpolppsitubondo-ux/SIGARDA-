'use client'

import { Search, Filter, FileText } from 'lucide-react'
import { useState } from 'react'

interface SearchBoxProps {
  onSearch: (query: string, type: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('Semua')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, type)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-yellow-500/50 group-focus-within:text-yellow-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari sanksi atau larangan (cth: 'limbah', 'parkir')..."
          className="w-full h-16 pl-14 pr-32 rounded-2xl glass text-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all placeholder:text-white/20"
        />
        <button 
          type="submit"
          className="absolute right-3 top-3 bottom-3 px-8 btn-gold rounded-xl flex items-center gap-2"
        >
          CARI
        </button>
      </form>
      
      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="text-white/40 flex items-center gap-1"><Filter size={14} /> Filter Kategori:</span>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          {['Semua', 'Perda', 'Perbup'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 rounded-md transition-all ${
                type === t ? 'bg-[#4B5320] text-white shadow-lg' : 'text-white/40 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
