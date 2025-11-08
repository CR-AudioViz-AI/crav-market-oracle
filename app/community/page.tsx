'use client'

import { useEffect, useState, useRef } from 'react'
import { MessageCircle, Users, Send } from 'lucide-react'

const CHAT_ROOMS = [
  { id: 'general', name: 'General', description: 'General discussion' },
  { id: 'ai-picks', name: 'AI Picks', description: 'Discuss AI stock picks' },
  { id: 'paper-trading', name: 'Paper Trading', description: 'Share your trades' },
  { id: 'memes', name: 'Memes', description: 'Stock memes & fun' }
]

export default function CommunityPage() {
  const [selectedRoom, setSelectedRoom] = useState('general')
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [username] = useState('Guest' + Math.floor(Math.random() * 1000))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const demoMessages: any = {
      'general': [
        { id: 1, user: 'TraderJoe', message: 'Anyone following Javari AI picks?', timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: 2, user: 'StockGuru', message: 'Yeah! Got 3 winners this week', timestamp: new Date(Date.now() - 240000).toISOString() }
      ],
      'ai-picks': [
        { id: 1, user: 'AIEnthusiast', message: 'Claude has been killing it lately', timestamp: new Date(Date.now() - 180000).toISOString() }
      ],
      'paper-trading': [
        { id: 1, user: 'PaperChamp', message: 'Up 25% this month!', timestamp: new Date(Date.now() - 120000).toISOString() }
      ],
      'memes': [
        { id: 1, user: 'MemeKing', message: 'When your AI pick goes up 50% 🚀', timestamp: new Date(Date.now() - 60000).toISOString() }
      ]
    }
    setMessages(demoMessages[selectedRoom] || [])
  }, [selectedRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    if (!newMessage.trim()) return
    
    const message = {
      id: Date.now(),
      user: username,
      message: newMessage,
      timestamp: new Date().toISOString()
    }
    
    setMessages([...messages, message])
    setNewMessage('')
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">Community</span>
        </h1>
        <p className="text-xl text-slate-300">Connect with traders and discuss AI picks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Chat Rooms
            </h3>
            <div className="space-y-2">
              {CHAT_ROOMS.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all $${
                    selectedRoom === room.id
                      ? 'bg-brand-cyan/20 border border-brand-cyan/50'
                      : 'bg-slate-800/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-xs text-slate-400">{room.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col" style={{ height: '600px' }}>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-cyan to-blue-500 flex items-center justify-center text-sm font-bold">
                      {msg.user[0]}
                    </div>
                    <span className="font-semibold">{msg.user}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{msg.message}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-cyan"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-2 bg-gradient-to-r from-brand-cyan to-blue-500 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
