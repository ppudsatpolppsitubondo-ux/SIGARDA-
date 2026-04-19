'use client'

import { useState } from 'react'
import { FileText, Download, ChevronRight } from 'lucide-react'
import { Article, Regulation } from '@/types'
import { createClient } from '@/lib/supabase'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface ResultCardProps {
  regulation: Regulation;
  articles: Article[];
  onUpdate: () => void;
}

export default function ResultCard({ regulation, articles, onUpdate }: ResultCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const exportToPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(regulation.title, 10, 10)
    doc.setFontSize(12)
    doc.text(`Tentang: ${regulation.tentang}`, 10, 20)
    
    const tableData = articles.map((a, i) => [
      i + 1,
      a.pasal,
      a.type,
      a.content
    ])

    ;(doc as any).autoTable({
      startY: 30,
      head: [['No', 'Pasal', 'Jenis', 'Isi']],
      body: tableData,
      styles: { overflow: 'linebreak' },
      columnStyles: { 3: { cellWidth: 100 } }
    })

    doc.save(`Analisis_${regulation.id}.pdf`)
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('articles')
        .update({ content: editContent })
        .eq('id', id)
      
      if (error) throw error
      setEditingId(null)
      onUpdate()
    } catch (err) {
      console.error('Save error:', err)
      alert('Gagal menyimpan perubahan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all group">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest">{regulation.type}</span>
            <h3 className="text-xl font-bold leading-tight group-hover:text-yellow-500 transition-colors uppercase">
              {regulation.title}
            </h3>
          </div>
          <button 
            onClick={exportToPdf}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            title="Export ke PDF"
          >
            <Download size={20} className="text-yellow-500" />
          </button>
        </div>
        
        <p className="text-white/60 text-sm italic">{regulation.tentang}</p>

        <div className="space-y-3 pt-2">
          {articles.map((art) => (
            <div key={art.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#4B5320] text-xs px-2 py-0.5 rounded font-bold uppercase">{art.pasal}</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-tighter">{art.type}</span>
                </div>
                {editingId !== art.id ? (
                  <button 
                    onClick={() => {
                      setEditingId(art.id)
                      setEditContent(art.content)
                    }}
                    className="text-[10px] text-yellow-500/50 hover:text-yellow-500 underline uppercase"
                  >
                    Edit
                  </button>
                ) : (
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleSave(art.id)}
                        disabled={saving}
                        className="text-[10px] text-green-500 hover:text-green-400 font-bold uppercase"
                      >
                        {saving ? 'Saving...' : 'Simpan'}
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase"
                      >
                        Batal
                      </button>
                   </div>
                )}
              </div>
              
              {editingId === art.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  rows={4}
                />
              ) : (
                <p className="text-sm line-clamp-3 group-hover:line-clamp-none transition-all">
                  {art.content}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {regulation.pdf_url && (
        <a 
          href={regulation.pdf_url} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-between p-4 bg-white/5 border-t border-white/5 hover:bg-[#4B5320]/20 transition-all"
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-yellow-500" />
            <span className="text-xs font-medium">Buka PDF Dokumen Asli</span>
          </div>
          <ChevronRight size={16} className="text-white/20" />
        </a>
      )}
    </div>
  )
}
