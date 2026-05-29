import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Layout } from './components/Layout';
import { useAuth } from './context/AuthContext';
import { api, SOCKET_URL } from './lib/api';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Movements } from './pages/Movements';
import { Periods } from './pages/Periods';
import { SimpleSection } from './pages/SimpleSection';

export default function App(){const auth=useAuth();const [section,setSection]=useState('Dashboard');const [dashboard,setDashboard]=useState(null);async function loadDashboard(){const {data}=await api.get('/dashboard');setDashboard(data)}async function createMovement(payload){const {data}=await api.post('/movements',payload);setDashboard(data.dashboard)}useEffect(()=>{if(auth.authenticated)loadDashboard()},[auth.authenticated]);useEffect(()=>{if(!auth.authenticated)return;const socket=io(SOCKET_URL);socket.on('movement:created',({dashboard})=>setDashboard(dashboard));return()=>socket.disconnect()},[auth.authenticated]);if(!auth.authenticated)return <Login/>;return <Layout section={section} setSection={setSection}>{section==='Dashboard'&&<Dashboard data={dashboard} createMovement={createMovement}/>} {section==='Movimientos'&&<Movements/>}{section==='Períodos'&&<Periods/>}{section==='Admin'&&<Admin/>}{section==='Estadísticas'&&<SimpleSection title="Estadísticas mensuales"><p>El dashboard incluye resumen diario, semanal, mensual, ranking de responsables, efectivo y faltantes. Use los gráficos principales para seguimiento ejecutivo.</p></SimpleSection>}{section==='WhatsApp Sync'&&<SimpleSection title="Integración WhatsApp"><p>POST /api/bot/sync recibe comandos del bot Baileys y actualiza el panel por Socket.io. El bot debe compartir el archivo SQLite configurado en DATABASE_PATH.</p></SimpleSection>}</Layout>}
