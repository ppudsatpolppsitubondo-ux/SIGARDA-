'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import SearchBox from '@/components/SearchBox'
import ResultCard from '@/components/ResultCard'
import { RegulationWithArticles } from '@/types'
import { Loader2, ShieldCheck, Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export default function Home() {
  const [results, setResults] = useState<RegulationWithArticles[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [lastSearch, setLastSearch] = useState({ query: '', type: 'Semua' })
  const supabase = createClient()

  const handleSearch = async (query: string, type: string) => {
    setLoading(true)
    setHasSearched(true)
    setLastSearch({ query, type })
    
    try {
      let q = supabase
        .from('regulations')
        .select(`
          *,
          articles!inner(*)
        `)

      if (query.trim()) {
        q = q.textSearch('articles.fts', query.split(' ').join(' & '))
      }

      if (type !== 'Semua') {
        q = q.ilike('type', `%${type}%`)
      }

      const { data, error } = await q.limit(20)

      if (error) throw error
      setResults(data as any || [])
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    handleSearch(lastSearch.query, lastSearch.type)
  }

  const exportAllToPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Laporan Hasil Pencarian Peraturan', 10, 15)
    doc.setFontSize(10)
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 10, 22)

    let currentY = 30
    results.forEach((reg, idx) => {
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${idx + 1}. ${reg.title}`, 10, currentY)
      currentY += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Tentang: ${reg.tentang}`, 10, currentY, { maxWidth: 180 })
      currentY += 15
      
      const articles = reg.articles.map(a => [a.pasal, a.type, a.content])
      ;(doc as any).autoTable({
        startY: currentY,
        head: [['Pasal', 'Jenis', 'Isi']],
        body: articles,
        theme: 'striped',
        margin: { left: 15 },
        styles: { fontSize: 8 },
      })
      
      currentY = (doc as any).lastAutoTable.finalY + 10
    })

    doc.save('Hasil_Pencarian_SatpolPP.pdf')
  }

  return (
    <main className="container mx-auto px-4 py-12 md:py-24 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-center flex-col items-center gap-4">
           <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 shadow-[0_0_50px_rgba(255,215,0,0.1)]">
             <ShieldCheck size={48} className="text-yellow-500" />
           </div>
           <h2 className="text-yellow-500 font-bold tracking-[0.3em] uppercase text-sm">Satuan Polisi Pamong Praja</h2>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Sistem Informasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Peraturan Daerah</span>
        </h1>
        <p className="text-white/40 text-lg md:text-xl font-medium">
          Dapatkan akses cepat ke seluruh sanksi dan larangan Peraturan Daerah <br className="hidden md:block" /> Kabupaten Situbondo untuk efektivitas penegakan hukum.
        </p>
      </section>

      {/* Search Section */}
      <SearchBox onSearch={handleSearch} />

      {/* Results Section */}
      <section className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
            <p className="text-white/20 animate-pulse">Menelusuri ribuan pasal...</p>
          </div>
        ) : hasSearched ? (
          <>
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-2xl font-bold">
                Ditemukan <span className="text-yellow-500">{results.length}</span> Peraturan
              </h2>
              {results.length > 0 && (
                <button 
                  onClick={exportAllToPdf}
                  className="flex items-center gap-2 text-sm text-yellow-500 hover:text-white transition-colors"
                >
                  <Download size={16} /> Export Semua ke PDF
                </button>
              )}
            </div>
            
            {results.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {results.map((res) => (
                  <ResultCard 
                    key={res.id} 
                    regulation={res} 
                    articles={res.articles} 
                    onUpdate={handleRefresh}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass rounded-3xl">
                <p className="text-white/40 text-xl">Tidak ditemukan sanksi atau larangan yang sesuai.</p>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30">
             {[1,2,3].map(i => (
               <div key={i} className="h-48 glass rounded-2xl animate-pulse" />
             ))}
          </div>
        )}
      </section>
      
      <footer className="text-center pt-20 text-white/20 text-xs tracking-widest uppercase">
        &copy; 2026 Pemerintah Kabupaten Situbondo &bull; Satpol PP Digital System
      </footer>
    </main>
  )
}
