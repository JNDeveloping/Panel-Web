import { useState } from 'react';
const types = ['entra','sale','parcial','ingreso','vacio'];
export function MovementForm({ onCreate }) {
  const [form, setForm] = useState({ type:'entra', responsible:'', amount:'', envelopes:'', note:'' });
  const set = (k,v) => setForm((f)=>({...f,[k]:v}));
  async function submit(e){ e.preventDefault(); await onCreate({ ...form, amount:Number(form.amount||0), envelopes:Number(form.envelopes||0) }); setForm({ type:'entra', responsible:'', amount:'', envelopes:'', note:'' }); }
  return <form onSubmit={submit} className="glass rounded-3xl p-6 grid md:grid-cols-6 gap-3"><select className="premium-input" value={form.type} onChange={e=>set('type',e.target.value)}>{types.map(t=><option key={t}>{t}</option>)}</select><input className="premium-input" placeholder="Responsable" value={form.responsible} onChange={e=>set('responsible',e.target.value)} required/><input className="premium-input" placeholder="Monto" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)}/><input className="premium-input" placeholder="Sobres" type="number" value={form.envelopes} onChange={e=>set('envelopes',e.target.value)}/><input className="premium-input" placeholder="Nota" value={form.note} onChange={e=>set('note',e.target.value)}/><button className="rounded-2xl bg-gradient-to-r from-cyan to-gold text-night font-bold px-5">Crear</button></form>
}
