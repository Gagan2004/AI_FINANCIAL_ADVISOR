"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, MessageSquare, Send,
  PieChart as PieChartIcon, LayoutDashboard, History, Settings,
  Bell, X, Loader2, Cpu, Cloud, ChevronLeft, ChevronRight, Sparkles,
  DollarSign, ArrowUpRight, ArrowDownRight, LogOut, User
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Rent: '#3b82f6',
  Salary: '#10b981',
  Entertainment: '#a855f7',
  Utilities: '#6366f1',
  Transport: '#ec4899',
  Other: '#64748b',
};

interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function Dashboard() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'ollama'>('gemini');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{email: string, full_name: string} | null>(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your FinSmart AI advisor. Ask me anything about your finances!", time: new Date() }
  ]);
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [newDescription, setNewDescription] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/');
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticating(false);
      fetchTransactions();
      fetchUserProfile();
    }
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      await api.get('/health');
      setUser({ email: 'demo@finsmart.com', full_name: 'Demo User' });
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleSend = async () => {
    if (!query.trim()) return;
    const userQuery = query;
    setMessages(prev => [...prev, { role: 'user', text: userQuery, time: new Date() }]);
    setQuery("");
    setIsTyping(true);
    
    try {
      const response = await api.post(`/chat?query=${encodeURIComponent(userQuery)}&provider=${aiProvider}`);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: response.data.advice, time: new Date() }]);
    } catch (error: any) {
      setIsTyping(false);
      if (error.response?.status === 401) {
        setMessages(prev => [...prev, { role: 'assistant', text: "Please log in to use the AI Advisor.", time: new Date() }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: `Sorry, I'm having trouble connecting to ${aiProvider}.`, time: new Date() }]);
      }
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/transactions/', {
        amount: parseFloat(newAmount),
        category: newCategory,
        description: newDescription,
        date: new Date().toISOString()
      });
      setIsModalOpen(false);
      setNewAmount("");
      setNewDescription("");
      fetchTransactions();
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const savings = income - expenses;
    const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, savings, balance };
  }, [transactions]);

  const barChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap: Record<string, { name: string, income: number, expense: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      dataMap[dayName] = { name: dayName, income: 0, expense: 0 };
    }
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const dayName = days[tDate.getDay()];
      if (dataMap[dayName]) {
        if (t.amount > 0) dataMap[dayName].income += t.amount;
        else dataMap[dayName].expense += Math.abs(t.amount);
      }
    });
    return Object.values(dataMap);
  }, [transactions]);

  const pieChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (isAuthenticating) {
    return (
      <div className="flex h-screen bg-slate-950 text-slate-50 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
            <div className="relative p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="animate-spin-slow w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-slate-400 text-sm">Loading FinSmart...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { icon: <History size={20} />, label: 'Transactions' },
    { icon: <PieChartIcon size={20} />, label: 'Budgeting' },
    { icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-[72px]' : 'w-64'} shrink-0 border-r border-slate-800/60 flex flex-col transition-all duration-300 ease-in-out relative group`}
        style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(9,11,17,0.98) 100%)' }}>
        
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white hover:border-brand-primary/50 transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-5 pb-6`}>
          <div className="relative shrink-0">
            <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-300">
              <div className="font-bold text-lg tracking-tight gradient-text">FinSmart AI</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Financial Advisor</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <NavItem 
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.label}
              collapsed={isCollapsed}
              onClick={() => setActiveTab(item.label)}
            />
          ))}
        </nav>

        {/* Balance Widget */}
        {!isCollapsed && (
          <div className="mx-3 mb-3 p-4 rounded-xl border border-slate-800/80 animate-in fade-in slide-in-from-bottom-2"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))' }}>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-semibold">Net Balance</div>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.balance >= 0 ? '+' : ''}${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}

        {/* User */}
        <div className={`p-4 border-t border-slate-800/60 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <User size={14} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <div className="text-xs font-semibold truncate">{user?.full_name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
            </div>
          )}
          {!isCollapsed && (
            <button onClick={handleLogout} title="Sign out" className="text-slate-500 hover:text-rose-400 transition-colors">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-5 border-b border-slate-800/60 shrink-0"
          style={{ background: 'rgba(9,11,17,0.8)', backdropFilter: 'blur(10px)' }}>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{activeTab}</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => alert("No new notifications")}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors relative"
            >
              <Bell size={18} className="text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-accent rounded-full" />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="shimmer-btn text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 text-sm"
            >
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard 
                  label="Total Income" 
                  value={`$${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  icon={<ArrowUpRight />}
                  color="#10b981"
                  gradient="from-emerald-500/10 to-transparent"
                />
                <StatCard 
                  label="Total Expenses"
                  value={`$${stats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  icon={<ArrowDownRight />}
                  color="#f43f5e"
                  gradient="from-rose-500/10 to-transparent"
                />
                <StatCard 
                  label="Monthly Savings"
                  value={`$${stats.savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  icon={<DollarSign />}
                  color={stats.savings >= 0 ? '#6366f1' : '#f43f5e'}
                  gradient={stats.savings >= 0 ? 'from-brand-primary/10 to-transparent' : 'from-rose-500/10 to-transparent'}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="lg:col-span-3 glow-card p-6 rounded-2xl border border-slate-800/60"
                  style={{ background: 'rgba(15,23,42,0.6)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Income vs Expenses</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-brand-primary inline-block" /><span>Income</span></span>
                      <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /><span>Expense</span></span>
                    </div>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                          itemStyle={{ color: '#f8fafc' }}
                          cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                        />
                        <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={24} />
                        <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-2 glow-card p-6 rounded-2xl border border-slate-800/60"
                  style={{ background: 'rgba(15,23,42,0.6)' }}>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-200">Spending by Category</h3>
                    <p className="text-xs text-slate-500 mt-0.5">All time breakdown</p>
                  </div>
                  {pieChartData.length > 0 ? (
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieChartData} cx="50%" cy="45%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '']}
                          />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-52 flex items-center justify-center text-slate-600 text-sm">No expense data yet</div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="glow-card p-6 rounded-2xl border border-slate-800/60 animate-in fade-in duration-700"
                style={{ background: 'rgba(15,23,42,0.6)' }}>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Recent Transactions</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Your latest activity</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('Transactions')}
                    className="text-brand-primary text-xs font-semibold hover:text-brand-secondary transition-colors flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-1">
                  {transactions.slice(0, 6).map(t => (
                    <TransactionRow key={t.id} transaction={t} />
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center text-slate-600 py-10 flex flex-col items-center space-y-2">
                      <DollarSign size={28} className="opacity-30" />
                      <p className="text-sm">No transactions yet. Add your first one!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'Transactions' && (
            <div className="glow-card p-6 rounded-2xl border border-slate-800/60 animate-in fade-in duration-500"
              style={{ background: 'rgba(15,23,42,0.6)' }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">All Transactions</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{transactions.length} total entries</p>
                </div>
                <button onClick={() => setIsModalOpen(true)}
                  className="shimmer-btn text-white px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 text-xs">
                  <Plus size={14} /><span>Add New</span>
                </button>
              </div>
              <div className="space-y-1">
                {transactions.map(t => <TransactionRow key={t.id} transaction={t} />)}
                {transactions.length === 0 && (
                  <div className="text-center text-slate-600 py-12 flex flex-col items-center space-y-2">
                    <History size={28} className="opacity-30" />
                    <p className="text-sm">No transactions found. Add your first one!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Budgeting Tab */}
          {activeTab === 'Budgeting' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="glow-card p-8 rounded-2xl border border-slate-800/60"
                style={{ background: 'rgba(15,23,42,0.6)' }}>
                <div className="mb-8">
                  <h3 className="text-lg font-bold">Monthly Budgets</h3>
                  <p className="text-slate-500 text-sm mt-1">Track your spending limits across categories.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <BudgetProgress label="Food & Dining" spent={stats.expenses * 0.3} limit={500} color="#f59e0b" />
                  <BudgetProgress label="Entertainment" spent={stats.expenses * 0.1} limit={200} color="#a855f7" />
                  <BudgetProgress label="Transportation" spent={stats.expenses * 0.15} limit={300} color="#ec4899" />
                  <BudgetProgress label="Utilities" spent={stats.expenses * 0.2} limit={400} color="#6366f1" />
                </div>
              </div>

              <div className="p-5 rounded-2xl border flex items-center justify-between"
                style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
                <div className="flex items-start space-x-3">
                  <Sparkles className="text-brand-primary mt-0.5 shrink-0" size={18} />
                  <div>
                    <h4 className="font-bold text-sm text-brand-primary mb-1">AI Insight</h4>
                    <p className="text-slate-300 text-sm">You're currently under budget for Food, but Rent has taken up 45% of your income.</p>
                  </div>
                </div>
                <button className="shimmer-btn text-white px-4 py-2 rounded-lg text-sm font-medium shrink-0 ml-4">
                  Adjust Limits
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'Settings' && (
            <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-right-4 duration-500">
              <div className="glow-card p-8 rounded-2xl border border-slate-800/60 space-y-8"
                style={{ background: 'rgba(15,23,42,0.6)' }}>
                <div>
                  <h3 className="text-xl font-bold">Settings</h3>
                  <p className="text-slate-500 text-sm mt-1">Manage your account and preferences.</p>
                </div>
                
                <section className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Profile Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</div>
                      <div className="font-semibold text-sm">{user?.full_name}</div>
                    </div>
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/60">
                      <div className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">Email</div>
                      <div className="font-semibold text-sm">{user?.email}</div>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AI Preferences</h4>
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/60">
                    <div>
                      <div className="text-sm font-medium">Default AI Provider</div>
                      <div className="text-xs text-slate-500 mt-0.5">Choose your preferred AI advisor</div>
                    </div>
                    <select 
                      value={aiProvider} 
                      onChange={(e) => setAiProvider(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-primary transition-colors"
                    >
                      <option value="gemini">Gemini 2.5 Flash</option>
                      <option value="ollama">Ollama (Local)</option>
                    </select>
                  </div>
                </section>

                <button className="w-full shimmer-btn text-white font-medium py-3 rounded-xl transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Advisor Chat Sidebar */}
      <aside className="w-80 shrink-0 border-l border-slate-800/60 flex flex-col"
        style={{ background: 'rgba(9,11,17,0.9)' }}>
        {/* Chat Header */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">FinSmart Advisor</h3>
              <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>Online</span>
              </p>
            </div>
          </div>
          
          {/* Provider Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/60">
            <button 
              onClick={() => setAiProvider('gemini')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                aiProvider === 'gemini' ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
              style={aiProvider === 'gemini' ? { background: 'linear-gradient(135deg, #6366f1, #a855f7)' } : {}}
            >
              <Cloud size={12} />
              <span>Gemini</span>
            </button>
            <button 
              onClick={() => setAiProvider('ollama')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                aiProvider === 'ollama' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Cpu size={12} />
              <span>Ollama</span>
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'text-white rounded-tr-none' 
                  : 'bg-slate-800/80 text-slate-100 rounded-tl-none'
              }`}
              style={m.role === 'user' ? { background: 'linear-gradient(135deg, #6366f1, #a855f7)' } : {}}>
                {m.text}
              </div>
              <span className="text-[9px] text-slate-600 mt-1 px-1">
                {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-slate-800/80 px-4 py-3 rounded-2xl rounded-tl-none flex space-x-1">
                <span className="typing-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
                <span className="typing-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
                <span className="typing-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Ask ${aiProvider === 'gemini' ? 'Gemini' : 'Ollama'}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all placeholder:text-slate-600"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1.5 p-1.5 rounded-lg text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
            >
              <Send size={14} />
            </button>
          </div>
          <div className="mt-1.5 text-[9px] text-center text-slate-600">
            {aiProvider === 'ollama' ? '⚡ Running locally via llama3.1:8b' : '✦ Powered by Google Gemini 2.5 Flash'}
          </div>
        </div>
      </aside>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute -inset-0.5 rounded-2xl opacity-40"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', filter: 'blur(1px)' }} />
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/80">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-800/60"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), transparent)' }}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                    <Plus size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Add Transaction</h3>
                    <p className="text-xs text-slate-500">Record income or expense</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} 
                  className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-all">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Amount <span className="normal-case font-normal text-slate-600">(negative for expense)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input 
                      type="number" step="0.01" required placeholder="0.00"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all"
                  >
                    <option value="Food">🍔 Food</option>
                    <option value="Rent">🏠 Rent</option>
                    <option value="Salary">💰 Salary</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Utilities">⚡ Utilities</option>
                    <option value="Transport">🚗 Transport</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description</label>
                  <input 
                    type="text" required placeholder="What was this for?"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder:text-slate-600"
                  />
                </div>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="shimmer-btn w-full text-white font-semibold py-3.5 rounded-xl flex items-center justify-center mt-2 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Transaction'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, collapsed = false, onClick }: { 
  icon: any, label: string, active?: boolean, collapsed?: boolean, onClick?: () => void 
}) {
  return (
    <div 
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`relative flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        active 
          ? 'text-white' 
          : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
      style={active ? { background: 'rgba(99,102,241,0.12)' } : {}}
    >
      {active && <div className="nav-active-bar" />}
      <div className={`shrink-0 ${active ? 'text-brand-primary' : ''}`}>{icon}</div>
      {!collapsed && (
        <span className="text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, gradient }: { 
  label: string, value: string, icon: React.ReactNode, color: string, gradient: string 
}) {
  return (
    <div className={`glow-card relative overflow-hidden p-6 rounded-2xl border border-slate-800/60 bg-gradient-to-br ${gradient}`}
      style={{ background: `linear-gradient(135deg, ${color}08, transparent)`, borderColor: `${color}15` }}>
      <div className="absolute top-4 right-4 opacity-20 [&>svg]:w-10 [&>svg]:h-10" style={{ color }}>
        {icon}
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">{label}</div>
      <div className="text-3xl font-bold tracking-tight" style={{ color: label === 'Total Expenses' ? '#f43f5e' : label === 'Total Income' ? '#10b981' : color }}>
        {value}
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isPositive = transaction.amount > 0;
  const catColor = CATEGORY_COLORS[transaction.category] || '#64748b';
  const formattedAmount = isPositive 
    ? `+$${transaction.amount.toFixed(2)}`
    : `-$${Math.abs(transaction.amount).toFixed(2)}`;

  return (
    <div className="flex items-center px-3 py-3 hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer group">
      <div className={`w-9 h-9 flex items-center justify-center rounded-xl mr-3 shrink-0`}
        style={{ background: `${catColor}15`, color: catColor }}>
        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-slate-100 truncate">{transaction.description || "No description"}</div>
        <div className="flex items-center space-x-2 mt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
            style={{ color: catColor, background: `${catColor}15` }}>
            {transaction.category}
          </span>
          <span className="text-[10px] text-slate-600">{new Date(transaction.date).toLocaleDateString()}</span>
        </div>
      </div>
      <div className={`text-sm font-bold ml-3 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {formattedAmount}
      </div>
    </div>
  );
}

function BudgetProgress({ label, spent, limit, color }: { label: string, spent: number, limit: number, color: string }) {
  const percentage = Math.min(Math.round((spent / limit) * 100), 100);
  const isOver = percentage >= 90;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-sm font-semibold text-slate-200">{label}</div>
          <div className="text-xs text-slate-500 mt-0.5">${spent.toFixed(0)} <span className="text-slate-700">of</span> ${limit}</div>
        </div>
        <div className={`text-sm font-bold ${isOver ? 'text-rose-400' : 'text-slate-400'}`}>{percentage}%</div>
      </div>
      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ 
            width: `${percentage}%`, 
            background: isOver ? '#f43f5e' : color,
            boxShadow: `0 0 8px ${isOver ? '#f43f5e' : color}60`
          }} 
        />
      </div>
    </div>
  );
}
