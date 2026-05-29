import { BarChart3, Bot, History, LayoutDashboard, LogOut, Shield, WalletCards } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const nav = [
  ['Dashboard', LayoutDashboard], ['Movimientos', WalletCards], ['Períodos', History], ['Estadísticas', BarChart3], ['WhatsApp Sync', Bot], ['Admin', Shield]
];
export function Layout({ children, section, setSection }) {
  const { user, signOut } = useAuth();
  return <div className="min-h-screen lg:flex">
    <aside className="glass lg:fixed lg:inset-y-4 lg:left-4 lg:w-72 rounded-3xl p-5 m-4 lg:m-0">
      <div className="flex items-center gap-3 mb-8"><div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan to-gold grid place-items-center text-night font-black">S</div><div><h1 className="font-bold text-xl">Sobres Safe</h1><p className="text-slate-400 text-sm">Fintech control panel</p></div></div>
      <nav className="space-y-2">{nav.map(([label, Icon]) => <button key={label} onClick={() => setSection(label)} className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition ${section===label?'bg-cyan/15 text-cyan border border-cyan/25':'text-slate-300 hover:bg-white/5'}`}><Icon size={19}/>{label}</button>)}</nav>
      <div className="mt-8 rounded-2xl bg-white/5 p-4"><p className="text-sm text-slate-400">Sesión</p><p className="font-semibold">{user?.username}</p><button onClick={signOut} className="mt-4 flex items-center gap-2 text-rose-300"><LogOut size={16}/>Salir</button></div>
    </aside>
    <main className="flex-1 lg:ml-80 p-4 lg:p-8">{children}</main>
  </div>;
}
