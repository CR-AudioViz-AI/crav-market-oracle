'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles, Image, FileText, Globe, QrCode, BarChart3,
  Wine, CreditCard, Plane, Palette, Layers, Wand2,
  ArrowRight, ExternalLink, Check, Star, Zap, Link2,
  ChevronRight, Clock, TrendingUp, Users, Package
} from 'lucide-react'

interface EcosystemApp {
  id: string
  name: string
  shortName: string
  description: string
  icon: React.ReactNode
  color: string
  gradient: string
  url: string
  category: 'brand' | 'content' | 'business' | 'analytics' | 'discovery'
  status: 'active' | 'coming-soon'
  integrations: string[]
  features: string[]
}

interface CrossAppSuggestion {
  id: string
  fromApp: string
  toApp: string
  action: string
  benefit: string
  icon: React.ReactNode
}

const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: 'logo-studio',
    name: 'Logo Studio Pro',
    shortName: 'Logo Studio',
    description: 'AI-powered logo and brand identity creation',
    icon: <Palette className="w-5 h-5" />,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    url: 'https://javarilogo.com/brand',
    category: 'brand',
    status: 'active',
    integrations: ['social-graphics', 'invoice-generator', 'website-builder', 'qr-generator'],
    features: ['AI Logo Generation', 'Brand Kit', 'Mockups', 'Variations']
  },
  {
    id: 'social-graphics',
    name: 'Social Graphics Creator',
    shortName: 'Social Graphics',
    description: 'Create stunning social media content',
    icon: <Image className="w-5 h-5" />,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    url: 'https://craudiovizai.com/apps/social-graphics',
    category: 'content',
    status: 'active',
    integrations: ['logo-studio', 'website-builder', 'qr-generator'],
    features: ['Templates', 'AI Captions', 'Scheduler', 'Multi-Platform']
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    shortName: 'Invoices',
    description: 'Professional invoicing and billing',
    icon: <FileText className="w-5 h-5" />,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-500',
    url: 'https://craudiovizai.com/apps/invoice-generator',
    category: 'business',
    status: 'active',
    integrations: ['logo-studio', 'qr-generator'],
    features: ['Templates', 'Auto-Calculate', 'PDF Export', 'Payment Links']
  },
  {
    id: 'website-builder',
    name: 'Website Builder',
    shortName: 'Websites',
    description: 'Build beautiful websites in minutes',
    icon: <Globe className="w-5 h-5" />,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    url: 'https://craudiovizai.com/apps/builder',
    category: 'content',
    status: 'active',
    integrations: ['logo-studio', 'social-graphics', 'qr-generator'],
    features: ['Drag & Drop', 'Templates', 'SEO Tools', 'Analytics']
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    shortName: 'QR Codes',
    description: 'Dynamic QR codes with analytics',
    icon: <QrCode className="w-5 h-5" />,
    color: 'orange',
    gradient: 'from-orange-500 to-amber-500',
    url: 'https://craudiovizai.com/apps/qr-generator',
    category: 'business',
    status: 'active',
    integrations: ['website-builder', 'social-graphics', 'invoice-generator'],
    features: ['Dynamic QR', 'Analytics', 'Custom Design', 'Bulk Generate']
  },
  {
    id: 'market-oracle',
    name: 'Market Oracle',
    shortName: 'Market Oracle',
    description: 'AI stock and crypto predictions',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'cyan',
    gradient: 'from-cyan-500 to-teal-500',
    url: 'https://craudiovizai.com/apps/market-oracle',
    category: 'analytics',
    status: 'active',
    integrations: [],
    features: ['AI Predictions', 'Real-time Data', 'Portfolio Tracking', 'Alerts']
  },
  {
    id: 'javarispirits',
    name: 'Javari Spirits',
    shortName: 'Spirits',
    description: 'Discover premium spirits and whiskeys',
    icon: <Wine className="w-5 h-5" />,
    color: 'amber',
    gradient: 'from-amber-600 to-orange-600',
    url: 'https://javarispirits.vercel.app',
    category: 'discovery',
    status: 'active',
    integrations: [],
    features: ['Discovery', 'Reviews', 'Collections', 'Recommendations']
  },
  {
    id: 'javaricards',
    name: 'Javari Cards',
    shortName: 'Cards',
    description: 'Trading card collection manager',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'red',
    gradient: 'from-red-500 to-rose-500',
    url: 'https://javaricards.vercel.app',
    category: 'discovery',
    status: 'active',
    integrations: [],
    features: ['Collection', 'Valuation', 'Trading', 'Wishlist']
  },
  {
    id: 'orlando-deals',
    name: 'Orlando Trip Deals',
    shortName: 'Travel',
    description: 'Find the best Orlando vacation deals',
    icon: <Plane className="w-5 h-5" />,
    color: 'sky',
    gradient: 'from-sky-500 to-blue-500',
    url: 'https://orlando-trip-deals.vercel.app',
    category: 'discovery',
    status: 'active',
    integrations: [],
    features: ['Deals', 'Packages', 'Hotels', 'Tickets']
  }
]

