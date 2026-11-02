"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, LogOut, RefreshCcw, Thermometer, AlertTriangle, Layers, Maximize2 } from 'lucide-react';

interface Inspeccion {
  id: number;
  fecha: string;
  hora: string;
  inspector_id: string;
  categoria: string;
  producto: string;
  variedad: string;
  etapa: string;
  cuadro: string;
  empaque: string;
  con_etiqueta: boolean;
  temperatura?: number | string;
  temperatura_c?: number | string;
  temp?: number | string;
  peso: number;
  peso_unidad: string;
  calidad: string;
  defecto: string;
  categoria_defecto: string;
  piezas_defecto: number;
  porcentaje_defecto: number;
  empacador_num: number;
  empacador_nombre: string;
  total_muestras: number;
  tamano_resumen?: string;
}

const CAT_EMPACADORES: Record<number, string> = {
  1: "RUTH NOHEMI DOMINGUEZ",
  2: "THOMAS MORENO",
  3: "OSCAR HERNANDEZ",
  4: "JUANITA GOMEZ",
  5: "MARIA LUISA LANDA",
  6: "JUAN VILLALBA",
  7: "YESSICA VILLALBA",
  8: "ROSARIO FUENTES",
  9: "MICAIA SANTIAGO",
  10: "JUAN CARLOS AGUSTIN",
  11: "RAUL SALAS",
  12: "FRANCISCO JAVIER TRUJILLO",
  13: "SERGIO ARAN RAMIREZ",
  14: "JACOBO HERNANDEZ LUNA",
  15: "LUIS ABRAHAM ALONSO",
  16: "MIGUEL JERONIMO ALVARO",
  17: "GERONIMA LOPEZ LOPEZ",
  18: "CESAR ARMANDO FLORES ALONSO",
  19: "ANDDY GUERRERA"
};

const DEFECTOS_SEGUNDA = [
  "NINGUNO", "LACRADO", "LACRADO #2", "COLOR BAJO CACHETEADO", "COLOR BAJO", 
  "DEFORME", "DAÑO X PROTUBERANCIA", "GOLPE #2", "DAÑO X HOJA", "PITTING #2", 
  "BAJO DIAMETRO", "BAJO COLOR", "FLOR EN FRUTA", "CURBO", "VIROSIS"
];

const DEFECTOS_REZAGA = [
  "NINGUNO", "PITTING", "AMARILLO CACHETEADO", "MALFORMACION", "LACRADO", 
  "DAÑO MECANICO", "DAÑO X PECIOLO", "DESHIDRATACION", "DEFORME", "PASADA", 
  "CUCHILLO", "PUDRICION", "DAÑO X PLAGA"
];

const TAMAÑOS_POR_PRODUCTO: Record<string, string[]> = {
  "Zucchini": ["X.FANCY", "FANCY", "MEDIUM", "LARGE", "X.LARGE"],
  "Calabaza Amarilla": ["X.FANCY", "FANCY", "MEDIUM", "LARGE", "MENOR A XF"],
  "Pepino": ["42", "36", "30", "24", "MENOR A 42"],
  "Butternut": ["STANDARD", "GRANEL"],
  "Espagueti": ["STANDARD", "GRANEL"],
  "Delicata": ["STANDARD", "GRANEL"],
  "Acorn": ["STANDARD", "GRANEL"],
  "Kabocha": ["STANDARD", "GRANEL"]
};

