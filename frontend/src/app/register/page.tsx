"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Wallet, Loader2, Mail, Lock, User, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/register', { email, full_name: fullName, password });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen bg-slate-950 text-slate-50 items-center justify-center font-sans px-4 overflow-hidden">
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float absolute top-10 right-10 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }} />
        <div className="animate-orb-drift absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="animate-float-delayed absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Glowing border */}
        <div className="absolute -inset-0.5 rounded-2xl opacity-30"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #6366f1)', filter: 'blur(1px)' }} />

        <div className="relative glass p-8 rounded-2xl border border-slate-800/80">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="animate-pulse-glow absolute inset-0 rounded-xl bg-brand-secondary/20" />
              <div className="relative p-3.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight gradient-text">FinSmart AI</h1>
              <Sparkles size={16} className="text-brand-accent" />
            </div>
            <p className="text-slate-400 text-sm text-center">Take control of your personal finances</p>
          </div>

          <h2 className="text-lg font-semibold mb-6 text-slate-200">Create your account</h2>

          {error && (
            <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-secondary transition-colors" />
                <input 
                  type="text" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/30 transition-all placeholder:text-slate-600"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-secondary transition-colors" />
                <input 
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/30 transition-all placeholder:text-slate-600"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-secondary transition-colors" />
                <input 
                  type="password" required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/30 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full text-white font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 mt-2 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><span>Create Account</span><span className="text-white/60">→</span></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-primary font-semibold hover:text-brand-secondary transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
