'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, ShoppingCart } from 'lucide-react'
import { getAllStockPicks } from '@/lib/supabase'
import { formatCurrency, calculateGainPercentage, formatPercentage, getAIColor } from '@/lib/utils'

export default function PaperTradingPage() {
  const [picks, setPicks] = useState<any[]>([])
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [balance, setBalance] = useState(10000)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const data = await getAllStockPicks()
      setPicks(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function buyStock(pick: any) {
    const cost = pick.entry_price * 10
    if (balance >= cost) {
      setBalance(balance - cost)
      setPortfolio([...portfolio, { ...pick, quantity: 10, buyPrice: pick.entry_price }])
    }
  }

  const totalValue = portfolio.reduce((sum, pos) => sum + (pos.target_price * pos.quantity), 0)
  const totalGain = totalValue - (10000 - balance)

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner"></div></div>
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-4">
          <DollarSign className="w-12 h-12 text-green-500" />
          <span className="gradient-text">Paper Trading</span>
        </h1>
        <p className="text-xl text-slate-300">Practice trading with $10,000 virtual money</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Cash Balance</p>
              <p className="text-4xl font-bold text-green-400">{formatCurrency(balance)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-brand-cyan/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Portfolio Value</p>
              <p className="text-4xl font-bold text-brand-cyan">{formatCurrency(totalValue)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-brand-cyan opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total P&L</p>
              <p className={`text-4xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalGain)}
              </p>
            </div>
            <TrendingUp className={`w-12 h-12 opacity-50 ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
        </div>
      </div>

      {portfolio.length > 0 && (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
          <h3 className="text-xl font-bold mb-4">Your Positions</h3>
          <div className="space-y-3">
            {portfolio.map((pos, i) => {
              const currentValue = pos.target_price * pos.quantity
              const costBasis = pos.buyPrice * pos.quantity
              const gain = ((currentValue - costBasis) / costBasis) * 100
              const colors = getAIColor(pos.ai_name)
              
              return (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}></div>
                    <div>
                      <p className="font-bold">{pos.symbol}</p>
                      <p className="text-sm text-slate-400">{pos.quantity} shares @ {formatCurrency(pos.buyPrice)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(currentValue)}</p>
                    <p className={`text-sm ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercentage(gain)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
        <h3 className="text-xl font-bold mb-4">Available Stocks to Trade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {picks.slice(0, 12).map(pick => {
            const colors = getAIColor(pick.ai_name)
            const canAfford = balance >= pick.entry_price * 10
            
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
                    <span className="text-slate-400">Entry:</span>
                    <span className="font-semibold">{formatCurrency(pick.entry_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target:</span>
                    <span className="font-semibold text-green-400">{formatCurrency(pick.target_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cost (10 shares):</span>
                    <span className="font-semibold">{formatCurrency(pick.entry_price * 10)}</span>
                  </div>
                </div>
                <button
                  onClick={() => buyStock(pick)}
                  disabled={!canAfford}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy 10 Shares
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