const CATALOGO_PRODUCTOS: Record<string, {
  categoria: 'Frescas' | 'Duras';
  variedades: string[];
  etapas: { nombre: string; cuadros: string[] }[];
  empaques: string[];
}> = {
  "Zucchini": {
    categoria: "Frescas",
    variedades: ["Alessandra"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["9-4", "9-5", "9-6", "9-7", "9-8"] },
      { nombre: "Etapa 2", cuadros: ["4", "5", "3-4", "3-5", "3-6"] },
      { nombre: "Etapa 3", cuadros: ["12-5", "12-6", "12-7", "12-8", "12-4"] }
    ],
    empaques: ["Rico Farms", "Sonoran Gold"]
  },
  "Calabaza Amarilla": {
    categoria: "Frescas",
    variedades: ["Grand Price"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["9-1", "9-2"] },
      { nombre: "Etapa 2", cuadros: ["3-1", "3-2", "6-3-1"] },
      { nombre: "Etapa 3", cuadros: ["12-1", "12-2"] }
    ],
    empaques: ["Rico Farms", "Sonoran Gold"]
  },
  "Pepino": {
    categoria: "Frescas",
    variedades: ["Azulán"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["8-1", "8-2", "8-3", "8-4", "8-5", "8-6"] },
      { nombre: "Etapa 2", cuadros: ["8-7", "8-8", "8-9"] }
    ],
    empaques: ["Rico Farms"]
  },
  "Butternut": {
    categoria: "Duras",
    variedades: ["Quantum"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["11-4", "11-5", "11-6", "11-7", "11-8", "11-9", "11-13"] }, 
      { nombre: "Etapa 2", cuadros: ["2-4", "2-5"] }, 
      { nombre: "Etapa 3", cuadros: ["2-6", "2-7", "2-8"] }
    ],
    empaques: ["Rico Farms / Duras"]
  },
  "Espagueti": {
    categoria: "Duras",
    variedades: ["Vegetal"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["11-10", "11-11", "11-12"] }, 
      { nombre: "Etapa 2", cuadros: ["15-3"] }, 
      { nombre: "Etapa 3", cuadros: ["2-9"] }, 
      { nombre: "Etapa 4", cuadros: ["3-8", "3-9"] }
    ],
    empaques: ["Rico Farms / Duras"]
  },
  "Delicata": {
    categoria: "Duras",
    variedades: ["Jounin"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["11-1", "11-2"] }, 
      { nombre: "Etapa 2", cuadros: ["2-1"] }, 
      { nombre: "Etapa 3", cuadros: ["3-7"] }
    ],
    empaques: ["Rico Farms / Duras"]
  },
  "Acorn": {
    categoria: "Duras",
    variedades: ["Autumn"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["2-2", "2-3"] }, 
      { nombre: "Etapa 2", cuadros: ["12-3"] }, 
      { nombre: "Etapa 3", cuadros: ["14-1"] }
    ],
    empaques: ["Rico Farms / Duras"]
  },
  "Kabocha": {
    categoria: "Duras",
    variedades: ["T-151"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["11-3", "2-10"] }, 
      { nombre: "Etapa 2", cuadros: ["14-1"] }, 
      { nombre: "Etapa 3", cuadros: ["3-10"] }
    ],
    empaques: ["Rico Farms / Duras"]
  }
};

