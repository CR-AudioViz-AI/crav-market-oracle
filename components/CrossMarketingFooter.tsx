'use client'

import { Sparkles, Image, FileText, Globe, TrendingUp, Palette } from 'lucide-react'

interface CrossMarketingFooterProps {
  currentApp?: string
}

const APPS = [
  { id: 'logo-studio', name: 'Logo Studio', icon: <Palette className="w-4 h-4" />, url: 'https://javarilogo.com/brand', color: 'from-violet-500 to-purple-500' },
  { id: 'social-graphics', name: 'Social Graphics', icon: <Image className="w-4 h-4" />, url: 'https://craudiovizai.com/apps/social-graphics', color: 'from-pink-500 to-rose-500' },
  { id: 'invoice-generator', name: 'Invoices', icon: <FileText className="w-4 h-4" />, url: 'https://craudiovizai.com/apps/invoice-generator', color: 'from-emerald-500 to-green-500' },
  { id: 'market-oracle', name: 'Market Oracle', icon: <TrendingUp className="w-4 h-4" />, url: 'https://craudiovizai.com/apps/market-oracle', color: 'from-cyan-500 to-blue-500' },
]

export default function CrossMarketingFooter({ currentApp = '' }: CrossMarketingFooterProps) {
  const filteredApps = APPS.filter(a => a.id !== currentApp).slice(0, 4)
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-700">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium hidden sm:inline">CR AudioViz AI</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {filteredApps.map(app => (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg whitespace-nowrap"
                >
                  <div className={`w-6 h-6 rounded bg-gradient-to-br ${app.color} flex items-center justify-center`}>
                    {app.icon}
                  </div>
                  <span className="text-sm">{app.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
