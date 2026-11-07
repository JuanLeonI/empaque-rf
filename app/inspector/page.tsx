"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, LogOut, RefreshCcw, Thermometer, Layers, Maximize2, Plus, Trash2 } from 'lucide-react';

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
  tipo_bolsa?: string;
  con_etiqueta: boolean;
  temperatura?: number | string;
  temperatura_c?: number | string;
  temp?: number | string;
  peso: number;
  peso_unidad: string;
  calidad: string;
  calidad_global?: string;
  defecto: string;
  categoria_defecto: string;
  piezas_defecto: number;
  porcentaje_defecto: number;
  empacador_num: number;
  empacador_nombre: string;
  total_muestras: number;
  tamano_resumen?: string;
  porcentaje_general?: number;
  porcentaje_primera?: number;
  porcentaje_segunda?: number;
  porcentaje_rezaga?: number;
  desglose_defectos?: Array<{ tipo: string; clasificacion: string; piezas: number }>;
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

const DEFECTOS_POR_CLASIFICACION: Record<string, string[]> = {
  "Primera": ["NINGUNO", "BUENA CALIDAD", "LEVE MANCHA", "COLOR UNIFORME", "LACRADO", "GOLPE", "PITTING", "DAÑO X HOJA", "DEFORME", "OTRO"],
  "Segunda": [
    "NINGUNO",
    "Lacrado segunda",
    "Bajo color cacheteado",
    "Deforme segunda",
    "Protuberancia segunda",
    "Daño por hoja segunda",
    "Pitting segunda",
    "Virisis segunda",
    "Curvo segunda",
    "Bajo diámetro",
    "COLOR BAJO",
    "FLOR EN FRUTA",
    "OTRO"
  ],
  "Rezaga": [
    "NINGUNO",
    "Lacrado rezaga",
    "Daño mecánico rezaga",
    "Daño por peciolo rezaga",
    "Pudrición",
    "Deforme rezaga",
    "Amarillo cacheteado",
    "Cuchillo",
    "Pitting",
    "Protuberancia rezaga",
    "Curvo rezaga",
    "Virisis rezaga",
    "MALFORMACION",
    "DESHIDRATACION",
    "PASADA",
    "DAÑO X PLAGA",
    "OTRO"
  ]
};

const TAMAÑOS_POR_PRODUCTO: Record<string, string[]> = {
  "Zucchini": ["X.FANCY", "FANCY", "MEDIUM", "LARGE", "X.LARGE"],
  "Calabaza Amarilla": ["X.FANCY", "FANCY", "MEDIUM", "LARGE", "MENOR A XF"],
  "Pepino": ["42", "36", "30", "24", "MENOR A 42"],
  "Sandía": ["AGUSTIN", "GRANEL", "STANDARD"],
  "Sandía Mini": ["MINI 5", "MINI 6", "MINI 8"],
  "Berenjena": ["FANCY", "CHOICE", "JUMBO"],
  "Butternut": ["LARGE", "MEDIUM", "SMALL"],
  "Delicata": ["STANDARD", "LARGE"],
  "Acorn": ["MEDIUM", "LARGE"],
  "Spaghetti": ["MEDIUM", "LARGE"],
  "Kabocha": ["MEDIUM", "LARGE"]
};

