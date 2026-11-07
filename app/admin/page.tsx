"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Printer, Trash2, Edit3, PlusCircle, LogOut, RefreshCcw, Thermometer, ClipboardList, Layers, Maximize2, Users, Search } from 'lucide-react';
import ReporteModal from './ReporteModal';

interface Inspeccion {
  id: number;
  fecha: string;
  hora: string;
  inspector_id: string;
  nombre_inspector?: string;
  categoria: string;
  producto: string;
  variedad: string;
  etapa: string;
  cuadro: string;
  empaque: string;
  tipo_bolsa?: string;
  con_etiqueta: boolean;
  tamano_resumen: string;
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
  porcentaje_general?: number;
  porcentaje_primera?: number;
  porcentaje_segunda?: number;
  porcentaje_rezaga?: number;
  empacador_num: number;
  empacador_nombre: string;
  total_muestras: number;
  desglose_defectos?: Array<{ tipo: string; clasificacion: string; piezas: number }>;
}

interface Temperatura {
  id: number;
  fecha: string;
  hora: string;
  producto: string;
  temperatura_c?: number;
  temperatura?: number;
  estado: string;
  observaciones: string;
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

export default function AdminPage() {
  const router = useRouter();
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [temperaturas, setTemperaturas] = useState<Temperatura[]>([]);
  const [activeTab, setActiveTab] = useState<'inspecciones' | 'temperaturas' | 'trabajadores'>('inspecciones');
  const [loading, setLoading] = useState(true);

  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroInspector, setFiltroInspector] = useState('TODOS');
  const [filtroVariedad, setFiltroVariedad] = useState('TODAS');
  const [soloHoy, setSoloHoy] = useState(false);
  const [fechaHoyStr, setFechaHoyStr] = useState('');