export default function InspectorPage() {
  const router = useRouter();

  const [inspectorIdLogueado, setInspectorIdLogueado] = useState<string>("001");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificacion, setNotificacion] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const params = new URLSearchParams(window.location.search);
    const idUrl = params.get('id') || params.get('inspector');
    
    if (idUrl) {
      localStorage.setItem('inspector_id_activo', idUrl);
      setInspectorIdLogueado(idUrl);
    } else {
      const idGuardado = localStorage.getItem('inspector_id_activo') || "001";
      setInspectorIdLogueado(idGuardado);
    }
  }, []);

  const mostrarAlerta = (mensaje: string, tipo: 'exito' | 'error' = 'exito') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => { setNotificacion(null); }, 3000);
  };

  const configDefault = CATALOGO_PRODUCTOS["Zucchini"];

  const [formInsp, setFormInsp] = useState({
    fecha: '',
    hora: '',
    inspector_id: '001',
    categoria: 'Frescas',
    producto: 'Zucchini',
    variedad: configDefault.variedades[0],
    etapaSeleccionada: configDefault.etapas[0].nombre,
    cuadroSeleccionado: configDefault.etapas[0].cuadros[0],
    empaque: configDefault.empaques[0],
    con_etiqueta: true,
    temperatura: 11.5,
    peso: 22.87,
    peso_unidad: 'lb',
    calidad: 'Primera',
    defecto_segunda: 'NINGUNO',
    piezas_segunda: 0,
    defecto_rezaga: 'NINGUNO',
    piezas_rezaga: 0,
    total_muestras: 0,
    porcentaje_defecto: 0,
    empacador_num: 5,
    empacador_nombre: CAT_EMPACADORES[5]
  });

  const [tamanosPz, setTamanosPz] = useState<Record<string, number>>({
    "X.FANCY": 0, "FANCY": 0, "MEDIUM": 0, "LARGE": 0, "X.LARGE": 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const resInsp = await fetch('/api/inspecciones');
      const textInsp = await resInsp.text();
      const dataInsp = textInsp ? JSON.parse(textInsp) : [];
      if (Array.isArray(dataInsp)) setInspecciones(dataInsp);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hoy = new Date();
    setFormInsp(prev => ({
      ...prev,
      fecha: hoy.toISOString().split('T')[0],
      hora: hoy.toTimeString().split(' ')[0].substring(0, 5),
      inspector_id: inspectorIdLogueado
    }));
    fetchData();
  }, [fetchData, inspectorIdLogueado]);

  if (!isMounted) return null;

  const handleProductoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prod = e.target.value;
    const config = CATALOGO_PRODUCTOS[prod] || CATALOGO_PRODUCTOS["Zucchini"];
    const primeraEtapa = config.etapas[0];
    const listaTamanos = TAMAÑOS_POR_PRODUCTO[prod] || ["FANCY", "MEDIUM"];
    
    const nuevoTamanosObj: Record<string, number> = {};
    listaTamanos.forEach((t) => {
      nuevoTamanosObj[t] = 0;
    });
    setTamanosPz(nuevoTamanosObj);

    setFormInsp(prev => ({
      ...prev,
      producto: prod,
      categoria: config.categoria,
      variedad: config.variedades[0],
      etapaSeleccionada: primeraEtapa.nombre,
      cuadroSeleccionado: primeraEtapa.cuadros[0],
      empaque: config.empaques[0],
      total_muestras: 0
    }));
  };

  const handleTamanoPzChange = (tamano: string, valor: number) => {
    const actualizados = { ...tamanosPz, [tamano]: Math.max(0, valor) };
    setTamanosPz(actualizados);

    const sumaTotal = Object.values(actualizados).reduce((a, b) => a + b, 0);
    setFormInsp(prev => ({
      ...prev,
      total_muestras: sumaTotal,
      porcentaje_defecto: sumaTotal > 0 ? Number((((Number(prev.piezas_segunda) + Number(prev.piezas_rezaga)) / sumaTotal) * 100).toFixed(2)) : 0
    }));
  };

  const handleEmpacadorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = Number(e.target.value);
    setFormInsp(prev => ({
      ...prev,
      empacador_num: num,
      empacador_nombre: CAT_EMPACADORES[num] || 'Desconocido'
    }));
  };

  const handleEtapaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const etapaNom = e.target.value;
    const config = CATALOGO_PRODUCTOS[formInsp.producto];
    const etapaObj = config.etapas.find(et => et.nombre === etapaNom);
    setFormInsp(prev => ({
      ...prev,
      etapaSeleccionada: etapaNom,
      cuadroSeleccionado: etapaObj ? etapaObj.cuadros[0] : ''
    }));
  };

  const handleInspChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormInsp(prev => {
      const updated = { ...prev, [name]: name === 'temperatura' ? Number(value) : value };
      if (name === 'piezas_segunda' || name === 'piezas_rezaga' || name === 'total_muestras') {
        const total = Number(name === 'total_muestras' ? value : prev.total_muestras || 1);
        const pzSegunda = Number(name === 'piezas_segunda' ? value : prev.piezas_segunda || 0);
        const pzRezaga = Number(name === 'piezas_rezaga' ? value : prev.piezas_rezaga || 0);
        const totalDefectos = pzSegunda + pzRezaga;
        updated.porcentaje_defecto = Number(((totalDefectos / (total || 1)) * 100).toFixed(2));
      }
      return updated;
    });
  };

  const handleSubmitInsp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cuadroFinal = `${formInsp.etapaSeleccionada} (Cuadro: ${formInsp.cuadroSeleccionado})`;
    const totalDefectosPz = Number(formInsp.piezas_segunda) + Number(formInsp.piezas_rezaga);

    const resumenTamanos = Object.entries(tamanosPz)
      .filter(([, pz]) => pz > 0)
      .map(([tam, pz]) => `${tam}: ${pz} pz`)
      .join(' | ');

    const valorTempNum = Number(formInsp.temperatura);

    const payload = {
      ...formInsp,
      inspector_id: inspectorIdLogueado,
      temperatura: valorTempNum,
      temperatura_c: valorTempNum,
      temp: valorTempNum,
      cuadro: cuadroFinal,
      piezas_defecto: totalDefectosPz,
      tamano_resumen: resumenTamanos || `Total: ${formInsp.total_muestras} pz`,
      defecto: `2ª: ${formInsp.defecto_segunda} (${formInsp.piezas_segunda} pz) | Rezaga: ${formInsp.defecto_rezaga} (${formInsp.piezas_rezaga} pz)`,
      categoria_defecto: formInsp.piezas_rezaga > 0 ? 'Rezaga' : 'Segunda'
    };

    try {
      const res = await fetch('/api/inspecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        mostrarAlerta('¡Inspección guardada con éxito!', 'exito');
        fetchData();
      } else {
        mostrarAlerta('Error al guardar la inspección.', 'error');
      }
    } catch {
      mostrarAlerta('Error de conexión.', 'error');
    }
  };

  const obtenerNombreInspectora = (id: string) => {
    switch(id) {
      case '001': return 'Rubí (001)';
      case '002': return 'María (002)';
      case '003': return 'Marta Patricia (003)';
      default: return `Inspectora (${id})`;
    }
  };

  const nombreInspectoraActual = obtenerNombreInspectora(inspectorIdLogueado);
  const misRegistros = inspecciones.filter(i => String(i.inspector_id).trim() === String(inspectorIdLogueado));

  const configActual = CATALOGO_PRODUCTOS[formInsp.producto] || CATALOGO_PRODUCTOS["Zucchini"];
  const etapaActualObj = configActual.etapas.find(et => et.nombre === formInsp.etapaSeleccionada) || configActual.etapas[0];
  const tamanosDisponibles = TAMAÑOS_POR_PRODUCTO[formInsp.producto] || ["FANCY", "MEDIUM"];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-slate-100 min-h-screen text-slate-800 space-y-6">
      
      {notificacion && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-5 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 transition animate-fade-in ${
            notificacion.tipo === 'exito' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
          }`}>
            <span>{notificacion.tipo === 'exito' ? '✅' : '⚠️'}</span>
            <span>{notificacion.mensaje}</span>
          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 text-white p-3 rounded-xl"><ClipboardList className="w-6 h-6" /></div>
          <div>
            <h1 className="font-black text-base text-slate-900">Panel de Inspección — Rico Farms</h1>
            <p className="text-xs text-slate-500">Sesión activa: <span className="font-bold text-emerald-700">{nombreInspectoraActual}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl font-semibold transition cursor-pointer">
            <RefreshCcw className="w-4 h-4" /> Actualizar
          </button>
          <button onClick={() => { localStorage.removeItem('inspector_id_activo'); router.push('/'); }} className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl font-semibold transition cursor-pointer">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </div>

      {/* FORMULARIO DE NUEVA INSPECCIÓN */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="font-black text-sm text-slate-900 uppercase">NUEVA INSPECCIÓN DE CAMPO</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Inspectora ID:</span>
            <input 
              type="text" 
              disabled 
              value={nombreInspectoraActual} 
              className="bg-emerald-50 text-emerald-800 font-black text-xs px-3 py-1.5 rounded-xl border border-emerald-200 cursor-not-allowed" 
            />
          </div>
        </div>

        <form onSubmit={handleSubmitInsp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border">
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Fecha</label>
              <input type="date" value={formInsp.fecha} onChange={e => setFormInsp({...formInsp, fecha: e.target.value})} required className="w-full border p-2 rounded-xl bg-white font-bold text-xs" />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Hora</label>
              <input type="time" value={formInsp.hora} onChange={e => setFormInsp({...formInsp, hora: e.target.value})} required className="w-full border p-2 rounded-xl bg-white font-bold text-xs" />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 text-xs font-bold text-cyan-800 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-600" /> Temp (°C)
              </label>
              <input type="number" step="0.1" name="temperatura" value={formInsp.temperatura} onChange={handleInspChange} required className="w-full border p-2 rounded-xl bg-cyan-50 font-black text-cyan-900 text-xs" />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Categoría</label>
              <input type="text" disabled value={formInsp.categoria} className="w-full border p-2 rounded-xl bg-slate-100 text-emerald-700 font-bold text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Número de Empacador (1 al 19)</label>
              <select value={formInsp.empacador_num} onChange={handleEmpacadorChange} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                {Object.keys(CAT_EMPACADORES).map(num => (
                  <option key={num} value={num}>Empacador #{num} - {CAT_EMPACADORES[Number(num)]}</option>
                ))}
              </select>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Empacador Asignado:</span>
                <span className="font-black text-emerald-700 text-xs">{formInsp.empacador_nombre}</span>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 text-[10px]">¿Lleva Etiqueta?</label>
                <select value={formInsp.con_etiqueta ? "true" : "false"} onChange={e => setFormInsp({...formInsp, con_etiqueta: e.target.value === "true"})} className="border p-1.5 rounded-lg bg-white font-bold text-xs">
                  <option value="true">C/E</option>
                  <option value="false">S/E</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Producto</label>
              <select value={formInsp.producto} onChange={handleProductoChange} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                {Object.keys(CATALOGO_PRODUCTOS).map(prod => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Variedad</label>
              <select value={formInsp.variedad} onChange={e => setFormInsp({...formInsp, variedad: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                {configActual.variedades.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Empaque / Marca</label>
              <select value={formInsp.empaque} onChange={e => setFormInsp({...formInsp, empaque: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                {configActual.empaques.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
            <div>
              <label className="text-slate-700 block mb-1 text-xs font-bold">Etapa</label>
              <select value={formInsp.etapaSeleccionada} onChange={handleEtapaChange} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                {configActual.etapas.map(et => (
                  <option key={et.nombre} value={et.nombre}>{et.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-700 block mb-1 text-xs font-bold">Cuadro</label>
              <select value={formInsp.cuadroSeleccionado} onChange={e => setFormInsp({...formInsp, cuadroSeleccionado: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                {etapaActualObj.cuadros.map(cuadro => (
                  <option key={cuadro} value={cuadro}>Cuadro: {cuadro}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600" /> Desglose de Tamaños / Calibres (PZ)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {tamanosDisponibles.map(tam => (
                <div key={tam} className="bg-white p-2 rounded-lg border text-center">
                  <label className="text-[10px] font-bold text-slate-600 block uppercase">{tam}</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={tamanosPz[tam] || 0} 
                    onChange={e => handleTamanoPzChange(tam, Number(e.target.value))}
                    className="w-full border rounded p-1 text-slate-900 font-black text-center text-xs bg-slate-50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Total Muestras (PZ)</label>
              <input type="number" value={formInsp.total_muestras} readOnly className="w-full border p-2.5 rounded-xl bg-slate-100 font-black text-emerald-700 text-xs cursor-not-allowed" />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 text-xs">% Defecto Total</label>
              <input type="text" disabled value={`${formInsp.porcentaje_defecto}%`} className="w-full border p-2.5 rounded-xl bg-slate-100 font-black text-emerald-800 text-xs cursor-not-allowed" />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Calidad Global</label>
              <select name="calidad" value={formInsp.calidad} onChange={handleInspChange} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                <option value="Primera">Primera</option>
                <option value="Segunda">Segunda</option>
                <option value="Rechazo">Rechazo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
            <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
              <div className="font-bold text-amber-800 flex items-center gap-1 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Defectos de 2da Calidad
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Daño</label>
                  <select value={formInsp.defecto_segunda} onChange={e => setFormInsp({...formInsp, defecto_segunda: e.target.value})} className="w-full border p-1.5 rounded-lg bg-slate-50 font-bold text-xs">
                    {DEFECTOS_SEGUNDA.map(def => <option key={def} value={def}>{def}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Piezas (PZ)</label>
                  <input type="number" min="0" name="piezas_segunda" value={formInsp.piezas_segunda} onChange={handleInspChange} className="w-full border p-1.5 rounded-lg font-black text-amber-700 text-xs" />
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-red-200 space-y-2">
              <div className="font-bold text-red-800 flex items-center gap-1 text-xs">
                <Layers className="w-3.5 h-3.5 text-red-600" /> Defectos de Rezaga
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Daño</label>
                  <select value={formInsp.defecto_rezaga} onChange={e => setFormInsp({...formInsp, defecto_rezaga: e.target.value})} className="w-full border p-1.5 rounded-lg bg-slate-50 font-bold text-xs">
                    {DEFECTOS_REZAGA.map(def => <option key={def} value={def}>{def}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Piezas (PZ)</label>
                  <input type="number" min="0" name="piezas_rezaga" value={formInsp.piezas_rezaga} onChange={handleInspChange} className="w-full border p-1.5 rounded-lg font-black text-red-700 text-xs" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow">
              Registrar Inspección
            </button>
          </div>
        </form>
      </div>

      {/* TABLA DE MIS REGISTROS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Mis Registros Guardados ({nombreInspectoraActual})</h3>
        
        {loading ? (
          <div className="text-center py-6 text-xs text-slate-400">Cargando tus registros...</div>
        ) : misRegistros.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">No tienes registros guardados todavía.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Fecha / Hora</th>
                  <th className="p-2.5">Temp</th>
                  <th className="p-2.5">Empacador</th>
                  <th className="p-2.5">Producto / Variedad</th>
                  <th className="p-2.5">Cuadro</th>
                  <th className="p-2.5">Desglose de Tamaños</th>
                  <th className="p-2.5">% Defecto</th>
                  <th className="p-2.5">Calidad</th>
                </tr>
              </thead>
              <tbody>
                {misRegistros.map(insp => {
                  // EXTRACCIÓN LIMPIA Y DIRECTA: Lee exactamente el campo numérico que venga de la base de datos sin forzar valores fijos
                  const tempFinal = insp.temperatura ?? insp.temperatura_c ?? insp.temp;
                  const tempValida = (tempFinal !== undefined && tempFinal !== null && tempFinal !== '' && !isNaN(Number(tempFinal))) 
                    ? `${Number(tempFinal).toFixed(1)} °C` 
                    : 'N/D';

                  const tamanoMostrar = (insp.tamano_resumen && insp.tamano_resumen !== 'Sin desglose' && insp.tamano_resumen !== 'N/D') 
                    ? insp.tamano_resumen 
                    : `Total: ${insp.total_muestras} pz`;

                  return (
                    <tr key={insp.id} className="border-b hover:bg-slate-50">
                      <td className="p-2.5 font-bold">#{insp.id}</td>
                      <td className="p-2.5">{insp.fecha?.split('T')[0]} ({insp.hora})</td>
                      <td className="p-2.5 font-black text-cyan-700">{tempValida}</td>
                      <td className="p-2.5 font-bold text-emerald-700">#{insp.empacador_num}</td>
                      <td className="p-2.5">{insp.producto} <span className="text-slate-400">({insp.variedad})</span></td>
                      <td className="p-2.5">{insp.cuadro}</td>
                      <td className="p-2.5 font-black text-slate-800">{tamanoMostrar}</td>
                      <td className="p-2.5 text-red-600 font-bold">{insp.porcentaje_defecto}%</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${insp.calidad === 'Primera' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {insp.calidad}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}