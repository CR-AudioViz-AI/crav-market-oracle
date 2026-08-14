// app/help/page.tsx - Help Documentation Landing Page
import Link from 'next/link';
import { Book, Target, TrendingUp, BarChart3, Brain, Shield, Mail, ArrowRight } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-b border-slate-800 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-4">
            <Book className="w-12 h-12 text-cyan-400" />
            Market Oracle Help Center
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Everything you need to understand AI-powered stock predictions and make the most of Market Oracle
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          
          {/* Getting Started */}
          <Link 
            href="/help/getting-started"
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500 transition-all hover:scale-105 group"
          >
            <Target className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
              Getting Started
            </h3>
            <p className="text-slate-400 mb-4">
              New to Market Oracle? Start here for a complete walkthrough of features and navigation.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
              Read Guide <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* How It Works */}
          <Link 
            href="/help/how-it-works"
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-green-500 transition-all hover:scale-105 group"
          >
            <TrendingUp className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">
              How It Works
            </h3>
            <p className="text-slate-400 mb-4">
              Understand how 5 AI models compete, generate picks, and how we track performance.
            </p>
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
              Learn More <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* AI Models */}
          <Link 
            href="/help/ai-models"
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500 transition-all hover:scale-105 group"
          >
            <Brain className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
              AI Models Guide
            </h3>
            <p className="text-slate-400 mb-4">
              Deep dive into GPT-4, Claude, Gemini, Perplexity, and Javari - their strengths and strategies.
            </p>
            <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
              Explore AIs <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Understanding Picks */}
          <Link 
            href="/help/understanding-picks"
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-yellow-500 transition-all hover:scale-105 group"
          >
            <BarChart3 className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
              Understanding Picks
            </h3>
            <p className="text-slate-400 mb-4">
              Learn what confidence scores, entry/target prices, stop-loss levels, and directions mean.
            </p>
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
              Decode Data <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* FAQ */}
          <Link 
            href="/help/faq"
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-all hover:scale-105 group"
          >
            <Shield className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
              FAQ
            </h3>
            <p className="text-slate-400 mb-4">
              Frequently asked questions about safety, accuracy, pricing, and using AI predictions responsibly.
            </p>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
              View FAQ <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Contact Support */}
          <a 
            href="https://craudiovizai.com/support"
            target="_blank"
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500 transition-all hover:scale-105 group"
          >
            <Mail className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
              Contact Support
            </h3>
            <p className="text-slate-400 mb-4">
              Can't find what you're looking for? Get personalized help from our support team.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
              Get Help <ArrowRight className="w-4 h-4" />
            </div>
          </a>
        </div>

        {/* Video Tutorial Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4">📹 Video Tutorials (Coming Soon)</h2>
          <p className="text-slate-400 mb-6">
            Watch step-by-step video guides covering everything from basic navigation to advanced strategies.
          </p>
          <div className="bg-slate-800 rounded-lg h-64 flex items-center justify-center text-slate-500">
            Video tutorials will be added here
          </div>
        </div>

        {/* Explore More Section */}
        <div className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border border-slate-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">🚀 Explore More CR AudioViz AI Tools</h2>
          <p className="text-slate-300 mb-6">
            Market Oracle is just one of 60+ professional AI-powered tools from CR AudioViz AI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="https://craudiovizai.com/tools/javari"
              target="_blank"
              className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 transition-colors border border-slate-700"
            >
              <p className="font-bold text-white mb-1">Javari AI Assistant</p>
              <p className="text-sm text-slate-400">Your autonomous development partner</p>
            </a>
            <a 
              href="https://craudiovizai.com/tools"
              target="_blank"
              className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 transition-colors border border-slate-700"
            >
              <p className="font-bold text-white mb-1">60+ Professional Tools</p>
              <p className="text-sm text-slate-400">Design, audio, video, business tools</p>
            </a>
            <a 
              href="https://craudiovizai.com/javariverse"
              target="_blank"
              className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 transition-colors border border-slate-700"
            >
              <p className="font-bold text-white mb-1">Javariverse</p>
              <p className="text-sm text-slate-400">Virtual world with 20 social impact modules</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
