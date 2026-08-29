'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogIn, Lock, Mail, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Login failed.');
      }

      router.push('/org/acme-tech/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('secret123');
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'secret123' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Login failed.');
      }

      router.push('/org/acme-tech/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative selection:bg-blue-600 selection:text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 mx-auto mb-3 text-lg">
            WX
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to WorkFlowX
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your multi-tenant organization workspaces
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Quick-Login Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Demo Accounts
            </span>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Acme Tech
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              onClick={() => handleQuickDemoLogin('owner@acme.com')}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 transition-all flex items-center gap-2 group"
            >
              <UserCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <div className="truncate">
                <p className="font-semibold text-white truncate">Alex Vance</p>
                <p className="text-[10px] text-slate-500">Owner Role</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('hifza@workflowx.app')}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 transition-all flex items-center gap-2 group"
            >
              <UserCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="truncate">
                <p className="font-semibold text-white truncate">Hifza Khan</p>
                <p className="text-[10px] text-slate-500">Admin Role</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('sarah@acme.com')}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 transition-all flex items-center gap-2 group"
            >
              <UserCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="truncate">
                <p className="font-semibold text-white truncate">Sarah Connor</p>
                <p className="text-[10px] text-slate-500">Manager Role</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('ali@acme.com')}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 transition-all flex items-center gap-2 group"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="truncate">
                <p className="font-semibold text-white truncate">Ali Hassan</p>
                <p className="text-[10px] text-slate-500">Member Role</p>
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register Organization
          </Link>
        </p>
      </div>
    </div>
  );
}
