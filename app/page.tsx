"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Guardamos los datos de la sesión iniciada
        localStorage.setItem('usuario_id', data.user.id);
        localStorage.setItem('usuario_nombre', data.user.nombre);
        localStorage.setItem('usuario_rol', data.user.rol);
        localStorage.setItem('inspector_id_activo', data.user.id);

        const rol = data.user.rol;
        if (rol === 'ADMIN') {
          router.push('/admin');
        } else if (rol === 'INSPECTOR_TEMP') {
          router.push('/temperatura');
        } else {
          // Pasamos el ID real en la URL para que la página de inspectora cargue su cuenta exacta
          router.push(`/inspector?id=${data.user.id}`);
        }
      } else {
        setError(data.message || data.error || 'ID o contraseña incorrectos');
      }
    } catch (err: unknown) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6">
        
        {/* LOGO DE RICO FARMS (REEMPLAZANDO EL CUADRO 'RF') */}
        <div className="text-center space-y-2">
          <div className="inline-block p-3 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm mb-1">
            <img 
              src="/logo.png" 
              alt="Logo Rico Farms" 
              className="h-14 w-auto object-contain mx-auto"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Rico Farms — Control de Calidad</h1>
          <p className="text-xs text-slate-500">Inicia sesión con tu ID de empleado</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="text-slate-700 block mb-1 font-bold">ID de Empleado (001, 002, 003, 004, 100)</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 z-10" />
              <input 
                type="text" 
                value={id} 
                onChange={(e) => setId(e.target.value)} 
                placeholder="Ingresa tu ID" 
                required
                className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-bold">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 z-10" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required
                className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black transition shadow-md text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}