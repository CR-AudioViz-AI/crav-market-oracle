'use client'

import { useEffect, useState } from 'react'
import { Star, Plus, X, TrendingUp } from 'lucide-react'
import { getAllStockPicks } from '@/lib/supabase'
import { formatCurrency, calculateGainPercentage, formatPercentage, getAIColor } from '@/lib/utils'

export default function WatchlistPage() {
  const [allPicks, setAllPicks] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const data = await getAllStockPicks()
      setAllPicks(data)
      setWatchlist(data.slice(0, 5))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function addToWatchlist(pick: any) {
    if (!watchlist.find(p => p.id === pick.id)) {
      setWatchlist([...watchlist, pick])
    }
  }

  function removeFromWatchlist(id: string) {
    setWatchlist(watchlist.filter(p => p.id !== id))
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner"></div></div>
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-4">
          <Star className="w-12 h-12 text-yellow-500" />
          <span className="gradient-text">Watchlist</span>
        </h1>
        <p className="text-xl text-slate-300">Keep track of your favorite AI stock picks</p>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
        <h3 className="text-xl font-bold mb-4">Your Watchlist ({watchlist.length} stocks)</h3>
        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No stocks in your watchlist yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {watchlist.map(pick => {
              const colors = getAIColor(pick.ai_name)
              const gain = calculateGainPercentage(pick.entry_price, pick.target_price)
              
              return (
                <div key={pick.id} className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}></div>
                    <div>
                      <h4 className="text-xl font-bold">{pick.symbol}</h4>
                      <p className="text-sm text-slate-400">{pick.ai_name} • {pick.confidence_score}% confidence</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Entry → Target</p>
                      <p className="font-semibold">{formatCurrency(pick.entry_price)} → {formatCurrency(pick.target_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Potential</p>
                      <p className={`font-bold text-lg ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercentage(gain)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromWatchlist(pick.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
        <h3 className="text-xl font-bold mb-4">Add to Watchlist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPicks
            .filter(p => !watchlist.find(w => w.id === p.id))
            .slice(0, 9)
            .map(pick => {
              const colors = getAIColor(pick.ai_name)
              const gain = calculateGainPercentage(pick.entry_price, pick.target_price)
              
              return (
                <div key={pick.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold">{pick.symbol}</h4>
                    <div className="px-2 py-1 rounded text-xs" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                      {pick.ai_name}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Potential:</span>
                      <span className={`font-bold ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercentage(gain)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="font-semibold">{pick.confidence_score}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToWatchlist(pick)}
                    className="w-full bg-gradient-to-r from-brand-cyan to-blue-500 hover:from-brand-cyan/80 hover:to-blue-500/80 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Watchlist
                  </button>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