const CROSS_APP_SUGGESTIONS: CrossAppSuggestion[] = [
  {
    id: '1',
    fromApp: 'logo-studio',
    toApp: 'invoice-generator',
    action: 'Add your logo to invoices',
    benefit: 'Professional branded invoices in seconds',
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: '2',
    fromApp: 'logo-studio',
    toApp: 'social-graphics',
    action: 'Use brand kit in social posts',
    benefit: 'Consistent branding across all platforms',
    icon: <Image className="w-4 h-4" />
  },
  {
    id: '3',
    fromApp: 'logo-studio',
    toApp: 'website-builder',
    action: 'Add logo to your website',
    benefit: 'Instant brand recognition',
    icon: <Globe className="w-4 h-4" />
  },
  {
    id: '4',
    fromApp: 'website-builder',
    toApp: 'qr-generator',
    action: 'Create QR for your website',
    benefit: 'Drive traffic from print materials',
    icon: <QrCode className="w-4 h-4" />
  },
  {
    id: '5',
    fromApp: 'social-graphics',
    toApp: 'qr-generator',
    action: 'Add QR to social graphics',
    benefit: 'Connect offline to online seamlessly',
    icon: <Link2 className="w-4 h-4" />
  },
  {
    id: '6',
    fromApp: 'invoice-generator',
    toApp: 'qr-generator',
    action: 'Add payment QR to invoices',
    benefit: 'Faster payments via mobile scan',
    icon: <Zap className="w-4 h-4" />
  }
]

interface EcosystemHubProps {
  currentApp?: string
  variant?: 'full' | 'compact' | 'suggestions'
  maxSuggestions?: number
}

export default function EcosystemHub({ 
  currentApp = '', 
  variant = 'full',
  maxSuggestions = 3
}: EcosystemHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'All Apps', icon: Package },
    { id: 'brand', name: 'Brand', icon: Palette },
    { id: 'content', name: 'Content', icon: Image },
    { id: 'business', name: 'Business', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'discovery', name: 'Discovery', icon: Star },
  ]

  const filteredApps = ECOSYSTEM_APPS.filter(
    app => selectedCategory === 'all' || app.category === selectedCategory
  )

  const relevantSuggestions = CROSS_APP_SUGGESTIONS.filter(
    s => s.fromApp === currentApp || s.toApp === currentApp || !currentApp
  ).slice(0, maxSuggestions)

  // Compact variant - just app icons in a row
  if (variant === 'compact') {
    return (
      <div className="bg-gray-800/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium">CR AudioViz AI Ecosystem</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ECOSYSTEM_APPS.filter(a => a.id !== currentApp).slice(0, 6).map(app => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center hover:scale-110 transition-transform`}
              title={app.name}
            >
              {app.icon}
            </a>
          ))}
          <button className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // Suggestions variant - show cross-app suggestions
  if (variant === 'suggestions') {
    if (relevantSuggestions.length === 0) return null
    
    return (
      <div className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="font-medium">Power Up Your Workflow</span>
        </div>
        <div className="space-y-2">
          {relevantSuggestions.map(suggestion => {
            const toApp = ECOSYSTEM_APPS.find(a => a.id === suggestion.toApp)!
            return (
              <a
                key={suggestion.id}
                href={toApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${toApp.gradient} flex items-center justify-center`}>
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{suggestion.action}</p>
                  <p className="text-xs text-gray-400">{suggestion.benefit}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </a>
            )
          })}
        </div>
      </div>
    )
  }

  // Full variant - complete ecosystem view
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">CR AudioViz AI Ecosystem</h2>
            <p className="text-sm text-gray-400">{ECOSYSTEM_APPS.length} integrated apps working together</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map(app => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative p-4 bg-gray-800 hover:bg-gray-750 rounded-xl transition-all group ${
                app.id === currentApp ? 'ring-2 ring-violet-500' : ''
              }`}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center flex-shrink-0`}>
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{app.shortName}</h3>
                    {app.id === currentApp && (
                      <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded">Current</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{app.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Integration badges */}
              {app.integrations.length > 0 && (
                <div className="mt-3 flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Connects with {app.integrations.length} apps
                  </span>
                </div>
              )}

              {/* Features on hover */}
              {hoveredApp === app.id && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {app.features.map(feature => (
                    <span key={feature} className="px-2 py-0.5 bg-gray-700 text-xs text-gray-300 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Cross-App Suggestions */}
      {relevantSuggestions.length > 0 && (
        <div className="p-4 border-t border-gray-800">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Suggested Integrations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {relevantSuggestions.map(suggestion => {
              const fromApp = ECOSYSTEM_APPS.find(a => a.id === suggestion.fromApp)!
              const toApp = ECOSYSTEM_APPS.find(a => a.id === suggestion.toApp)!
              return (
                <div key={suggestion.id} className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${fromApp.gradient} flex items-center justify-center`}>
                    {fromApp.icon}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${toApp.gradient} flex items-center justify-center`}>
                    {toApp.icon}
                  </div>
                  <p className="text-xs text-gray-400 flex-1">{suggestion.action}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
