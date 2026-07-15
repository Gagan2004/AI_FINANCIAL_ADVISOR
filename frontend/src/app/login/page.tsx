"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Wallet, Loader2, Mail, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen bg-slate-950 text-slate-50 items-center justify-center font-sans px-4 overflow-hidden">
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-orb-drift absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="animate-float absolute top-1/4 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />
        <div className="animate-float-delayed absolute bottom-0 left-1/3 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Glass Card */}
      <div className="relative w-full max-w-md animate-slide-up">
        {/* Glowing border wrapper */}
        <div className="absolute -inset-0.5 rounded-2xl opacity-30"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', filter: 'blur(1px)' }} />
        
        <div className="relative glass p-8 rounded-2xl border border-slate-800/80">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {/* Pulse ring */}
              <div className="animate-pulse-glow absolute inset-0 rounded-xl bg-brand-primary/20" />
              <div className="relative p-3.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight gradient-text">FinSmart AI</h1>
              <Sparkles size={16} className="text-brand-secondary" />
            </div>
            <p className="text-slate-400 text-sm text-center">Your intelligent financial companion</p>
          </div>

          <h2 className="text-lg font-semibold mb-6 text-slate-200">Welcome back</h2>

          {error && (
            <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder:text-slate-600"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <a href="#" className="text-xs text-brand-primary hover:text-brand-secondary transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="shimmer-btn w-full text-white font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <span className="text-white/60">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-primary font-semibold hover:text-brand-secondary transition-colors">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
