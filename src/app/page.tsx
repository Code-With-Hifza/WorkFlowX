import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Users,
  Kanban,
  CreditCard,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Database,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              WX
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              WorkFlowX
            </span>
            <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Multi-Tenant SaaS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-8 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Security • Isolated Multi-Tenancy • RBAC</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Orchestrate Engineering Projects at{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Enterprise Scale
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            WorkFlowX is an all-in-one multi-tenant SaaS project management platform built for modern engineering organizations. Isolated workspaces, real-time Kanban boards, role-based governance, and Stripe billing.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition-all"
            >
              Explore Live Demo
            </Link>
          </div>

          {/* Key Infrastructure Highlights */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
              <Database className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="font-semibold text-white">Neon PostgreSQL</h3>
              <p className="text-xs text-slate-400 mt-1">Drizzle ORM schema with strict server-side tenant isolation.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
              <Zap className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-semibold text-white">Redis & Workers</h3>
              <p className="text-xs text-slate-400 mt-1">BullMQ background queue processing and rate limiting.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
              <Kanban className="w-6 h-6 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-white">Real-Time Kanban</h3>
              <p className="text-xs text-slate-400 mt-1">Socket.IO drag-and-drop collaboration with optimistic updates.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
              <CreditCard className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-semibold text-white">Stripe Billing</h3>
              <p className="text-xs text-slate-400 mt-1">Tiered subscription plans with usage limit enforcement.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 WorkFlowX Platform Inc. Built with Next.js, Drizzle & PostgreSQL.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-slate-400 transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
