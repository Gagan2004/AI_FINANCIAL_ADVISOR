"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  MessageSquare, 
  Send, 
  PieChart as PieChartIcon,
  LayoutDashboard,
  History,
  Settings,
  Bell,
  X,
  Loader2,
  Cpu,
  Cloud,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'ollama'>('gemini');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{email: string, full_name: string} | null>(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your FinSmart AI advisor. How can I help you with your finances today?" }
  ]);

  // Form State
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [newDescription, setNewDescription] = useState("");

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
      // In a real app, we'd have a /users/me endpoint. 
      // For now, we'll fetch the current user through a clever query or handle it via token.
      // Since our backend main.py doesn't have a direct /me, I'll add one or use a fallback.
      const response = await api.get('/health'); // Just to verify connection
      // We'll set a placeholder if the endpoint isn't there yet, or I'll add it to backend.
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
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setQuery("");
    
    try {
      const response = await api.post(`/chat?query=${encodeURIComponent(userQuery)}&provider=${aiProvider}`);
      setMessages(prev => [...prev, { role: 'assistant', text: response.data.advice }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      if (error.response?.status === 401) {
        setMessages(prev => [...prev, { role: 'assistant', text: "Please log in to use the AI Advisor." }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: `Sorry, I'm having trouble connecting to ${aiProvider}.` }]);
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

  // Memoized Stats
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const savings = income - expenses;
    const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, savings, balance };
  }, [transactions]);

  // Bar Chart Data (Last 7 days)
  const barChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap: Record<string, { name: string, income: number, expense: number }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
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

  // Pie Chart Data
  const pieChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (isAuthenticating) {
    return <div className="flex h-screen bg-slate-950 text-slate-50 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-slate-800 flex flex-col p-4 space-y-8 transition-all duration-300 ease-in-out relative group`}>
        {/* Collapse Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-2`}>
          <div className="bg-brand-primary p-2 rounded-lg shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && <h1 className="text-xl font-bold tracking-tight animate-in fade-in duration-300">FinSmart AI</h1>}
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={activeTab === 'Overview'} 
            collapsed={isCollapsed}
            onClick={() => setActiveTab('Overview')} 
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Transactions" 
            active={activeTab === 'Transactions'} 
            collapsed={isCollapsed}
            onClick={() => setActiveTab('Transactions')} 
          />
          <NavItem 
            icon={<PieChartIcon size={20} />} 
            label="Budgeting" 
            active={activeTab === 'Budgeting'} 
            collapsed={isCollapsed}
            onClick={() => setActiveTab('Budgeting')} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeTab === 'Settings'} 
            collapsed={isCollapsed}
            onClick={() => setActiveTab('Settings')} 
          />
        </nav>

        {!isCollapsed && (
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-sm text-slate-400 mb-1">Balance</div>
            <div className="text-2xl font-bold">${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-slate-400">Manage your finances with AI insights.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-white font-medium text-sm transition-colors"
            >
              Sign out
            </button>
            <button 
              onClick={() => alert("No new notifications")}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-slate-950"></span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all shadow-lg shadow-brand-primary/20"
            >
              <Plus size={20} />
              <span>Add Transaction</span>
            </button>
          </div>
        </header>

        {/* Conditional Tab Content */}
        {activeTab === 'Overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StatCard label="Total Income" value={`$${stats.income.toLocaleString()}`} trend="" up />
              <StatCard label="Total Expenses" value={`$${stats.expenses.toLocaleString()}`} trend="" up={false} />
              <StatCard label="Monthly Savings" value={`$${stats.savings.toLocaleString()}`} trend="" up={stats.savings >= 0} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-6">Income vs Expenses (7 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-6">Spending by Category</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm flex-1 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <button 
                  onClick={() => setActiveTab('Transactions')}
                  className="text-brand-primary text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {transactions.slice(0, 5).map(t => (
                  <TransactionRow 
                    key={t.id}
                    name={t.description || "No description"} 
                    date={new Date(t.date).toLocaleDateString()} 
                    amount={t.amount > 0 ? `+$${t.amount}` : `-$${Math.abs(t.amount)}`} 
                    category={t.category} 
                  />
                ))}
                {transactions.length === 0 && <div className="text-center text-slate-500 py-8">No transactions found.</div>}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Transactions' && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm flex-1 animate-in fade-in duration-500">
            <h3 className="text-xl font-bold mb-6">Full Transaction History</h3>
            <div className="space-y-2">
              {transactions.map(t => (
                <TransactionRow 
                  key={t.id}
                  name={t.description || "No description"} 
                  date={new Date(t.date).toLocaleDateString()} 
                  amount={t.amount > 0 ? `+$${t.amount}` : `-$${Math.abs(t.amount)}`} 
                  category={t.category} 
                />
              ))}
              {transactions.length === 0 && <div className="text-center text-slate-500 py-8">No transactions found.</div>}
            </div>
          </div>
        )}

        {activeTab === 'Budgeting' && (
          <div className="flex-1 space-y-8 animate-in fade-in duration-500">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-2">Monthly Budgets</h3>
              <p className="text-slate-400 mb-8">Track your spending limits across categories.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BudgetProgress label="Food & Dining" spent={stats.expenses * 0.3} limit={500} color="#6366f1" />
                <BudgetProgress label="Entertainment" spent={stats.expenses * 0.1} limit={200} color="#a855f7" />
                <BudgetProgress label="Transportation" spent={stats.expenses * 0.15} limit={300} color="#ec4899" />
                <BudgetProgress label="Utilities" spent={stats.expenses * 0.2} limit={400} color="#f59e0b" />
              </div>
            </div>

            <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg text-brand-primary">AI Insight</h4>
                <p className="text-slate-300">You're currently under budget for Food, but Rent has taken up 45% of your income.</p>
              </div>
              <button className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium">Adjust Limits</button>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="flex-1 max-w-2xl mx-auto w-full animate-in slide-in-from-right-4 duration-500">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-8">
              <h3 className="text-2xl font-bold">Settings</h3>
              
              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Profile Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Full Name</div>
                    <div className="font-medium">{user?.full_name}</div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Email</div>
                    <div className="font-medium">{user?.email}</div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">AI Preferences</h4>
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span>Default Advisor Provider</span>
                  <select 
                    value={aiProvider} 
                    onChange={(e) => setAiProvider(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-sm outline-none"
                  >
                    <option value="gemini">Gemini 1.5</option>
                    <option value="ollama">Ollama (Local)</option>
                  </select>
                </div>
              </section>

              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all">
                Update Profile
              </button>
            </div>
          </div>
        )}
      </main>

      {/* AI Advisor Chat Sidebar */}
      <aside className="w-80 border-l border-slate-800 bg-slate-900/30 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-brand-primary" size={24} />
            <h3 className="font-bold">FinSmart Advisor</h3>
          </div>
          
          {/* Provider Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setAiProvider('gemini')}
              className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                aiProvider === 'gemini' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Cloud size={14} />
              <span>Gemini</span>
            </button>
            <button 
              onClick={() => setAiProvider('ollama')}
              className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                aiProvider === 'ollama' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Cpu size={14} />
              <span>Ollama</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-brand-primary text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-100 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Ask ${aiProvider === 'gemini' ? 'Gemini' : 'Ollama'}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-primary transition-colors"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-2 p-1.5 bg-brand-primary rounded-lg text-white hover:bg-brand-primary/90 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-center text-slate-500 italic">
            {aiProvider === 'ollama' ? 'Running locally via llama3.1:8b' : 'Powered by Google Gemini 1.5 Flash'}
          </div>
        </div>
      </aside>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold">Add Transaction</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Amount (negative for expense)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="e.g. -50.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary transition-all"
                >
                  <option value="Food">Food</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="What was this for?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center mt-4"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, collapsed = false, onClick }: { icon: any, label: string, active?: boolean, collapsed?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3 px-4'} py-2.5 rounded-lg cursor-pointer transition-all ${
        active ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-slate-400 hover:text-slate-100'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>}
      {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 bg-brand-primary rounded-full"></div>}
    </div>
  );
}

function StatCard({ label, value, trend, up }: { label: string, value: string, trend: string, up: boolean }) {
  return (
    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {up ? <TrendingUp size={48} /> : <TrendingDown size={48} />}
      </div>
      <div className="text-slate-400 text-sm mb-2 font-medium">{label}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className={`text-sm flex items-center space-x-1 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
        <span>{trend}</span>
      </div>
    </div>
  );
}

function TransactionRow({ name, date, amount, category }: { name: string, date: string, amount: string, category: string }) {
  const isPositive = amount.startsWith('+');
  return (
    <div className="flex items-center p-3 hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg mr-4 ${
        isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
      }`}>
        {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-slate-100">{name}</div>
        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{category}</div>
      </div>
      <div className="text-right">
        <div className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-slate-100'}`}>{amount}</div>
        <div className="text-xs text-slate-500">{date}</div>
      </div>
    </div>
  );
}

function BudgetProgress({ label, spent, limit, color }: { label: string, spent: number, limit: number, color: string }) {
  const percentage = Math.min(Math.round((spent / limit) * 100), 100);
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-sm font-medium text-slate-200">{label}</div>
          <div className="text-xs text-slate-500">${spent.toFixed(0)} of ${limit} spent</div>
        </div>
        <div className="text-sm font-bold text-slate-300">{percentage}%</div>
      </div>
      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
        ></div>
      </div>
    </div>
  );
}