  const [busquedaTrabajadorId, setBusquedaTrabajadorId] = useState('');
  const [notificacion, setNotificacion] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  const mostrarAlerta = (mensaje: string, tipo: 'exito' | 'error' = 'exito') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => { setNotificacion(null); }, 3000);
  };

  const [modalInspAbierto, setModalInspAbierto] = useState(false);
  const [modoEdicionInsp, setModoEdicionInsp] = useState(false);
  const [idInspEditando, setIdInspEditando] = useState<number | null>(null);

  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [tipoEliminacion, setTipoEliminacion] = useState<'inspeccion' | 'temperatura'>('inspeccion');
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  const [fechaBorrado, setFechaBorrado] = useState('');
  const [inspectorBorrado, setInspectorBorrado] = useState('001');
  const [modalMasivoAbierto, setModalMasivoAbierto] = useState(false);
  const [tipoMasivo, setTipoMasivo] = useState<'fecha' | 'inspector' | 'temperatura_fecha'>('fecha');

  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [datosReporteImpresion, setDatosReporteImpresion] = useState<any | null>(null);

  const configDefault = CATALOGO_PRODUCTOS["Zucchini"];

  const [formInsp, setFormInsp] = useState({
    fecha: '',
    hora: '',
    inspector_id: '100',
    categoria: 'Frescas',
    producto: 'Zucchini',
    variedad: configDefault.variedades[0],
    etapaSeleccionada: configDefault.etapas[0].nombre,
    cuadroSeleccionado: configDefault.etapas[0].cuadros[0],
    empaque: configDefault.empaques[0],
    tipo_bolsa_opcion: 'Sin Bolsa (S/B)',
    tipo_bolsa_detalle: '',
    con_etiqueta: true,
    temperatura: 6.2,
    peso: 22.87,
    peso_unidad: 'lb',
    calidad_global: 'Primera (Limpia)',
    total_muestras: 0,
    porcentaje_general: 100,
    porcentaje_primera: 0,
    porcentaje_segunda: 0,
    porcentaje_rezaga: 0,
    empacador_num: 5,
    empacador_nombre: CAT_EMPACADORES[5]
  });

  const [tamanosPz, setTamanosPz] = useState<Record<string, number>>({
    "X.FANCY": 0, "FANCY": 0, "MEDIUM": 0, "LARGE": 0, "X.LARGE": 0
  });

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

      const resTemp = await fetch('/api/temperatura');
      const textTemp = await resTemp.text();
      const dataTemp = textTemp ? JSON.parse(textTemp) : [];
      if (Array.isArray(dataTemp)) setTemperaturas(dataTemp);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hoy = new Date();
    const hoyFormatted = hoy.toISOString().split('T')[0];
    setFechaHoyStr(hoyFormatted);
    setFiltroFecha(hoyFormatted);

    setFormInsp(prev => ({
      ...prev,
      fecha: hoyFormatted,
      hora: hoy.toTimeString().split(' ')[0].substring(0, 5)
    }));
    fetchData();
  }, [fetchData]);

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
    const { pGeneral, pPrimera, pSegunda, pRezaga } = recalcularPorcentajes(sumaTotal, defectosLista);

    setFormInsp(prev => ({
      ...prev,
      total_muestras: sumaTotal,
      porcentaje_general: pGeneral,
      porcentaje_primera: pPrimera,
      porcentaje_segunda: pSegunda,
      porcentaje_rezaga: pRezaga
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
    setFormInsp(prev => ({
      ...prev,
      [name]: name === 'temperatura' || name === 'peso' ? Number(value) : value
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

    const { pGeneral, pPrimera, pSegunda, pRezaga } = recalcularPorcentajes(formInsp.total_muestras, nuevaLista);
    setFormInsp(prev => ({
      ...prev,
      porcentaje_general: pGeneral,
      porcentaje_primera: pPrimera,
      porcentaje_segunda: pSegunda,
      porcentaje_rezaga: pRezaga
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

    const { pGeneral, pPrimera, pSegunda, pRezaga } = recalcularPorcentajes(formInsp.total_muestras, nuevaLista);
    setFormInsp(prev => ({
      ...prev,
      porcentaje_general: pGeneral,
      porcentaje_primera: pPrimera,
      porcentaje_segunda: pSegunda,
      porcentaje_rezaga: pRezaga
    }));
  };

  const handleSubmitInsp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cuadroFinal = `${formInsp.etapaSeleccionada} (Cuadro: ${formInsp.cuadroSeleccionado})`;
    const totalDefectosPz = defectosLista.reduce((acc, curr) => acc + curr.piezas, 0);

    const resumenTamanos = Object.entries(tamanosPz)
      .filter(([, pz]) => pz > 0)
      .map(([tam, pz]) => `${tam}: ${pz} pz`)
      .join(' | ');

    const resumenDefectosText = defectosLista.length > 0
      ? defectosLista.map(d => `${d.clasificacion}: ${d.tipo} (${d.piezas} pz)`).join(' | ')
      : 'NINGUNO';

    const valorTempNum = Number(formInsp.temperatura) || 6.2;
    const { pGeneral, pPrimera, pSegunda, pRezaga, pDefectoTotal } = recalcularPorcentajes(formInsp.total_muestras, defectosLista);

    const tipoBolsaFinal = formInsp.tipo_bolsa_opcion === 'Variado'
      ? `Variado: ${formInsp.tipo_bolsa_detalle.trim() || 'No especificado'}`
      : formInsp.tipo_bolsa_opcion;

    const payload = {
      ...formInsp,
      tipo_bolsa: tipoBolsaFinal,
      temperatura: valorTempNum,
      temperatura_c: valorTempNum,
      temp: valorTempNum,
      cuadro: cuadroFinal,
      piezas_defecto: totalDefectosPz,
      tamano_resumen: resumenTamanos || `Muestra: ${formInsp.total_muestras} pz`,
      defecto: resumenDefectosText,
      categoria_defecto: defectosLista.some(d => d.clasificacion === 'Rezaga') ? 'Rezaga' : 'Segunda',
      desglose_defectos: defectosLista,
      porcentaje_general: pGeneral,
      porcentaje_primera: pPrimera,
      porcentaje_segunda: pSegunda,
      porcentaje_rezaga: pRezaga,
      porcentaje_defecto: pDefectoTotal,
      calidad: formInsp.calidad_global,
      calidad_global: formInsp.calidad_global
    };

    try {
      const url = modoEdicionInsp ? `/api/inspecciones/${idInspEditando}` : '/api/inspecciones';
      const method = modoEdicionInsp ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        mostrarAlerta(modoEdicionInsp ? '¡Registro actualizado con éxito!' : '¡Inspección agregada con éxito!', 'exito');
        setModalInspAbierto(false);
        setModoEdicionInsp(false);
        fetchData();
      } else {
        mostrarAlerta(`Error al guardar: ${data.error || 'Desconocido'}`, 'error');
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      mostrarAlerta('Error de conexión con el servidor.', 'error');
    }
  };

  const ejecutarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
      if (tipoEliminacion === 'inspeccion') {
        const res = await fetch(`/api/inspecciones/${idAEliminar}`, { method: 'DELETE' });
        if (res.ok) {
          setInspecciones(prev => prev.filter(item => item.id !== idAEliminar));
          mostrarAlerta('¡Registro eliminado correctamente!', 'exito');
        }
      } else {
        const res = await fetch(`/api/temperatura/${idAEliminar}`, { method: 'DELETE' });
        if (res.ok) {
          setTemperaturas(prev => prev.filter(item => item.id !== idAEliminar));
          mostrarAlerta('¡Registro eliminado correctamente!', 'exito');
        }
      }
    } catch {
      mostrarAlerta('Error al eliminar el registro.', 'error');
    } finally {
      setModalEliminarAbierto(false);
      setIdAEliminar(null);
    }
  };

  const ejecutarBorradoMasivo = async () => {
    try {
      if (tipoMasivo === 'temperatura_fecha') {
        const idsTempAEliminar = temperaturas
          .filter(t => t.fecha?.split('T')[0] === fechaBorrado)
          .map(t => t.id);

        if (idsTempAEliminar.length === 0) {
          mostrarAlerta('No se encontraron registros de temperatura para esta fecha.', 'error');
          setModalMasivoAbierto(false);
          return;
        }

        let eliminadosOk = true;
        for (const id of idsTempAEliminar) {
          const res = await fetch(`/api/temperatura/${id}`, { method: 'DELETE' });
          if (!res.ok) eliminadosOk = false;
        }

        if (eliminadosOk) {
          mostrarAlerta('¡Temperaturas eliminadas correctamente!', 'exito');
          setModalMasivoAbierto(false);
          fetchData();
        }
        return;
      }

      let idsAEliminar: number[] = [];
      if (tipoMasivo === 'fecha') {
        idsAEliminar = inspecciones.filter(i => i.fecha?.split('T')[0] === fechaBorrado).map(i => i.id);
      } else {
        idsAEliminar = inspecciones.filter(i => String(i.inspector_id).trim() === String(inspectorBorrado).trim()).map(i => i.id);
      }

      if (idsAEliminar.length === 0) {
        mostrarAlerta('No se encontraron registros para eliminar.', 'error');
        setModalMasivoAbierto(false);
        return;
      }

      let eliminadosOk = true;
      for (const id of idsAEliminar) {
        const res = await fetch(`/api/inspecciones/${id}`, { method: 'DELETE' });
        if (!res.ok) eliminadosOk = false;
      }

      if (eliminadosOk) {
        mostrarAlerta('¡Registros eliminados correctamente!', 'exito');
        setModalMasivoAbierto(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      mostrarAlerta('Error al conectar con el servidor.', 'error');
    }
  };

  const abrirEdicionInsp = (item: Inspeccion) => {
    const config = CATALOGO_PRODUCTOS[item.producto] || CATALOGO_PRODUCTOS["Zucchini"];
    
    let etapaDetectada = config.etapas[0].nombre;
    let cuadroDetectado = config.etapas[0].cuadros[0];
    if (item.cuadro && item.cuadro.includes('Cuadro:')) {
      const partes = item.cuadro.split('(Cuadro:');
      etapaDetectada = partes[0].trim();
      cuadroDetectado = partes[1] ? partes[1].replace(')', '').trim() : cuadroDetectado;
    }

    const tempExtraida = item.temperatura ?? item.temperatura_c ?? item.temp ?? 6.2;

    let bolsaOpcion = 'Sin Bolsa (S/B)';
    let bolsaDetalle = '';
    if (item.tipo_bolsa) {
      if (item.tipo_bolsa.startsWith('Variado:')) {
        bolsaOpcion = 'Variado';
        bolsaDetalle = item.tipo_bolsa.replace('Variado:', '').trim();
      } else if (item.tipo_bolsa.includes('Con Bolsa') || item.tipo_bolsa.includes('C/B')) {
        bolsaOpcion = 'Con Bolsa (C/B)';
      } else {
        bolsaOpcion = 'Sin Bolsa (S/B)';
      }
    }

    setFormInsp({
      fecha: item.fecha?.split('T')[0] || '',
      hora: item.hora || '',
      inspector_id: item.inspector_id || '100',
      categoria: item.categoria || 'Frescas',
      producto: item.producto || 'Zucchini',
      variedad: item.variedad || config.variedades[0],
      etapaSeleccionada: etapaDetectada,
      cuadroSeleccionado: cuadroDetectado,
      empaque: item.empaque || config.empaques[0],
      tipo_bolsa_opcion: bolsaOpcion,
      tipo_bolsa_detalle: bolsaDetalle,
      con_etiqueta: item.con_etiqueta ?? true,
      temperatura: Number(tempExtraida),
      peso: item.peso || 22.87,
      peso_unidad: item.peso_unidad || 'lb',
      calidad_global: item.calidad_global || item.calidad || 'Primera (Limpia)',
      total_muestras: item.total_muestras || 0,
      porcentaje_general: item.porcentaje_general ?? 100,
      porcentaje_primera: item.porcentaje_primera ?? 0,
      porcentaje_segunda: item.porcentaje_segunda ?? 0,
      porcentaje_rezaga: item.porcentaje_rezaga ?? 0,
      empacador_num: item.empacador_num || 5,
      empacador_nombre: item.empacador_nombre || CAT_EMPACADORES[item.empacador_num || 5]
    });

    const listaTamanos = TAMAÑOS_POR_PRODUCTO[item.producto || 'Zucchini'] || ["FANCY", "MEDIUM"];
    const nuevoTamanosObj: Record<string, number> = {};
    listaTamanos.forEach(t => { nuevoTamanosObj[t] = 0; });

    if (item.tamano_resumen && item.tamano_resumen !== 'Sin desglose' && item.tamano_resumen !== 'N/D') {
      const fragmentos = item.tamano_resumen.split('|');
      fragmentos.forEach(frag => {
        const [tam, pzStr] = frag.split(':');
        if (tam && pzStr) {
          const tName = tam.trim();
          const pzNum = parseInt(pzStr.replace('pz', '').trim()) || 0;
          nuevoTamanosObj[tName] = pzNum;
        }
      });
    }
    setTamanosPz(nuevoTamanosObj);

    if (item.desglose_defectos && Array.isArray(item.desglose_defectos) && item.desglose_defectos.length > 0) {
      setDefectosLista(item.desglose_defectos);
    } else if (item.defecto && item.defecto !== 'NINGUNO' && item.defecto !== 'Ninguno') {
      const listaRecuperada: Array<{ tipo: string; clasificacion: string; piezas: number }> = [];
      const partes = item.defecto.split('|');
      partes.forEach(parte => {
        const match = parte.match(/(Primera|Segunda|Rezaga):\s*(.*?)\s*\((.*?)\s*pz\)/i);
        if (match) {
          const clasif = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
          const nomDef = match[2].trim();
          const pzNum = Number(match[3]) || 1;
          if (nomDef !== 'NINGUNO') {
            listaRecuperada.push({ clasificacion: clasif, tipo: nomDef, piezas: pzNum });
          }
        }
      });
      setDefectosLista(listaRecuperada);
    } else {
      setDefectosLista([]);
    }

    setIdInspEditando(item.id);
    setModoEdicionInsp(true);
    setModalInspAbierto(true);
  };

  const generarReporteFiltrado = (filtros: { fecha: string; inspectorId: string; variedad: string }) => {
    const filtradas = inspecciones.filter(i => {
      const matchFecha = i.fecha?.split('T')[0] === filtros.fecha;
      const matchInspector = filtros.inspectorId === 'TODOS' || String(i.inspector_id).trim() === filtros.inspectorId;
      const matchVariedad = filtros.variedad === 'TODAS' || i.producto === filtros.variedad || i.variedad === filtros.variedad;
      return matchFecha && matchInspector && matchVariedad;
    });

    if (filtradas.length === 0) {
      mostrarAlerta('No se encontraron registros para los filtros seleccionados.', 'error');
      return;
    }

    const totalMuestras = filtradas.reduce((acc, curr) => acc + Number(curr.total_muestras || 0), 0) || 100;
    
    const desgloseMap: Record<string, { tipo: string; piezas: number }> = {};
    
    filtradas.forEach(f => {
      if (f.defecto && f.defecto !== 'NINGUNO' && f.defecto !== 'Ninguno') {
        const fragmentos = f.defecto.split('|');
        fragmentos.forEach(frag => {
          const match = frag.match(/(Primera|Segunda|Rezaga):\s*(.*?)\s*\((.*?)\s*pz\)/i);
          if (match) {
            const clasif = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            const nombre = match[2].trim();
            const pz = Number(match[3]) || 0;
            if (nombre !== 'NINGUNO' && pz > 0) {
              const key = `${nombre} (${clasif})`;
              if (!desgloseMap[key]) desgloseMap[key] = { tipo: clasif, piezas: 0 };
              desgloseMap[key].piezas += pz;
            }
          }
        });
      }
    });

    const desglose = Object.keys(desgloseMap).map(key => {
      const pz = desgloseMap[key].piezas;
      const pct = Number(((pz / totalMuestras) * 100).toFixed(1));
      return { nombre: key, tipo: desgloseMap[key].tipo, porcentaje: pct, piezas: pz };
    });

    const totalDefectosPz = desglose.reduce((acc, curr) => acc + curr.piezas, 0);
    const pctDefectosTotales = Number(((totalDefectosPz / totalMuestras) * 100).toFixed(2));
    const pctBuenaCalidad = Number((100 - pctDefectosTotales).toFixed(2));
    
    const tempPromedio = Number(filtradas[0]?.temperatura ?? filtradas[0]?.temperatura_c ?? filtradas[0]?.temp ?? 6.2);
    const pesoPromedio = Number(filtradas[0]?.peso || 22.87);
    const pesoUnidad = filtradas[0]?.peso_unidad || 'lb';
    const tipoBolsa = filtradas[0]?.tipo_bolsa || 'Sin Bolsa (S/B)';
    const inspectorObj = filtradas[0]?.nombre_inspector || 'Rubí';

    setDatosReporteImpresion({
      fecha: filtros.fecha,
      inspector: inspectorObj,
      producto: filtradas[0]?.producto || 'ZUCCHINI',
      empaque: filtradas[0]?.empaque || 'Rico Farms',
      tipoBolsa,
      peso: `${pesoPromedio} ${pesoUnidad}`,
      cuadro: filtradas[0]?.cuadro || 'Cuadro 5',
      totalMuestras,
      porcentajeBuenaCalidad: pctBuenaCalidad,
      porcentajeDefectosTotales: pctDefectosTotales,
      temperatura: tempPromedio,
      desgloseDefectos: desglose
    });

    setModalReporteAbierto(false);
    setTimeout(() => { window.print(); }, 300);
  };

  const inspeccionesFiltradas = inspecciones.filter(i => {
    const fechaReg = i.fecha?.split('T')[0];
    const matchFecha = soloHoy ? (fechaReg === fechaHoyStr) : (filtroFecha ? fechaReg === filtroFecha : true);
    const matchInspector = filtroInspector === 'TODOS' || String(i.inspector_id).trim() === String(filtroInspector).trim();
    const matchVariedad = filtroVariedad === 'TODAS' || i.producto === filtroVariedad || i.variedad === filtroVariedad;

    return matchFecha && matchInspector && matchVariedad;
  });

  const trabajadoresFiltrados = Object.entries(CAT_EMPACADORES).filter(([id, nombre]) => {
    if (!busquedaTrabajadorId.trim()) return true;
    const termino = busquedaTrabajadorId.trim().toLowerCase();
    return id.includes(termino) || nombre.toLowerCase().includes(termino);
  });

  const configActual = CATALOGO_PRODUCTOS[formInsp.producto] || CATALOGO_PRODUCTOS["Zucchini"];
  const etapaActualObj = configActual.etapas.find(et => et.nombre === formInsp.etapaSeleccionada) || configActual.etapas[0];
  const tamanosDisponibles = TAMAÑOS_POR_PRODUCTO[formInsp.producto] || ["FANCY", "MEDIUM"];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-100 min-h-screen text-slate-800 relative">
      
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      {notificacion && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-5 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 transition animate-fade-in ${
            notificacion.tipo === 'exito' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-900/10' : 'bg-red-50 border-red-300 text-red-900 shadow-red-900/10'
          }`}>
            <span className="text-sm">{notificacion.tipo === 'exito' ? '✅' : '⚠️'}</span>
            <span>{notificacion.mensaje}</span>
          </div>
        </div>
      )}

      {/* CABECERA ADMIN CON LOGO */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border mb-6 gap-4 no-print">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Logo Rico Farms" 
            className="h-12 w-auto object-contain rounded-lg"
          />
          <div>
            <h1 className="font-black text-base text-slate-900">Panel de Administrador — Miriam León Ibarra (ID 100)</h1>
            <p className="text-xs text-slate-500">Supervisión, reportes por inspectora y variedad, edición y control total</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { 
            const hoy = new Date();
            const listaTav = TAMAÑOS_POR_PRODUCTO["Zucchini"] || ["FANCY", "MEDIUM"];
            const ceros: Record<string, number> = {};
            listaTav.forEach(t => { ceros[t] = 0; });
            setTamanosPz(ceros);
            setDefectosLista([]);

            setFormInsp(prev => ({
              ...prev,
              fecha: hoy.toISOString().split('T')[0],
              hora: hoy.toTimeString().split(' ')[0].substring(0, 5),
              tipo_bolsa_opcion: 'Sin Bolsa (S/B)',
              tipo_bolsa_detalle: '',
              total_muestras: 0,
              porcentaje_general: 100,
              porcentaje_primera: 0,
              porcentaje_segunda: 0,
              porcentaje_rezaga: 0
            }));
            setModoEdicionInsp(false); 
            setModalInspAbierto(true); 
          }} className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold transition shadow-sm cursor-pointer">
            <PlusCircle className="w-4 h-4" /> Agregar Inspección
          </button>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl font-semibold transition cursor-pointer">
            <RefreshCcw className="w-4 h-4" /> Actualizar
          </button>
          <button onClick={() => setModalReporteAbierto(true)} className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-semibold transition cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimir Reporte
          </button>
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl font-semibold transition cursor-pointer">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </div>

      {/* PANEL DE BORRADO MASIVO */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-3 mb-6 no-print">
        <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">Depuración y Borrado Masivo de Registros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border">
            <input type="date" value={fechaBorrado} onChange={e => setFechaBorrado(e.target.value)} className="border p-2 rounded-lg bg-white text-xs font-bold flex-1" />
            <button onClick={() => {
              if (!fechaBorrado) { mostrarAlerta('Selecciona una fecha válida.', 'error'); return; }
              setTipoMasivo('fecha');
              setModalMasivoAbierto(true);
            }} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer">
              Borrar Insp. por Día
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border">
            <input type="date" value={fechaBorrado} onChange={e => setFechaBorrado(e.target.value)} className="border p-2 rounded-lg bg-white text-xs font-bold flex-1" />
            <button onClick={() => {
              if (!fechaBorrado) { mostrarAlerta('Selecciona una fecha válida.', 'error'); return; }
              setTipoMasivo('temperatura_fecha');
              setModalMasivoAbierto(true);
            }} className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer">
              Borrar Temp. por Día
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border">
            <select value={inspectorBorrado} onChange={e => setInspectorBorrado(e.target.value)} className="border p-2 rounded-lg bg-white text-xs font-bold flex-1">
              <option value="001">Rubí (001)</option>
              <option value="002">Martha (002)</option>
              <option value="003">Mónica (003)</option>
            </select>
            <button onClick={() => {
              setTipoMasivo('inspector');
              setModalMasivoAbierto(true);
            }} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer">
              Borrar por Inspectora
            </button>
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="no-print space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('inspecciones')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${activeTab === 'inspecciones' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'}`}>
            <ClipboardList className="w-4 h-4" /> Inspecciones ({inspecciones.length})
          </button>
          <button onClick={() => setActiveTab('temperaturas')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${activeTab === 'temperaturas' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'}`}>
            <Thermometer className="w-4 h-4" /> Temperatura ({temperaturas.length})
          </button>
          <button onClick={() => setActiveTab('trabajadores')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${activeTab === 'trabajadores' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border'}`}>
            <Users className="w-4 h-4" /> Trabajadores / Empacadores (19)
          </button>
        </div>

        {activeTab === 'inspecciones' && (
          <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-3 mb-2 no-print">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                🔍 Buscador Inteligente y Filtros de Producción
              </h3>
              <button 
                onClick={() => {
                  setFiltroFecha(fechaHoyStr);
                  setFiltroInspector('TODOS');
                  setFiltroVariedad('TODAS');
                  setSoloHoy(false);
                }} 
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Fecha</label>
                <input 
                  type="date" 
                  value={filtroFecha} 
                  disabled={soloHoy}
                  onChange={e => setFiltroFecha(e.target.value)} 
                  className="w-full border p-2 rounded-xl bg-slate-50 text-xs font-bold" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Variedad / Producto</label>
                <select 
                  value={filtroVariedad} 
                  onChange={e => setFiltroVariedad(e.target.value)} 
                  className="w-full border p-2 rounded-xl bg-slate-50 text-xs font-bold"
                >
                  <option value="TODAS">Todas las variedades</option>
                  {Array.from(new Set(inspecciones.map(i => i.producto))).map(prod => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Inspectora</label>
                <select 
                  value={filtroInspector} 
                  onChange={e => setFiltroInspector(e.target.value)} 
                  className="w-full border p-2 rounded-xl bg-slate-50 text-xs font-bold"
                >
                  <option value="TODOS">Todas las inspectoras</option>
                  <option value="001">Rubí (001)</option>
                  <option value="002">Martha (002)</option>
                  <option value="003">Mónica (003)</option>
                  <option value="100">Miriam (100 - Admin)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button 
                  onClick={() => setSoloHoy(!soloHoy)} 
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    soloHoy ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {soloHoy ? '📅 Mostrando solo Hoy' : '📅 Ver Solo de Hoy'}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1 flex justify-between items-center">
              <span>Mostrando <strong className="text-slate-900">{inspeccionesFiltradas.length}</strong> registros coincidentes.</span>
              {inspeccionesFiltradas.length === 0 && (
                <span className="text-amber-600 font-bold">⚠️ No hay registros para estos criterios.</span>
              )}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
              <div>
                <h2 className="font-black text-sm text-slate-900 uppercase">
                  {activeTab === 'inspecciones' ? 'Panel de Control Consolidado - Rico Farms' : activeTab === 'temperaturas' ? 'Historial de Temperatura Diario' : 'Búsqueda y Módulo de Empacadores por ID'}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeTab === 'trabajadores' ? 'Consulta individual de rendimiento y registros por número de empacador' : 'Registros organizados por Inspectora y Variedad'}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400 font-semibold">Cargando registros...</div>
          ) : activeTab === 'inspecciones' ? (
            <div className="space-y-6">
              {['001', '002', '003', '100'].map(inspId => {
                const registrosInsp = inspeccionesFiltradas.filter(i => String(i.inspector_id).trim() === inspId);
                if (registrosInsp.length === 0) return null;
                const nombreInsp = inspId === '001' ? 'Rubí (ID 001)' : inspId === '002' ? 'Martha (ID 002)' : inspId === '003' ? 'Mónica (ID 003)' : 'Miriam (Admin 100)';

                const variedadesDeInsp = Array.from(new Set(registrosInsp.map(r => r.producto)));

                return (
                  <div key={inspId} className="border rounded-2xl p-4 bg-slate-50/50 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-black text-xs text-slate-900 uppercase">Inspectora: {nombreInsp}</h3>
                      <span className="bg-emerald-100 text-emerald-800 font-black text-[11px] px-2.5 py-1 rounded-full">{registrosInsp.length} Registros</span>
                    </div>

                    {variedadesDeInsp.map(variedad => {
                      const registrosVar = registrosInsp.filter(r => r.producto === variedad);
                      return (
                        <div key={variedad} className="bg-white p-3 rounded-xl border shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b pb-1">
                            <span>Variedad: <span className="text-emerald-700">{variedad}</span></span>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{registrosVar.length} Cosechas</span>
                          </div>
                          <TablaInspecciones registros={registrosVar} abrirEdicionInsp={abrirEdicionInsp} abrirModalEliminar={(tipo, id) => { setTipoEliminacion(tipo); setIdAEliminar(id); setModalEliminarAbierto(true); }} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'temperaturas' ? (
            <div className="space-y-3">
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5">Hora</th>
                      <th className="p-2.5">Producto</th>
                      <th className="p-2.5">Temperatura</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5">Observaciones</th>
                      <th className="p-2.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {temperaturas.map(temp => (
                      <tr key={temp.id} className="border-b hover:bg-slate-50">
                        <td className="p-2.5 font-bold">#{temp.id}</td>
                        <td className="p-2.5">{temp.fecha?.split('T')[0]}</td>
                        <td className="p-2.5">{temp.hora}</td>
                        <td className="p-2.5">{temp.producto}</td>
                        <td className="p-2.5 font-black text-cyan-700">{temp.estado === 'Excepción (Sin Toma)' ? 'N/A' : `${temp.temperatura_c ?? temp.temperatura} °C`}</td>
                        <td className="p-2.5"><span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">{temp.estado || 'Normal'}</span></td>
                        <td className="p-2.5 text-slate-600">{temp.observaciones}</td>
                        <td className="p-2.5 text-center flex justify-center gap-2">
                          <button onClick={() => { setTipoEliminacion('temperatura'); setIdAEliminar(temp.id); setModalEliminarAbierto(true); }} className="text-red-500 hover:text-red-700 cursor-pointer" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="bg-emerald-600 text-white p-2 rounded-xl"><Search className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-black text-xs text-slate-800 uppercase">Búsqueda Rápida de Empacador</h3>
                    <p className="text-[11px] text-slate-500">Escribe el número ID (1-19) o el nombre del trabajador</p>
                  </div>
                </div>

                <div className="w-full sm:w-80 relative">
                  <input 
                    type="text" 
                    placeholder="Buscar por ID (ej. 5) o Nombre..." 
                    value={busquedaTrabajadorId}
                    onChange={e => setBusquedaTrabajadorId(e.target.value)}
                    className="w-full border-2 border-emerald-500/40 focus:border-emerald-600 p-2.5 rounded-xl text-xs font-bold bg-white outline-none shadow-sm"
                  />
                  {busquedaTrabajadorId && (
                    <button 
                      onClick={() => setBusquedaTrabajadorId('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {trabajadoresFiltrados.map(([idNumStr, nombreEmpacador]) => {
                  const empId = Number(idNumStr);
                  const inspeccionesDelEmpacador = inspecciones.filter(i => Number(i.empacador_num) === empId);
                  const totalPiezasMuestra = inspeccionesDelEmpacador.reduce((acc, curr) => acc + (Number(curr.total_muestras) || 0), 0);

                  return (
                    <div key={empId} className="border rounded-2xl p-4 bg-white shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl font-black flex items-center justify-center text-sm shadow-sm">
                            #{empId}
                          </div>
                          <div>
                            <h4 className="font-black text-xs text-slate-900 uppercase">{nombreEmpacador}</h4>
                            <span className="text-[11px] text-slate-500 font-semibold">ID Oficial de Empaque: <strong>{empId}</strong></span>
                          </div>
                        </div>

                        <div className="flex gap-2 text-[11px] font-bold">
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border">
                            <strong>{inspeccionesDelEmpacador.length}</strong> Inspecciones
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200">
                            <strong>{totalPiezasMuestra}</strong> Piezas Evaluadas
                          </span>
                        </div>
                      </div>

                      {inspeccionesDelEmpacador.length > 0 ? (
                        <TablaInspecciones 
                          registros={inspeccionesDelEmpacador} 
                          abrirEdicionInsp={abrirEdicionInsp} 
                          abrirModalEliminar={(tipo, id) => { setTipoEliminacion(tipo); setIdAEliminar(id); setModalEliminarAbierto(true); }} 
                        />
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-400 font-semibold italic bg-slate-50 rounded-xl">
                          Sin inspecciones registradas para el empacador #{empId}.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL ELIMINAR */}
      {modalEliminarAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4 text-xs text-slate-800 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">!</div>
            <h3 className="font-black text-sm text-slate-900">¿Estás seguro de eliminar?</h3>
            <p className="text-slate-500">Esta acción eliminará el registro permanentemente.</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModalEliminarAbierto(false)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl cursor-pointer">Cancelar</button>
              <button onClick={ejecutarEliminacion} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl cursor-pointer">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BORRADO MASIVO */}
      {modalMasivoAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4 text-xs text-slate-800 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">⚠️</div>
            <h3 className="font-black text-sm text-slate-900">Confirmar Borrado Masivo</h3>
            <p className="text-slate-500">
              {tipoMasivo === 'temperatura_fecha' ? `¿Deseas eliminar las temperaturas de la fecha: ${fechaBorrado}?` : tipoMasivo === 'fecha' ? `¿Deseas eliminar las inspecciones de la fecha: ${fechaBorrado}?` : `¿Deseas eliminar las inspecciones de la inspectora ID: ${inspectorBorrado}?`}
            </p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModalMasivoAbierto(false)} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl cursor-pointer">Cancelar</button>
              <button onClick={ejecutarBorradoMasivo} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl cursor-pointer">Sí, borrar todo</button>
            </div>
          </div>
        </div>
      )}

      {/* REPORTE IMPRESO CON LOGO */}
      {datosReporteImpresion && (
        <div className="print-only p-6 bg-white text-slate-900 font-sans max-w-4xl mx-auto space-y-4 text-xs">
          
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo Rico Farms" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="font-black text-sm uppercase tracking-wider text-slate-900">INFORME DE CONTROL DE CALIDAD</h1>
                <p className="text-[10px] text-slate-600 font-semibold">Empaque San Luis · Rico Farms</p>
              </div>
            </div>
            <div className="text-right font-bold text-[11px]">
              <div>{datosReporteImpresion.fecha}</div>
              <div className="text-emerald-700 font-black">Consolidado Oficial</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold border rounded-xl overflow-hidden bg-slate-50">
            <div className="border-r p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[8px]">PRODUCTOR</div>
              <div className="font-black text-slate-800 mt-1">AGRICOLA SONORG SA DE CV</div>
            </div>
            <div className="border-r p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[8px]">PRODUCTO / EMPAQUE</div>
              <div className="font-black text-slate-800 mt-1">{datosReporteImpresion.producto} ({datosReporteImpresion.empaque})</div>
            </div>
            <div className="border-r p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[8px]">TIPO DE EMPAQUE</div>
              <div className="font-black text-slate-800 mt-1">{datosReporteImpresion.tipoBolsa}</div>
            </div>
            <div className="border-r p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[8px]">PESO CAJA</div>
              <div className="font-black text-cyan-800 mt-1">{datosReporteImpresion.peso}</div>
            </div>
            <div className="p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[8px]">INSPECTOR</div>
              <div className="font-black text-slate-800 mt-1">{datosReporteImpresion.inspector}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-bold">
            <div className="border rounded-xl p-2 bg-slate-50"><div className="text-[9px] text-slate-500">MUESTRA TOTAL</div><div className="text-sm font-black text-slate-900">{datosReporteImpresion.totalMuestras} PZ</div></div>
            <div className="border rounded-xl p-2 bg-emerald-50 text-emerald-900"><div className="text-[9px] text-emerald-700">% BUENA CALIDAD</div><div className="text-sm font-black">{datosReporteImpresion.porcentajeBuenaCalidad}%</div></div>
            <div className="border rounded-xl p-2 bg-red-50 text-red-900"><div className="text-[9px] text-red-700">% DEFECTOS</div><div className="text-sm font-black">{datosReporteImpresion.porcentajeDefectosTotales}%</div></div>
          </div>

          <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-900 uppercase font-black">SEMÁFORO DE CALIDAD:</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded font-black text-[9px]">≤ 80%</span>
                <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-black text-[9px]">80 - 90%</span>
                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded font-black text-[9px]">≥ 90%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">este lote tiene <strong>{datosReporteImpresion.porcentajeBuenaCalidad}%</strong> de buena calidad:</span>
                <span className={`px-3 py-1 rounded-lg font-black text-white text-[10px] tracking-wide uppercase ${
                  datosReporteImpresion.porcentajeBuenaCalidad >= 90 ? 'bg-emerald-600' : datosReporteImpresion.porcentajeBuenaCalidad >= 80 ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                  {datosReporteImpresion.porcentajeBuenaCalidad >= 90 ? 'ACEPTABLE' : datosReporteImpresion.porcentajeBuenaCalidad >= 80 ? 'TOLERABLE' : 'CRÍTICA'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold">
              <div className="flex items-center gap-2">
                <span className="text-slate-900 uppercase font-black">TEMPERATURA (°C):</span>
                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded font-black text-[9px]">5 - 10°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">capturada ( <strong>{datosReporteImpresion.temperatura} °C</strong> ) es:</span>
                <span className={`px-3 py-1 rounded-lg font-black text-white text-[10px] tracking-wide uppercase ${
                  datosReporteImpresion.temperatura >= 5 && datosReporteImpresion.temperatura <= 10 ? 'bg-emerald-600' : datosReporteImpresion.temperatura <= 12 ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                  {datosReporteImpresion.temperatura >= 5 && datosReporteImpresion.temperatura <= 10 ? 'ACEPTABLE' : datosReporteImpresion.temperatura <= 12 ? 'TOLERABLE' : 'CRÍTICA'}
                </span>
              </div>
            </div>
          </div>

          <div className="border p-5 rounded-xl space-y-4 bg-white break-inside-avoid">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">GRÁFICA DE DEFECTOS (ESCALA 0% A 100%)</h3>
            <div className="space-y-2.5 pt-2">
              {datosReporteImpresion.desgloseDefectos.length === 0 ? (
                <div className="text-center py-4 text-emerald-700 font-bold">100% Buena Calidad - Sin Defectos Detectados</div>
              ) : (
                datosReporteImpresion.desgloseDefectos.map((def: any, idx: number) => {
                  const colorBarra = def.tipo === 'Primera' ? 'bg-emerald-500' : def.tipo === 'Segunda' ? 'bg-amber-500' : 'bg-red-500';
                  const anchoPorcentaje = Math.min(100, Math.max(2, def.porcentaje));

                  return (
                    <div key={idx} className="flex items-center text-[10px] font-bold gap-3">
                      <div className="w-44 text-right truncate text-slate-700 font-semibold" title={def.nombre}>{def.nombre}</div>
                      <div className="flex-1 bg-slate-100 h-5 rounded-md overflow-hidden relative border border-slate-200">
                        <div className={`h-full ${colorBarra} transition-all duration-300 rounded-r-md`} style={{ width: `${anchoPorcentaje}%` }}></div>
                      </div>
                      <div className="w-12 text-left font-black text-slate-900 text-[11px]">{def.porcentaje}%</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      <ReporteModal 
        isOpen={modalReporteAbierto}
        onClose={() => setModalReporteAbierto(false)}
        variedadesDisponibles={Array.from(new Set(inspecciones.map(i => i.producto)))}
        onGenerar={generarReporteFiltrado}
      />

      {/* MODAL CREAR / EDITAR */}
      {modalInspAbierto && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-3xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs font-semibold">
            <h3 className="font-black text-sm text-slate-900">{modoEdicionInsp ? 'Editar Registro de Inspección' : 'Nuevo Registro de Inspección (Admin)'}</h3>
            
            <form onSubmit={handleSubmitInsp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <label className="text-slate-600 block mb-1">Fecha</label>
                  <input type="date" value={formInsp.fecha} onChange={e => setFormInsp({...formInsp, fecha: e.target.value})} required className="w-full border p-2.5 rounded-xl bg-white font-bold" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Hora</label>
                  <input type="time" value={formInsp.hora} onChange={e => setFormInsp({...formInsp, hora: e.target.value})} required className="w-full border p-2.5 rounded-xl bg-white font-bold" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 flex items-center gap-1 font-bold text-cyan-800">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-600" /> Temp (°C)
                  </label>
                  <input type="number" step="0.1" name="temperatura" value={formInsp.temperatura} onChange={handleInspChange} required className="w-full border p-2.5 rounded-xl bg-cyan-50/60 font-black text-cyan-900" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Peso ({formInsp.peso_unidad})</label>
                  <input type="number" step="0.01" name="peso" value={formInsp.peso} onChange={handleInspChange} required className="w-full border p-2.5 rounded-xl bg-white font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Registrado por (Inspectora)</label>
                  <select value={formInsp.inspector_id} onChange={e => setFormInsp({...formInsp, inspector_id: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    <option value="001">Rubí (001)</option>
                    <option value="002">Martha (002)</option>
                    <option value="003">Mónica (003)</option>
                    <option value="100">Miriam (100 - Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Número de Empacador (1 al 19)</label>
                  <select value={formInsp.empacador_num} onChange={handleEmpacadorChange} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    {Object.keys(CAT_EMPACADORES).map(num => (
                      <option key={num} value={num}>Empacador #{num} - {CAT_EMPACADORES[Number(num)]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Empacador Asignado:</span>
                  <span className="font-black text-emerald-700 text-xs">{formInsp.empacador_nombre}</span>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-600 block mb-1 text-[11px] font-bold">Tipo de Empaque (Bolsa)</label>
                  <select 
                    name="tipo_bolsa_opcion" 
                    value={formInsp.tipo_bolsa_opcion} 
                    onChange={handleInspChange} 
                    className="w-full border p-2 rounded-lg bg-white font-bold text-xs"
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
                      className="w-full border p-1.5 rounded-lg bg-amber-50 font-bold text-xs border-amber-300 mt-1" 
                    />
                  )}
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 text-[11px]">¿Lleva Etiqueta?</label>
                  <select value={formInsp.con_etiqueta ? "true" : "false"} onChange={e => setFormInsp({...formInsp, con_etiqueta: e.target.value === "true"})} className="w-full border p-2 rounded-lg bg-white font-bold">
                    <option value="true">Con Etiqueta (C/E)</option>
                    <option value="false">Sin Etiqueta (S/E)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Producto</label>
                  <select value={formInsp.producto} onChange={handleProductoChange} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    {Object.keys(CATALOGO_PRODUCTOS).map(prod => (
                      <option key={prod} value={prod}>{prod}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Variedad</label>
                  <select value={formInsp.variedad} onChange={e => setFormInsp({...formInsp, variedad: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    {configActual.variedades.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Tipo de Empaque</label>
                  <select value={formInsp.empaque} onChange={e => setFormInsp({...formInsp, empaque: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    {configActual.empaques.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Etapa</label>
                  <select value={formInsp.etapaSeleccionada} onChange={handleEtapaChange} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    {configActual.etapas.map(et => (
                      <option key={et.nombre} value={et.nombre}>{et.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Cuadro</label>
                  <select value={formInsp.cuadroSeleccionado} onChange={e => setFormInsp({...formInsp, cuadroSeleccionado: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    {etapaActualObj.cuadros.map(cuadro => (
                      <option key={cuadro} value={cuadro}>Cuadro: {cuadro}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Calidad Global</label>
                  <select name="calidad_global" value={formInsp.calidad_global} onChange={handleInspChange} className="w-full border p-2.5 rounded-xl bg-white font-bold text-emerald-800">
                    <option value="Primera (Limpia)">Primera (Limpia)</option>
                    <option value="Primera con defectos menores">Primera con defectos menores</option>
                    <option value="Segunda">Segunda</option>
                    <option value="Rechazo">Rechazo</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
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
                        <PlusCircle className="w-4 h-4" />
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
                          <button type="button" onClick={() => eliminarDefecto(idx)} className="text-red-500 hover:text-red-700 cursor-pointer">
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

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setModalInspAbierto(false)} className="px-4 py-2 bg-slate-200 rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function TablaInspecciones({ registros, abrirEdicionInsp, abrirModalEliminar }: { registros: Inspeccion[]; abrirEdicionInsp: (i: Inspeccion) => void; abrirModalEliminar: (tipo: 'inspeccion' | 'temperatura', id: number) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] text-left">
        <thead className="bg-slate-200/70 text-slate-700 font-bold">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Fecha / Hora</th>
            <th className="p-2">Temp / Peso</th>
            <th className="p-2">Empacador</th>
            <th className="p-2">Producto / Variedad</th>
            <th className="p-2">Cuadro / Etapa</th>
            <th className="p-2">Calidad Global</th>
            <th className="p-2">Desglose de Tamaños</th>
            <th className="p-2">Daños Registrados</th>
            <th className="p-2">% Gen / 1ª / 2ª / Rez</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registros.map(insp => {
            const tempExtraida = insp.temperatura ?? insp.temperatura_c ?? insp.temp;
            const tempValida = (tempExtraida !== undefined && tempExtraida !== null && tempExtraida !== '' && !isNaN(Number(tempExtraida))) 
              ? `${Number(tempExtraida).toFixed(1)} °C` 
              : 'N/D';

            const pGen = insp.porcentaje_general !== undefined ? insp.porcentaje_general : 100;
            const p1 = insp.porcentaje_primera !== undefined ? insp.porcentaje_primera : 0;
            const p2 = insp.porcentaje_segunda !== undefined ? insp.porcentaje_segunda : 0;
            const pRez = insp.porcentaje_rezaga !== undefined ? insp.porcentaje_rezaga : 0;
            const calidadMostrar = insp.calidad_global || insp.calidad || 'Primera (Limpia)';
            const bolsaMostrar = insp.tipo_bolsa || 'S/B';

            return (
              <tr key={insp.id} className="border-b bg-white hover:bg-slate-50">
                <td className="p-2 font-bold">#{insp.id}</td>
                <td className="p-2">{insp.fecha?.split('T')[0]} ({insp.hora})</td>
                <td className="p-2">
                  <span className="font-black text-cyan-700 block">{tempValida}</span>
                  <span className="font-semibold text-slate-600 text-[10px]">{insp.peso ?? 0} {insp.peso_unidad || 'lb'}</span>
                </td>
                <td className="p-2 font-bold text-emerald-700">#{insp.empacador_num}</td>
                <td className="p-2 font-medium">
                  {insp.producto} <span className="text-slate-400 text-[10px]">({insp.variedad})</span>
                  <span className="text-emerald-700 block text-[10px] font-bold">{bolsaMostrar}</span>
                </td>
                <td className="p-2">{insp.cuadro}</td>
                <td className="p-2 font-bold text-emerald-800">{calidadMostrar}</td>
                <td className="p-2 font-black text-slate-800">
                  {insp.tamano_resumen && insp.tamano_resumen !== 'Sin desglose' && insp.tamano_resumen !== 'N/D' ? insp.tamano_resumen : `Total: ${insp.total_muestras} pz`}
                </td>
                <td className="p-2 text-slate-700 max-w-[180px] truncate" title={insp.defecto}>{insp.defecto}</td>
                <td className="p-2 font-bold">
                  <span className="text-cyan-800">{pGen}%</span> / {' '}
                  <span className="text-emerald-700">{p1}%</span> / {' '}
                  <span className="text-amber-700">{p2}%</span> / {' '}
                  <span className="text-red-700">{pRez}%</span>
                </td>
                <td className="p-2 text-center flex justify-center gap-2">
                  <button onClick={() => abrirEdicionInsp(insp)} className="text-blue-500 hover:text-blue-700 cursor-pointer" title="Editar"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => abrirModalEliminar('inspeccion', insp.id)} className="text-red-500 hover:text-red-700 cursor-pointer" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}