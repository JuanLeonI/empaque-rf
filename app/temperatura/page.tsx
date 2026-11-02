"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Thermometer, LogOut, CheckCircle2, User, ClipboardList, ShieldAlert, Edit3, Trash2, PlusCircle } from 'lucide-react';

interface TemperaturaRegistro {
  id: number;
  fecha: string;
  hora: string;
  producto: string;
  temperatura_c?: number;
  temperatura?: number;
  estado: string;
  observaciones: string;
}

const LISTA_PRODUCTOS_TEMPERATURA = [
  "Zucchini (Calabaza Italiana)",
  "Calabaza Amarilla",
  "Pepino",
  "Butternut",
  "Espagueti",
  "Delicata",
  "Acorn",
  "Kabocha",
  "--- PAUSADO / EXCEPCIÓN GENERAL ---"
];

export default function TemperaturaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const [usuarioInfo, setUsuarioInfo] = useState({ id: '004', nombre: 'Inspector de Temperatura' });
  const [registrosTemperatura, setRegistrosTemperatura] = useState<TemperaturaRegistro[]>([]);

  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    producto: '',
    temperatura_c: '' as unknown as number,
    estado: 'Normal',
    observaciones: ''
  });

  const cargarRegistros = useCallback(async () => {
    try {
      const res = await fetch('/api/temperatura');
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      if (Array.isArray(data)) {
        setRegistrosTemperatura(data);
      }
    } catch {
      console.error('Error al cargar registros de temperatura');
    }
  }, []);

  useEffect(() => {
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];
    const horaStr = hoy.toTimeString().split(' ')[0].substring(0, 5);

    const id = localStorage.getItem('usuario_id') || '004';
    const nombre = localStorage.getItem('usuario_nombre') || 'Control de Temperatura';

    setUsuarioInfo({ id, nombre });
    setFormData(prev => ({ ...prev, fecha: fechaStr, hora: horaStr }));
    cargarRegistros();
  }, [cargarRegistros]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.producto) {
      alert('Por favor selecciona un producto.');
      return;
    }

    setLoading(true);
    setMensaje(null);

    const payload = {
      ...formData,
      temperatura_c: formData.estado === 'Excepción (Sin Toma)' ? 0 : Number(formData.temperatura_c),
      temperatura: formData.estado === 'Excepción (Sin Toma)' ? 0 : Number(formData.temperatura_c)
    };

    try {
      const res = await fetch('/api/temperatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok && (data.success || res.status === 200 || res.status === 201)) {
        setMensaje({ tipo: 'exito', texto: '¡Registro de temperatura guardado exitosamente!' });
        setFormData(prev => ({
          ...prev,
          producto: '',
          temperatura_c: '' as unknown as number,
          estado: 'Normal',
          observaciones: ''
        }));
        cargarRegistros();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error: ' + (data.error || 'No se pudo guardar.') });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const eliminarRegistro = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      const res = await fetch(`/api/temperatura/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRegistrosTemperatura(prev => prev.filter(item => item.id !== id));
      }
    } catch {
      alert('Error al eliminar el registro.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-600 text-white p-3 rounded-xl shadow-sm">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900">Control de Temperatura — Rico Farms</h1>
              <div className="flex items-center gap-2 text-xs text-cyan-700 font-bold mt-0.5">
                <User className="w-3.5 h-3.5" /> Usuario Activo: {usuarioInfo.nombre} (ID {usuarioInfo.id})
              </div>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-xl border border-red-200 transition font-semibold cursor-pointer">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>

        {mensaje && (
          <div className={`p-4 rounded-xl text-xs font-bold text-center border ${mensaje.tipo === 'exito' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario Principal de Temperatura */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs font-semibold">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-500 block mb-1">Fecha</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:border-cyan-600" />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Hora</label>
              <input type="time" name="hora" value={formData.hora} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:border-cyan-600" />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Estado de Medición</label>
              <select name="estado" value={formData.estado} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-cyan-600">
                <option value="Normal">Normal</option>
                <option value="Fuera de Rango">Fuera de Rango</option>
                <option value="Excepción (Sin Toma)">Excepción (Sin Toma)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 block mb-1">Producto / Área</label>
              <select name="producto" value={formData.producto} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-cyan-600">
                <option value="">-- Seleccione Producto / Área --</option>
                {LISTA_PRODUCTOS_TEMPERATURA.map(prod => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-500 block mb-1 flex items-center gap-1 font-bold text-cyan-800">
                <Thermometer className="w-4 h-4 text-cyan-600" /> Temperatura (°C)
              </label>
              <input 
                type="number" 
                step="0.1" 
                name="temperatura_c" 
                placeholder={formData.estado === 'Excepción (Sin Toma)' ? 'No aplica' : 'Ej. 12.5'} 
                value={formData.temperatura_c || ''} 
                onChange={handleChange} 
                disabled={formData.estado === 'Excepción (Sin Toma)'}
                required={formData.estado !== 'Excepción (Sin Toma)'} 
                className="w-full bg-cyan-50/60 border border-cyan-300 rounded-xl p-3 text-cyan-900 font-black focus:outline-none focus:border-cyan-600 disabled:bg-slate-100 disabled:text-slate-400" 
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Observaciones</label>
            <textarea 
              name="observaciones" 
              placeholder="Ingrese notas o motivos en caso de excepción..." 
              value={formData.observaciones} 
              onChange={handleChange} 
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-cyan-600 resize-none"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-4 rounded-xl transition shadow-md text-sm flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50">
            <CheckCircle2 className="w-5 h-5" />
            {loading ? 'Guardando Registro...' : 'Guardar Temperatura'}
          </button>
        </form>

        {/* Historial de Registros */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Historial de Temperatura Registrada</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Fecha / Hora</th>
                  <th className="p-2.5">Producto / Área</th>
                  <th className="p-2.5">Temperatura</th>
                  <th className="p-2.5">Estado</th>
                  <th className="p-2.5">Observaciones</th>
                  <th className="p-2.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registrosTemperatura.length === 0 ? (
                  <tr><td colSpan={7} className="p-4 text-center text-slate-400 italic">No hay registros de temperatura guardados aún.</td></tr>
                ) : (
                  registrosTemperatura.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2.5 font-bold">#{item.id}</td>
                      <td className="p-2.5">{item.fecha?.split('T')[0]} ({item.hora})</td>
                      <td className="p-2.5 font-medium">{item.producto}</td>
                      <td className="p-2.5 font-black text-cyan-700">
                        {item.estado === 'Excepción (Sin Toma)' ? 'N/A' : `${item.temperatura_c ?? item.temperatura} °C`}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${item.estado === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {item.estado || 'Normal'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{item.observaciones || '---'}</td>
                      <td className="p-2.5 text-center">
                        <button onClick={() => eliminarRegistro(item.id)} className="text-red-500 hover:text-red-700 cursor-pointer" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}