const CATALOGO_PRODUCTOS: Record<string, {
  categoria: 'Frescas' | 'Duras';
  variedades: string[];
  etapas: { nombre: string; cuadros: string[] }[];
  empaques: string[];
}> = {
  "Zucchini": {
    categoria: "Frescas",
    variedades: ["Alessandra", "Monarca", "Züc-Elite"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["9-4", "9-5", "9-6", "9-7", "9-8", "9-3"] },
      { nombre: "Etapa 2", cuadros: ["4", "5", "3-4", "3-5", "3-6", "3-3"] },
      { nombre: "Etapa 3", cuadros: ["12-5", "12-6", "12-7", "12-8", "12-4"] }
    ],
    empaques: ["Rico Farms", "Sonoran Gold"]
  },
  "Calabaza Amarilla": {
    categoria: "Frescas",
    variedades: ["Grand Priz", "Multipack"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["9-1", "9-2"] },
      { nombre: "Etapa 2", cuadros: ["3-1", "3-2", "6"] },
      { nombre: "Etapa 3", cuadros: ["12-1", "12-2"] }
    ],
    empaques: ["Rico Farms", "Sonoran Gold"]
  },
  "Pepino": {
    categoria: "Frescas",
    variedades: ["Azulan", "Hércules"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["8-1", "8-2", "8-3", "8-4", "8-5", "8-6"] },
      { nombre: "Etapa 2", cuadros: ["8-7", "8-8", "8-9"] }
    ],
    empaques: ["Rico Farms"]
  },
  "Sandía": {
    categoria: "Frescas",
    variedades: ["Crimson Sweet", "Seedless"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["S-1", "S-2"] },
      { nombre: "Etapa 2", cuadros: ["S-3", "S-4"] }
    ],
    empaques: ["Rico Farms", "Sonoran Gold"]
  },
  "Sandía Mini": {
    categoria: "Frescas",
    variedades: ["Mini Love", "Extrema"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["SM-1", "SM-2"] }
    ],
    empaques: ["Rico Farms", "Sonoran Gold"]
  },
  "Berenjena": {
    categoria: "Frescas",
    variedades: ["Classic", "Noche Oscura"],
    etapas: [
      { nombre: "Etapa 1", cuadros: ["B-1", "B-2"] }
    ],
    empaques: ["Rico Farms"]
  },
  "Butternut": {
    categoria: "Duras",
    variedades: ["Waltham", "Atlas"],
    etapas: [{ nombre: "Etapa Única", cuadros: ["D-1", "D-2", "D-3"] }],
    empaques: ["Rico Farms", "Sonoran Gold"]
  },
  "Delicata": {
    categoria: "Duras",
    variedades: ["Honey Boat", "Bush Delicata"],
    etapas: [{ nombre: "Etapa Única", cuadros: ["D-4", "D-5"] }],
    empaques: ["Rico Farms"]
  },
  "Acorn": {
    categoria: "Duras",
    variedades: ["Table Queen", "Honey Bear"],
    etapas: [{ nombre: "Etapa Única", cuadros: ["A-1", "A-2"] }],
    empaques: ["Rico Farms"]
  },
  "Spaghetti": {
    categoria: "Duras",
    variedades: ["Tivoli", "Vegetable Spaghetti"],
    etapas: [{ nombre: "Etapa Única", cuadros: ["SP-1", "SP-2"] }],
    empaques: ["Rico Farms"]
  },
  "Kabocha": {
    categoria: "Duras",
    variedades: ["Sunshine", "Sweet Mama"],
    etapas: [{ nombre: "Etapa Única", cuadros: ["K-1", "K-2"] }],
    empaques: ["Rico Farms"]
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

  const [formInsp, setFormInsp] = useState({
    fecha: '',
    hora: '',
    inspector_id: '001',
    categoria: 'Frescas',
    producto: '',
    variedad: '',
    etapaSeleccionada: '',
    cuadroSeleccionado: '',
    empaque: '',
    tipo_bolsa_opcion: 'Sin Bolsa (S/B)',
    tipo_bolsa_detalle: '',
    con_etiqueta: true,
    temperatura: '' as any,
    peso: '' as any,
    peso_unidad: 'lb',
    calidad: 'Primera',
    calidad_global: 'Primera (Limpia)',
    total_muestras: 0,
    empacador_num: '' as any,
    empacador_nombre: '',
    porcentaje_general: 100,
    porcentaje_primera: 0,
    porcentaje_segunda: 0,
    porcentaje_rezaga: 0,
    porcentaje_defecto: 0
  });

  const [tamanosPz, setTamanosPz] = useState<Record<string, number>>({});
  const [defectosLista, setDefectosLista] = useState<Array<{ tipo: string; clasificacion: string; piezas: number }>>([]);
  const [nuevoDefecto, setNuevoDefecto] = useState({
    clasificacion: 'Segunda',
    tipo: DEFECTOS_POR_CLASIFICACION['Segunda'][0],
    tipoPersonalizado: '',
    piezas: 1
  });

  const recalcularPorcentajes = useCallback((muestrasTotales: number, defectos: typeof defectosLista) => {
    if (muestrasTotales <= 0) {
      return { pGeneral: 100, pPrimera: 0, pSegunda: 0, pRezaga: 0, pDefectoTotal: 0 };
    }

    const pzPrimeraDef = defectos.filter(d => d.clasificacion === 'Primera').reduce((acc, curr) => acc + curr.piezas, 0);
    const pzSegunda = defectos.filter(d => d.clasificacion === 'Segunda').reduce((acc, curr) => acc + curr.piezas, 0);
    const pzRezaga = defectos.filter(d => d.clasificacion === 'Rezaga').reduce((acc, curr) => acc + curr.piezas, 0);

    const totalDefectosOClasificados = pzPrimeraDef + pzSegunda + pzRezaga;
    const pzLimpiasRestantes = Math.max(0, muestrasTotales - totalDefectosOClasificados);

    const pGeneral = Number(((pzLimpiasRestantes / muestrasTotales) * 100).toFixed(2));
    const pPrimera = Number(((pzPrimeraDef / muestrasTotales) * 100).toFixed(2));
    const pSegunda = Number(((pzSegunda / muestrasTotales) * 100).toFixed(2));
    const pRezaga = Number(((pzRezaga / muestrasTotales) * 100).toFixed(2));
    const pDefectoTotal = Number((pSegunda + pRezaga).toFixed(2));

    return { pGeneral, pPrimera, pSegunda, pRezaga, pDefectoTotal };
  }, []);

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
    if (!prod) {
      setFormInsp(prev => ({ ...prev, producto: '', variedad: '', etapaSeleccionada: '', cuadroSeleccionado: '', empaque: '' }));
      setTamanosPz({});
      return;
    }

    const config = CATALOGO_PRODUCTOS[prod] || CATALOGO_PRODUCTOS["Zucchini"];
    const primeraEtapa = config.etapas[0];
    const listaTamanos = TAMAÑOS_POR_PRODUCTO[prod] || ["FANCY", "MEDIUM"];
    
    const nuevoTamanosObj: Record<string, number> = {};
    listaTamanos.forEach((t) => {
      nuevoTamanosObj[t] = 0;
    });
    setTamanosPz(nuevoTamanosObj);
    setDefectosLista([]);

    setFormInsp(prev => ({
      ...prev,
      producto: prod,
      categoria: config.categoria,
      variedad: config.variedades[0],
      etapaSeleccionada: primeraEtapa.nombre,
      cuadroSeleccionado: primeraEtapa.cuadros[0],
      empaque: config.empaques[0],
      total_muestras: 0,
      porcentaje_general: 100,
      porcentaje_primera: 0,
      porcentaje_segunda: 0,
      porcentaje_rezaga: 0
    }));
  };

  const handleTamanoPzChange = (tamano: string, valor: number) => {
    const actualizados = { ...tamanosPz, [tamano]: Math.max(0, valor) };
    setTamanosPz(actualizados);

    const sumaTotal = Object.values(actualizados).reduce((a, b) => a + b, 0);
    const { pGeneral, pPrimera, pSegunda, pRezaga, pDefectoTotal } = recalcularPorcentajes(sumaTotal, defectosLista);

    setFormInsp(prev => ({
      ...prev,
      total_muestras: sumaTotal,
      porcentaje_general: pGeneral,
      porcentaje_primera: pPrimera,
      porcentaje_segunda: pSegunda,
      porcentaje_rezaga: pRezaga,
      porcentaje_defecto: pDefectoTotal
    }));
  };

  const handleEmpacadorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const numVal = e.target.value;
    if (!numVal) {
      setFormInsp(prev => ({ ...prev, empacador_num: '', empacador_nombre: '' }));
      return;
    }
    const num = Number(numVal);
    setFormInsp(prev => ({
      ...prev,
      empacador_num: num,
      empacador_nombre: CAT_EMPACADORES[num] || 'Desconocido'
    }));
  };

  const handleEtapaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const etapaNom = e.target.value;
    if (!formInsp.producto) return;
    const config = CATALOGO_PRODUCTOS[formInsp.producto];
    const etapaObj = config.etapas.find(et => et.nombre === etapaNom);
    setFormInsp(prev => ({
      ...prev,
      etapaSeleccionada: etapaNom,
      cuadroSeleccionado: etapaObj ? etapaObj.cuadros[0] : ''
    }));
  };

  const handleInspChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormInsp(prev => ({
      ...prev,
      [name]: name === 'temperatura' || name === 'peso' ? (val === '' ? '' : Number(val)) : val
    }));
  };

  const agregarDefecto = () => {
    const tipoFinal = nuevoDefecto.tipo === 'OTRO' ? nuevoDefecto.tipoPersonalizado.trim() : nuevoDefecto.tipo;
    if (!tipoFinal || nuevoDefecto.piezas <= 0) return;

    const defectoItem = {
      tipo: tipoFinal,
      clasificacion: nuevoDefecto.clasificacion,
      piezas: Number(nuevoDefecto.piezas)
    };

    const nuevaLista = [...defectosLista, defectoItem];
    setDefectosLista(nuevaLista);

    const { pGeneral, pPrimera, pSegunda, pRezaga, pDefectoTotal } = recalcularPorcentajes(formInsp.total_muestras, nuevaLista);
    setFormInsp(prev => ({
      ...prev,
      porcentaje_general: pGeneral,
      porcentaje_primera: pPrimera,
      porcentaje_segunda: pSegunda,
      porcentaje_rezaga: pRezaga,
      porcentaje_defecto: pDefectoTotal
    }));

    setNuevoDefecto({
      clasificacion: 'Segunda',
      tipo: DEFECTOS_POR_CLASIFICACION['Segunda'][0],
      tipoPersonalizado: '',
      piezas: 1
    });
  };

  const eliminarDefecto = (index: number) => {
    const nuevaLista = defectosLista.filter((_, i) => i !== index);
    setDefectosLista(nuevaLista);

    const { pGeneral, pPrimera, pSegunda, pRezaga, pDefectoTotal } = recalcularPorcentajes(formInsp.total_muestras, nuevaLista);
    setFormInsp(prev => ({
      ...prev,
      porcentaje_general: pGeneral,
      porcentaje_primera: pPrimera,
      porcentaje_segunda: pSegunda,
      porcentaje_rezaga: pRezaga,
      porcentaje_defecto: pDefectoTotal
    }));
  };

  const limpiarFormulario = () => {
    const hoy = new Date();
    setTamanosPz({});
    setDefectosLista([]);

    setFormInsp(prev => ({
      ...prev,
      fecha: hoy.toISOString().split('T')[0],
      hora: hoy.toTimeString().split(' ')[0].substring(0, 5),
      producto: '',
      variedad: '',
      etapaSeleccionada: '',
      cuadroSeleccionado: '',
      empaque: '',
      tipo_bolsa_opcion: 'Sin Bolsa (S/B)',
      tipo_bolsa_detalle: '',
      temperatura: '',
      peso: '',
      total_muestras: 0,
      empacador_num: '',
      empacador_nombre: '',
      porcentaje_general: 100,
      porcentaje_primera: 0,
      porcentaje_segunda: 0,
      porcentaje_rezaga: 0,
      porcentaje_defecto: 0,
      calidad_global: 'Primera (Limpia)'
    }));
  };

  const handleSubmitInsp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInsp.producto) {
      mostrarAlerta('Selecciona un producto.', 'error');
      return;
    }
    if (formInsp.total_muestras <= 0) {
      mostrarAlerta('Debes ingresar al menos una muestra en los tamaños.', 'error');
      return;
    }

    const { pGeneral, pPrimera, pSegunda, pRezaga, pDefectoTotal } = recalcularPorcentajes(
      formInsp.total_muestras,
      defectosLista
    );

    const cuadroFinal = `${formInsp.etapaSeleccionada} (Cuadro: ${formInsp.cuadroSeleccionado})`;
    const totalDefectosPz = defectosLista.reduce((acc, curr) => acc + curr.piezas, 0);

    const resumenTamanos = Object.entries(tamanosPz)
      .filter(([, pz]) => pz > 0)
      .map(([tam, pz]) => `${tam}: ${pz} pz`)
      .join(' | ');

    const resumenDefectosText = defectosLista.length > 0
      ? defectosLista.map(d => `${d.clasificacion}: ${d.tipo} (${d.piezas} pz)`).join(' | ')
      : 'NINGUNO';

    const valorTempNum = Number(formInsp.temperatura) || 0;
    
    const tipoBolsaFinal = formInsp.tipo_bolsa_opcion === 'Variado'
      ? `Variado: ${formInsp.tipo_bolsa_detalle.trim() || 'No especificado'}`
      : formInsp.tipo_bolsa_opcion;

    const payload = {
      ...formInsp,
      inspector_id: inspectorIdLogueado,
      tipo_bolsa: tipoBolsaFinal,
      temperatura: valorTempNum,
      temperatura_c: valorTempNum,
      temp: valorTempNum,
      cuadro: cuadroFinal,
      piezas_defecto: totalDefectosPz,
      tamano_resumen: resumenTamanos || `Total: ${formInsp.total_muestras} pz`,
      defecto: resumenDefectosText,
      categoria_defecto: defectosLista.some(d => d.clasificacion === 'Rezaga') ? 'Rezaga' : 'Segunda',
      desglose_defectos: defectosLista,
      porcentaje_general: pGeneral,
      porcentaje_primera: pPrimera,
      porcentaje_segunda: pSegunda,
      porcentaje_rezaga: pRezaga,
      porcentaje_defecto: pDefectoTotal,
      calidad_global: formInsp.calidad_global,
      calidad: formInsp.calidad_global
    };

    try {
      const res = await fetch('/api/inspecciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && (data.success || res.status === 200 || res.status === 201)) {
        mostrarAlerta('¡Inspección guardada con éxito!', 'exito');
        fetchData();
        limpiarFormulario();
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
      case '002': return 'Martha (002)';
      case '003': return 'Mónica (003)';
      default: return `Inspectora (${id})`;
    }
  };

  const nombreInspectoraActual = obtenerNombreInspectora(inspectorIdLogueado);
  const misRegistros = inspecciones.filter(i => String(i.inspector_id).trim() === String(inspectorIdLogueado));

  const configActual = CATALOGO_PRODUCTOS[formInsp.producto] || { variedades: [], etapas: [{ nombre: '', cuadros: [] }], empaques: [] };
  const etapaActualObj = configActual.etapas.find(et => et.nombre === formInsp.etapaSeleccionada) || configActual.etapas[0] || { cuadros: [] };
  const tamanosDisponibles = TAMAÑOS_POR_PRODUCTO[formInsp.producto] || [];

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

      {/* CABECERA INSPECTOR CON LOGO */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo Rico Farms" className="h-11 w-auto object-contain rounded-lg" />
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
              <input type="number" step="0.1" name="temperatura" value={formInsp.temperatura} onChange={handleInspChange} required placeholder="Ej. 11.5" className="w-full border p-2 rounded-xl bg-cyan-50 font-black text-cyan-900 text-xs" />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 text-xs font-bold text-slate-800">Peso ({formInsp.peso_unidad})</label>
              <input type="number" step="0.01" name="peso" value={formInsp.peso} onChange={handleInspChange} required placeholder="Ej. 22.87" className="w-full border p-2 rounded-xl bg-white font-bold text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Número de Empacador (1 al 19)</label>
              <select value={formInsp.empacador_num} onChange={handleEmpacadorChange} required className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                <option value="">-- Selecciona Empacador --</option>
                {Object.keys(CAT_EMPACADORES).map(num => (
                  <option key={num} value={num}>Empacador #{num} - {CAT_EMPACADORES[Number(num)]}</option>
                ))}
              </select>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Empacador Asignado:</span>
                <span className="font-black text-emerald-700 text-xs">{formInsp.empacador_nombre || 'N/D'}</span>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 text-[10px]">¿Lleva Etiqueta?</label>
                <select value={formInsp.con_etiqueta ? "true" : "false"} onChange={e => setFormInsp({...formInsp, con_etiqueta: e.target.value === "true"})} className="border p-1.5 rounded-lg bg-white font-bold text-xs">
                  <option value="true">C/E</option>
                  <option value="false">S/E</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 block mb-1 text-xs font-bold">Tipo de Empaque (Bolsa)</label>
              <select 
                name="tipo_bolsa_opcion" 
                value={formInsp.tipo_bolsa_opcion} 
                onChange={handleInspChange} 
                className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs"
              >
                <option value="Con Bolsa (C/B)">Con Bolsa (C/B)</option>
                <option value="Sin Bolsa (S/B)">Sin Bolsa (S/B)</option>
                <option value="Variado">Variado (Especificar)</option>
              </select>
              {formInsp.tipo_bolsa_opcion === 'Variado' && (
                <input 
                  type="text" 
                  name="tipo_bolsa_detalle"
                  placeholder="Ej. 10 con bolsa, 5 sin bolsa..." 
                  value={formInsp.tipo_bolsa_detalle} 
                  onChange={handleInspChange} 
                  className="w-full border p-2 rounded-xl bg-amber-50 font-bold text-xs border-amber-300 mt-1" 
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 block mb-1 text-xs">Producto</label>
              <select value={formInsp.producto} onChange={handleProductoChange} required className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                <option value="">-- Selecciona Producto --</option>
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
              <label className="text-slate-600 block mb-1 text-xs">Marca de Empaque</label>
              <select value={formInsp.empaque} onChange={e => setFormInsp({...formInsp, empaque: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs">
                {configActual.empaques.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border">
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
            <div>
              <label className="text-slate-700 block mb-1 text-xs font-bold">Calidad Global</label>
              <select name="calidad_global" value={formInsp.calidad_global} onChange={handleInspChange} className="w-full border p-2.5 rounded-xl bg-white font-bold text-xs text-emerald-800">
                <option value="Primera (Limpia)">Primera (Limpia)</option>
                <option value="Primera con defectos menores">Primera con defectos menores</option>
                <option value="Segunda">Segunda</option>
                <option value="Rechazo">Rechazo</option>
              </select>
            </div>
          </div>

          {formInsp.producto && (
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
          )}

          <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-emerald-600" /> Registro de Múltiples Defectos y Calidades
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Clasificación</label>
                <select 
                  value={nuevoDefecto.clasificacion} 
                  onChange={e => {
                    const clas = e.target.value;
                    const listaDef = DEFECTOS_POR_CLASIFICACION[clas] || DEFECTOS_POR_CLASIFICACION['Segunda'];
                    setNuevoDefecto({
                      clasificacion: clas,
                      tipo: listaDef[0],
                      tipoPersonalizado: '',
                      piezas: 1
                    });
                  }} 
                  className="w-full border p-2 rounded-lg bg-white font-bold text-xs"
                >
                  <option value="Primera">Primera</option>
                  <option value="Segunda">Segunda</option>
                  <option value="Rezaga">Rezaga</option>
                </select>
              </div>
              
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] text-slate-500 block mb-1">Descripción / Defecto</label>
                <select 
                  value={nuevoDefecto.tipo} 
                  onChange={e => setNuevoDefecto(prev => ({ ...prev, tipo: e.target.value }))} 
                  className="w-full border p-2 rounded-lg bg-white font-bold text-xs"
                >
                  {(DEFECTOS_POR_CLASIFICACION[nuevoDefecto.clasificacion] || DEFECTOS_POR_CLASIFICACION['Segunda']).map(def => (
                    <option key={def} value={def}>{def}</option>
                  ))}
                </select>
                {nuevoDefecto.tipo === 'OTRO' && (
                  <input 
                    type="text" 
                    placeholder="Escribe el defecto personalizado..." 
                    value={nuevoDefecto.tipoPersonalizado} 
                    onChange={e => setNuevoDefecto(prev => ({ ...prev, tipoPersonalizado: e.target.value }))} 
                    className="w-full border p-1.5 rounded-lg bg-white text-xs font-bold mt-1 border-emerald-500" 
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Piezas (PZ)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="1" 
                    value={nuevoDefecto.piezas} 
                    onChange={e => setNuevoDefecto(prev => ({ ...prev, piezas: Math.max(1, Number(e.target.value)) }))} 
                    className="w-full border p-2 rounded-lg font-black text-xs text-center" 
                  />
                  <button type="button" onClick={agregarDefecto} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-xs cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {defectosLista.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {defectosLista.map((def, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        def.clasificacion === 'Primera' ? 'bg-emerald-100 text-emerald-800' : 
                        def.clasificacion === 'Segunda' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {def.clasificacion}
                      </span>
                      <span className="font-bold text-slate-800">{def.tipo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-700">{def.piezas} pz</span>
                      <button type="button" onClick={() => eliminarDefecto(idx)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border text-center">
            <div>
              <label className="text-slate-500 block mb-1 text-[10px] font-bold">Total Muestras</label>
              <input type="number" value={formInsp.total_muestras} readOnly className="w-full border p-2 rounded-xl bg-slate-100 font-black text-slate-800 text-xs text-center cursor-not-allowed" />
            </div>
            <div>
              <label className="text-cyan-700 block mb-1 text-[10px] font-bold">% General</label>
              <input type="text" disabled value={`${formInsp.porcentaje_general}%`} className="w-full border p-2 rounded-xl bg-cyan-50 font-black text-cyan-900 text-xs text-center cursor-not-allowed" />
            </div>
            <div>
              <label className="text-emerald-700 block mb-1 text-[10px] font-bold">% Primera</label>
              <input type="text" disabled value={`${formInsp.porcentaje_primera}%`} className="w-full border p-2 rounded-xl bg-emerald-50 font-black text-emerald-800 text-xs text-center cursor-not-allowed" />
            </div>
            <div>
              <label className="text-amber-700 block mb-1 text-[10px] font-bold">% Segunda</label>
              <input type="text" disabled value={`${formInsp.porcentaje_segunda}%`} className="w-full border p-2 rounded-xl bg-amber-50 font-black text-amber-800 text-xs text-center cursor-not-allowed" />
            </div>
            <div>
              <label className="text-red-700 block mb-1 text-[10px] font-bold">% Rezaga</label>
              <input type="text" disabled value={`${formInsp.porcentaje_rezaga}%`} className="w-full border p-2 rounded-xl bg-red-50 font-black text-red-800 text-xs text-center cursor-not-allowed" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow">
              Registrar Inspección
            </button>
          </div>
        </form>
      </div>

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
                  <th className="p-2.5">Temp / Peso</th>
                  <th className="p-2.5">Empacador</th>
                  <th className="p-2.5">Producto / Bolsa</th>
                  <th className="p-2.5">Cuadro</th>
                  <th className="p-2.5">Calidad Global</th>
                  <th className="p-2.5">Desglose de Tamaños</th>
                  <th className="p-2.5">Daños Registrados</th>
                  <th className="p-2.5">% Gen / 1ª / 2ª / Rez</th>
                </tr>
              </thead>
              <tbody>
                {misRegistros.map(insp => {
                  const tempFinal = insp.temperatura ?? insp.temperatura_c ?? insp.temp;
                  const tempValida = (tempFinal !== undefined && tempFinal !== null && tempFinal !== '' && !isNaN(Number(tempFinal))) 
                    ? `${Number(tempFinal).toFixed(1)} °C` 
                    : 'N/D';

                  const tamanoMostrar = (insp.tamano_resumen && insp.tamano_resumen !== 'Sin desglose' && insp.tamano_resumen !== 'N/D') 
                    ? insp.tamano_resumen 
                    : `Total: ${insp.total_muestras} pz`;

                  const pGen = insp.porcentaje_general !== undefined ? insp.porcentaje_general : 100;
                  const p1 = insp.porcentaje_primera !== undefined ? insp.porcentaje_primera : 0;
                  const p2 = insp.porcentaje_segunda !== undefined ? insp.porcentaje_segunda : 0;
                  const pRez = insp.porcentaje_rezaga !== undefined ? insp.porcentaje_rezaga : 0;
                  const calidadMostrar = insp.calidad_global || insp.calidad || 'Primera (Limpia)';
                  const bolsaMostrar = insp.tipo_bolsa || 'S/B';

                  return (
                    <tr key={insp.id} className="border-b hover:bg-slate-50">
                      <td className="p-2.5 font-bold">#{insp.id}</td>
                      <td className="p-2.5">{insp.fecha?.split('T')[0]} ({insp.hora})</td>
                      <td className="p-2.5">
                        <span className="font-black text-cyan-700 block">{tempValida}</span>
                        <span className="font-semibold text-slate-600 text-[10px]">{insp.peso ?? 0} {insp.peso_unidad || 'lb'}</span>
                      </td>
                      <td className="p-2.5 font-bold text-emerald-700">#{insp.empacador_num}</td>
                      <td className="p-2.5">
                        <span className="font-bold text-slate-800 block">{insp.producto}</span>
                        <span className="text-slate-500 text-[10px]">{bolsaMostrar}</span>
                      </td>
                      <td className="p-2.5">{insp.cuadro}</td>
                      <td className="p-2.5 font-bold text-emerald-800">{calidadMostrar}</td>
                      <td className="p-2.5 font-black text-slate-800">{tamanoMostrar}</td>
                      <td className="p-2.5 text-slate-700 font-medium max-w-[200px] truncate" title={insp.defecto}>
                        {insp.defecto || 'Ninguno'}
                      </td>
                      <td className="p-2.5 font-bold">
                        <span className="text-cyan-800">{pGen}%</span> / {' '}
                        <span className="text-emerald-700">{p1}%</span> / {' '}
                        <span className="text-amber-700">{p2}%</span> / {' '}
                        <span className="text-red-700">{pRez}%</span>
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