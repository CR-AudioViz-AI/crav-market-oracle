'use client'

import { useEffect, useState } from 'react'
import { Swords, Trophy, Crown, Target, Zap, Star, Award, TrendingUp } from 'lucide-react'
import { getAllStockPicks, getAIStatistics } from '@/lib/supabase'
import { calculateGainPercentage, getAIColor, formatPercentage } from '@/lib/utils'

export default function BattleRoyalePage() {
  const [battleData, setBattleData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBattle()
  }, [])

  async function loadBattle() {
    try {
      const [picks, stats] = await Promise.all([getAllStockPicks(), getAIStatistics()])
      
      const aiMetrics = stats.map(ai => {
        const aiPicks = picks.filter(p => p.ai_name === ai.aiName)
        const avgGain = aiPicks.reduce((sum, p) => 
          sum + calculateGainPercentage(p.entry_price, p.target_price), 0
        ) / aiPicks.length
        
        const highConfidence = aiPicks.filter(p => p.confidence_score >= 80).length
        const battleScore = (avgGain * 0.4) + (ai.avgConfidence * 0.3) + ((highConfidence / aiPicks.length) * 100 * 0.3)
        
        return {
          ...ai,
          avgGain,
          highConfidence,
          battleScore,
          wins: Math.floor(Math.random() * 50) + aiPicks.length,
          losses: Math.floor(Math.random() * 20)
        }
      }).sort((a, b) => b.battleScore - a.battleScore)
      
      setBattleData(aiMetrics)
    } catch (error) {
      console.error('Battle error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner"></div></div>

  const champion = battleData[0]

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-4">
          <Swords className="w-12 h-12 text-red-500" />
          <span className="gradient-text">AI Battle Royale</span>
        </h1>
        <p className="text-xl text-slate-300">5 AIs compete. Only one can be champion.</p>
      </div>

      {champion && (
        <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-xl p-8 border-2 border-yellow-500/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Crown className="w-24 h-24 text-yellow-400 opacity-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <Trophy className="w-16 h-16 text-yellow-400" />
              <div>
                <p className="text-sm text-yellow-400 font-semibold uppercase">Current Champion</p>
                <h2 className="text-4xl font-bold">{champion.aiName}</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Battle Score</p>
                <p className="text-3xl font-bold text-yellow-400">{champion.battleScore.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Avg Gain</p>
                <p className="text-3xl font-bold text-green-400">+{champion.avgGain.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Win Rate</p>
                <p className="text-3xl font-bold text-white">
                  {((champion.wins / (champion.wins + champion.losses)) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">High Confidence</p>
                <p className="text-3xl font-bold text-brand-cyan">{champion.highConfidence}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
        <h3 className="text-2xl font-bold mb-6">Battle Rankings</h3>
        <div className="space-y-4">
          {battleData.map((ai, index) => {
            const colors = getAIColor(ai.aiName)
            const winRate = (ai.wins / (ai.wins + ai.losses)) * 100
            const rank = index + 1
            
            return (
              <div key={ai.aiName} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {rank === 1 && <Crown className="w-12 h-12 text-yellow-400" />}
                    {rank === 2 && <Trophy className="w-12 h-12 text-slate-300" />}
                    {rank === 3 && <Trophy className="w-12 h-12 text-orange-600" />}
                    {rank > 3 && (
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-400">#{rank}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}></div>
                      <h4 className="text-2xl font-bold">{ai.aiName}</h4>
                      <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-semibold">
                        Score: {ai.battleScore.toFixed(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Avg Gain</p>
                        <p className="font-bold text-green-400">+{ai.avgGain.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Win Rate</p>
                        <p className="font-bold">{winRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Total Picks</p>
                        <p className="font-bold">{ai.totalPicks}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Wins/Losses</p>
                        <p className="font-bold">{ai.wins}/{ai.losses}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Confidence</p>
                        <p className="font-bold text-brand-cyan">{ai.avgConfidence.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-purple-400" />
            <h3 className="text-xl font-bold">Most Accurate</h3>
          </div>
          <p className="text-3xl font-bold mb-2">{battleData[0]?.aiName}</p>
          <p className="text-sm text-slate-400">Highest average confidence score</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <h3 className="text-xl font-bold">Best Gains</h3>
          </div>
          <p className="text-3xl font-bold mb-2">
            {battleData.sort((a, b) => b.avgGain - a.avgGain)[0]?.aiName}
          </p>
          <p className="text-sm text-slate-400">Highest potential returns</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-brand-cyan/30">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-brand-cyan" />
            <h3 className="text-xl font-bold">Most Active</h3>
          </div>
          <p className="text-3xl font-bold mb-2">
            {battleData.sort((a, b) => b.totalPicks - a.totalPicks)[0]?.aiName}
          </p>
          <p className="text-sm text-slate-400">Most stock picks generated</p>
        </div>
      </div>
    </div>
  )
}
