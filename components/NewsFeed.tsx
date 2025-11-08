'use client'

import { useState, useEffect } from 'react'
import { Newspaper, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react'

export function NewsFeed({ symbols }: { symbols?: string[] }) {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all')

  useEffect(() => {
    loadNews()
  }, [symbols])

  async function loadNews() {
    // Simulate news data
    const mockNews = [
      {
        id: 1,
        title: 'Major AI Breakthrough Could Impact Tech Stocks',
        source: 'TechCrunch',
        sentiment: 'positive',
        time: '2 hours ago',
        symbol: 'NVDA',
        url: '#'
      },
      {
        id: 2,
        title: 'Federal Reserve Signals Potential Rate Cuts',
        source: 'Bloomberg',
        sentiment: 'positive',
        time: '4 hours ago',
        symbol: null,
        url: '#'
      },
      {
        id: 3,
        title: 'Energy Sector Faces Headwinds Amid Supply Concerns',
        source: 'Reuters',
        sentiment: 'negative',
        time: '6 hours ago',
        symbol: 'XOM',
        url: '#'
      },
      {
        id: 4,
        title: 'Healthcare Stocks Rally on Positive Clinical Trial Results',
        source: 'MarketWatch',
        sentiment: 'positive',
        time: '8 hours ago',
        symbol: 'PFE',
        url: '#'
      },
      {
        id: 5,
        title: 'Tech Giants Report Strong Q4 Earnings',
        source: 'CNBC',
        sentiment: 'positive',
        time: '10 hours ago',
        symbol: 'AAPL',
        url: '#'
      }
    ]

    setNews(mockNews)
    setLoading(false)
  }

  const filteredNews = filter === 'all' ? news :
    news.filter(n => n.sentiment === filter)

  if (loading) {
    return <div className="animate-pulse bg-slate-800 rounded-xl h-96"></div>
  }

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-brand-cyan" />
          <h3 className="text-xl font-bold">Market News Feed</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'all' ? 'bg-brand-cyan text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('positive')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'positive' ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Positive
          </button>
          <button
            onClick={() => setFilter('negative')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'negative' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Negative
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNews.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-brand-cyan/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {item.sentiment === 'positive' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  {item.symbol && (
                    <span className="px-2 py-0.5 bg-brand-cyan/20 text-brand-cyan text-xs rounded font-semibold">
                      {item.symbol}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold mb-1 group-hover:text-brand-cyan transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 group-hover:text-brand-cyan transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
