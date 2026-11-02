"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Printer, Trash2, Edit3, PlusCircle, LogOut, RefreshCcw, Thermometer, ClipboardList, AlertTriangle, Layers, Maximize2 } from 'lucide-react';
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
  con_etiqueta: boolean;
  tamano_resumen: string;
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

export default function AdminPage() {
  const router = useRouter();
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [temperaturas, setTemperaturas] = useState<Temperatura[]>([]);
  const [activeTab, setActiveTab] = useState<'inspecciones' | 'temperaturas'>('inspecciones');
  const [loading, setLoading] = useState(true);

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
    con_etiqueta: true,
    temperatura: 6.2,
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
    setFormInsp(prev => ({
      ...prev,
      fecha: hoy.toISOString().split('T')[0],
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

    const valorTempNum = Number(formInsp.temperatura) || 6.2;

    const payload = {
      ...formInsp,
      temperatura: valorTempNum,
      temperatura_c: valorTempNum,
      temp: valorTempNum,
      cuadro: cuadroFinal,
      piezas_defecto: totalDefectosPz,
      tamano_resumen: resumenTamanos || `Muestra: ${formInsp.total_muestras} pz`,
      defecto: `2ª: ${formInsp.defecto_segunda} (${formInsp.piezas_segunda} pz) | Rezaga: ${formInsp.defecto_rezaga} (${formInsp.piezas_rezaga} pz)`,
      categoria_defecto: formInsp.piezas_rezaga > 0 ? 'Rezaga' : 'Segunda'
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

      if (res.ok && (data.success || modoEdicionInsp)) {
        mostrarAlerta(modoEdicionInsp ? '¡Registro actualizado con éxito!' : '¡Inspección agregada con éxito!', 'exito');
        setModalInspAbierto(false);
        setModoEdicionInsp(false);
        fetchData();
      } else {
        mostrarAlerta('Error al guardar la inspección.', 'error');
      }
    } catch {
      mostrarAlerta('Error de conexión.', 'error');
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
        } else {
          mostrarAlerta('Algunas temperaturas no pudieron ser eliminadas.', 'error');
        }
        return;
      }

      let idsAEliminar: number[] = [];

      if (tipoMasivo === 'fecha') {
        idsAEliminar = inspecciones
          .filter(i => i.fecha?.split('T')[0] === fechaBorrado)
          .map(i => i.id);
      } else {
        idsAEliminar = inspecciones
          .filter(i => String(i.inspector_id).trim() === String(inspectorBorrado).trim())
          .map(i => i.id);
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
        mostrarAlerta('¡Registros eliminados correctamente de la base de datos!', 'exito');
        setModalMasivoAbierto(false);
        fetchData();
      } else {
        mostrarAlerta('Algunos registros no pudieron ser eliminados.', 'error');
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

    let defecto2da = 'NINGUNO';
    let pz2da = item.piezas_defecto || 0;
    let defectoRez = 'NINGUNO';
    let pzRez = 0;

    if (item.defecto && item.defecto.includes('2ª:')) {
      const partesDef = item.defecto.split('|');
      partesDef.forEach(parte => {
        if (parte.includes('2ª:')) {
          const match = parte.match(/2ª:\s*(.*?)\s*\((.*?)\s*pz\)/);
          if (match) {
            defecto2da = match[1].trim();
            pz2da = Number(match[2]);
          }
        }
        if (parte.includes('Rezaga:')) {
          const match = parte.match(/Rezaga:\s*(.*?)\s*\((.*?)\s*pz\)/);
          if (match) {
            defectoRez = match[1].trim();
            pzRez = Number(match[2]);
          }
        }
      });
    } else {
      if (item.categoria_defecto === 'Rezaga') {
        defectoRez = item.defecto || 'NINGUNO';
        pzRez = item.piezas_defecto || 0;
      } else {
        defecto2da = item.defecto || 'NINGUNO';
        pz2da = item.piezas_defecto || 0;
      }
    }

    const tempExtraida = item.temperatura ?? item.temperatura_c ?? item.temp ?? 6.2;

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
      con_etiqueta: item.con_etiqueta ?? true,
      temperatura: Number(tempExtraida),
      peso: item.peso || 22.87,
      peso_unidad: item.peso_unidad || 'lb',
      calidad: item.calidad || 'Primera',
      defecto_segunda: defecto2da,
      piezas_segunda: pz2da,
      defecto_rezaga: defectoRez,
      piezas_rezaga: pzRez,
      total_muestras: item.total_muestras || 0,
      porcentaje_defecto: item.porcentaje_defecto || 0,
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
      if (f.defecto && f.defecto.includes('2ª:')) {
        const partes = f.defecto.split('|');
        partes.forEach(p => {
          if (p.includes('2ª:')) {
            const m = p.match(/2ª:\s*(.*?)\s*\((.*?)\s*pz\)/);
            if (m && m[1].trim() !== 'NINGUNO' && Number(m[2]) > 0) {
              const nombre = m[1].trim();
              const pz = Number(m[2]);
              if (!desgloseMap[nombre]) desgloseMap[nombre] = { tipo: 'SEGUNDA', piezas: 0 };
              desgloseMap[nombre].piezas += pz;
            }
          }
          if (p.includes('Rezaga:')) {
            const m = p.match(/Rezaga:\s*(.*?)\s*\((.*?)\s*pz\)/);
            if (m && m[1].trim() !== 'NINGUNO' && Number(m[2]) > 0) {
              const nombre = m[1].trim();
              const pz = Number(m[2]);
              if (!desgloseMap[nombre]) desgloseMap[nombre] = { tipo: 'REZAGA', piezas: 0 };
              desgloseMap[nombre].piezas += pz;
            }
          }
        });
      }
    });

    const desglose = Object.keys(desgloseMap).map(nombre => {
      const pz = desgloseMap[nombre].piezas;
      const pct = Number(((pz / totalMuestras) * 100).toFixed(1));
      return { nombre, tipo: desgloseMap[nombre].tipo, porcentaje: pct, piezas: pz };
    });

    const totalDefectosPz = desglose.reduce((acc, curr) => acc + curr.piezas, 0);
    const pctDefectosTotales = Number(((totalDefectosPz / totalMuestras) * 100).toFixed(2));
    const pctBuenaCalidad = Number((100 - pctDefectosTotales).toFixed(2));
    const pctCalidad = Number(desglose.filter(d => d.tipo === 'SEGUNDA').reduce((a, c) => a + c.porcentaje, 0).toFixed(2));
    const pctCondicion = Number(desglose.filter(d => d.tipo === 'REZAGA').reduce((a, c) => a + c.porcentaje, 0).toFixed(2));
    
    const tempPromedio = Number(filtradas[0]?.temperatura ?? filtradas[0]?.temperatura_c ?? filtradas[0]?.temp ?? 6.2);

    const inspectorObj = filtradas[0]?.nombre_inspector || 'Miriam León Ibarra';

    setDatosReporteImpresion({
      fecha: filtros.fecha,
      inspector: inspectorObj,
      producto: filtradas[0]?.producto || 'ZUCCHINI',
      empaque: filtradas[0]?.empaque || 'Rico Farms',
      cuadro: filtradas[0]?.cuadro || 'Cuadro 5',
      totalMuestras,
      porcentajeBuenaCalidad: pctBuenaCalidad,
      porcentajeDefectosTotales: pctDefectosTotales,
      porcentajeDefectoCalidad: pctCalidad,
      porcentajeDefectoCondicion: pctCondicion,
      temperatura: tempPromedio,
      statusBuenaCalidad: pctBuenaCalidad >= 90 ? 'ACEPTABLE' : pctBuenaCalidad >= 80 ? 'TOLERABLE' : 'CRÍTICA',
      statusTemperatura: tempPromedio >= 5 && tempPromedio <= 10 ? 'ACEPTABLE' : tempPromedio <= 12 ? 'TOLERABLE' : 'CRÍTICA',
      desgloseDefectos: desglose
    });

    setModalReporteAbierto(false);
    setTimeout(() => { window.print(); }, 300);
  };

  const configActual = CATALOGO_PRODUCTOS[formInsp.producto] || CATALOGO_PRODUCTOS["Zucchini"];
  const etapaActualObj = configActual.etapas.find(et => et.nombre === formInsp.etapaSeleccionada) || configActual.etapas[0];
  const tamanosDisponibles = TAMAÑOS_POR_PRODUCTO[formInsp.producto] || ["FANCY", "MEDIUM"];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-100 min-h-screen text-slate-800 relative">
      
      <style jsx global>{`
        @media print {
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

      {/* CABECERA ADMIN */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border mb-6 gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-3 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
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

            setFormInsp(prev => ({
              ...prev,
              fecha: hoy.toISOString().split('T')[0],
              hora: hoy.toTimeString().split(' ')[0].substring(0, 5),
              total_muestras: 0,
              piezas_segunda: 0,
              piezas_rezaga: 0,
              porcentaje_defecto: 0
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
              <option value="002">María (002)</option>
              <option value="003">Marta Patricia (003)</option>
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
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white font-black p-2.5 rounded-xl">RF</div>
              <div>
                <h2 className="font-black text-sm text-slate-900 uppercase">Panel de Control Consolidado - Rico Farms</h2>
                <p className="text-xs text-slate-500">Registros organizados por Inspectora y Variedad</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400 font-semibold">Cargando registros...</div>
          ) : activeTab === 'inspecciones' ? (
            <div className="space-y-6">
              {['001', '002', '003', '100'].map(inspId => {
                const registrosInsp = inspecciones.filter(i => String(i.inspector_id).trim() === inspId);
                if (registrosInsp.length === 0) return null;
                const nombreInsp = inspId === '001' ? 'Rubí (ID 001)' : inspId === '002' ? 'María (ID 002)' : inspId === '003' ? 'Marta Patricia (ID 003)' : 'Miriam (Admin 100)';

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
          ) : (
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-slate-700 uppercase">Historial de Temperatura Diario</h3>
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
          )}
        </div>
      </div>

      {/* MODAL ELIMINAR INDIVIDUAL */}
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

      {/* REPORTE IMPRESO PDF PROFESIONAL CON SEMÁFOROS COLORIDOS Y GRÁFICA DE PASTEL PERFECTAMENTE UBICADA Y GRANDE */}
      {datosReporteImpresion && (
        <div className="print-only p-6 bg-white text-slate-900 font-sans max-w-4xl mx-auto space-y-4 text-xs">
          
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-700 text-white font-black px-3 py-2 rounded-xl text-sm">RF</div>
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

          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold border rounded-xl overflow-hidden bg-slate-50">
            <div className="border-r p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[9px]">PRODUCTOR</div>
              <div className="font-black text-slate-800 mt-1">AGRICOLA SONORG SA DE CV</div>
            </div>
            <div className="border-r p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[9px]">PRODUCTO / EMPAQUE</div>
              <div className="font-black text-slate-800 mt-1">{datosReporteImpresion.producto} ({datosReporteImpresion.empaque})</div>
            </div>
            <div className="border-r p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[9px]">CUADRO / PASO</div>
              <div className="font-black text-slate-800 mt-1">{datosReporteImpresion.cuadro}</div>
            </div>
            <div className="p-2">
              <div className="bg-slate-900 text-white py-1 uppercase text-[9px]">INSPECTOR</div>
              <div className="font-black text-slate-800 mt-1">{datosReporteImpresion.inspector}</div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 text-center font-bold">
            <div className="border rounded-xl p-2 bg-slate-50"><div className="text-[9px] text-slate-500">MUESTRA TOTAL</div><div className="text-sm font-black text-slate-900">{datosReporteImpresion.totalMuestras} PZ</div></div>
            <div className="border rounded-xl p-2 bg-emerald-50 text-emerald-900"><div className="text-[9px] text-emerald-700">% BUENA CALIDAD</div><div className="text-sm font-black">{datosReporteImpresion.porcentajeBuenaCalidad}%</div></div>
            <div className="border rounded-xl p-2 bg-red-50 text-red-900"><div className="text-[9px] text-red-700">% DEFECTOS</div><div className="text-sm font-black">{datosReporteImpresion.porcentajeDefectosTotales}%</div></div>
            <div className="border rounded-xl p-2 bg-slate-50"><div className="text-[9px] text-slate-500">% CALIDAD</div><div className="text-sm font-black text-slate-800">{datosReporteImpresion.porcentajeDefectoCalidad}%</div></div>
            <div className="border rounded-xl p-2 bg-slate-50"><div className="text-[9px] text-slate-500">% CONDICIÓN</div><div className="text-sm font-black text-slate-800">{datosReporteImpresion.porcentajeDefectoCondicion}%</div></div>
            <div className="border rounded-xl p-2 bg-cyan-50 text-cyan-900"><div className="text-[9px] text-cyan-700">TEMP PROM.</div><div className="text-sm font-black">{datosReporteImpresion.temperatura}°C</div></div>
          </div>

          {/* SEMÁFOROS EXACTOS A COLOR EN NÚMEROS Y RANGOS */}
          <div className="border p-3 rounded-xl bg-slate-50 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800 uppercase font-black">SEMÁFORO DE CALIDAD</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded font-black text-[9px]">≤80%</span>
                <span className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded font-black text-[9px]">80 - 90%</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-black text-[9px]">≥90%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">lote con {datosReporteImpresion.porcentajeBuenaCalidad}% de buena calidad:</span>
                <span className={`px-3 py-0.5 rounded font-black text-white ${
                  datosReporteImpresion.porcentajeBuenaCalidad >= 90 ? 'bg-emerald-600' : datosReporteImpresion.porcentajeBuenaCalidad >= 80 ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                  {datosReporteImpresion.porcentajeBuenaCalidad >= 90 ? 'ACEPTABLE' : datosReporteImpresion.porcentajeBuenaCalidad >= 80 ? 'TOLERABLE' : 'CRÍTICA'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold gap-2 pt-2 border-t">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-800 uppercase font-black">TEMPERATURA (°C) [GENERAL]</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded font-black text-[9px]">&lt;5°C</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-black text-[9px]">5 - 10°C</span>
                <span className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded font-black text-[9px]">10 - 12°C</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded font-black text-[9px]">&gt;12°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">promedio ( {datosReporteImpresion.temperatura}°C ) es:</span>
                <span className={`px-3 py-0.5 rounded font-black text-white ${
                  datosReporteImpresion.temperatura >= 5 && datosReporteImpresion.temperatura <= 10 ? 'bg-emerald-600' : datosReporteImpresion.temperatura <= 12 ? 'bg-amber-500' : 'bg-red-600'
                }`}>
                  {datosReporteImpresion.temperatura >= 5 && datosReporteImpresion.temperatura <= 10 ? 'ACEPTABLE' : datosReporteImpresion.temperatura <= 12 ? 'TOLERABLE' : 'CRÍTICA'}
                </span>
              </div>
            </div>
          </div>

          {/* GRÁFICA DE PASTEL GRANDE Y CON LEYENDA LATERAL COLORIDA */}
          <div className="border p-5 rounded-xl space-y-4 bg-white break-inside-avoid">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">GRÁFICA VISUAL DE DEFECTOS (DISTRIBUCIÓN)</h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
              <div className="relative w-48 h-48 shrink-0">
                <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
                  {(() => {
                    let acumulado = 0;
                    const colores = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
                    
                    const itemsPastel = [
                      { nombre: 'Buena Calidad', porcentaje: datosReporteImpresion.porcentajeBuenaCalidad },
                      ...datosReporteImpresion.desgloseDefectos
                    ];

                    return itemsPastel.map((item: any, i: number) => {
                      const porc = Math.max(0.5, item.porcentaje || 0);
                      if (porc <= 0) return null;
                      const dashArray = `${porc} 100`;
                      const dashOffset = -acumulado;
                      acumulado += porc;
                      const colorHex = colores[i % colores.length];

                      return (
                        <circle
                          key={i}
                          cx="16"
                          cy="16"
                          r="15.9155"
                          fill="transparent"
                          stroke={colorHex}
                          strokeWidth="7"
                          strokeDasharray={dashArray}
                          strokeDashoffset={dashOffset}
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Defectos</span>
                  <span className="text-sm font-black text-slate-900">{datosReporteImpresion.porcentajeDefectosTotales}%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 max-w-sm">
                {(() => {
                  const coloresClases = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];
                  const itemsLeyenda = [
                    { nombre: 'Buena Calidad', porcentaje: datosReporteImpresion.porcentajeBuenaCalidad },
                    ...datosReporteImpresion.desgloseDefectos
                  ];

                  return itemsLeyenda.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-bold gap-3 bg-slate-50 p-2.5 rounded-xl border shadow-xs">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${coloresClases[i % coloresClases.length]}`}></span>
                        <span className="text-slate-800 truncate uppercase">{item.nombre}</span>
                      </div>
                      <span className="font-black text-slate-900 shrink-0 bg-white px-2 py-0.5 rounded border">[{item.porcentaje}%]</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* DESGLOSE DETALLADO DE DEFECTOS */}
          <div className="space-y-2 break-inside-avoid">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">DESGLOSE DETALLADO DE DEFECTOS</h3>
            <table className="w-full text-[10px] border">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-2 text-left">DEFECTO</th>
                  <th className="p-2 text-center">TIPO DE CATEGORÍA</th>
                  <th className="p-2 text-right">% IMPACTO ACUMULADO</th>
                </tr>
              </thead>
              <tbody>
                {datosReporteImpresion.desgloseDefectos.map((def: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 font-bold text-slate-800">{def.nombre}</td>
                    <td className="p-2 text-center text-slate-500 uppercase font-semibold">{def.tipo}</td>
                    <td className="p-2 text-right font-black text-slate-900">{def.piezas} pz ({def.porcentaje}%)</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-black">
                  <td className="p-2">TOTAL DEFECTOS DETECTADOS</td>
                  <td className="p-2 text-center uppercase font-bold text-[9px]">ACUMULADO TOTAL</td>
                  <td className="p-2 text-right text-amber-400">
                    {datosReporteImpresion.desgloseDefectos.reduce((acc: number, curr: any) => acc + Number(curr.piezas || 0), 0)} pz ({datosReporteImpresion.porcentajeDefectosTotales}%)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      )}

      {/* MODAL FILTROS REPORTE */}
      <ReporteModal 
        isOpen={modalReporteAbierto}
        onClose={() => setModalReporteAbierto(false)}
        variedadesDisponibles={Array.from(new Set(inspecciones.map(i => i.producto)))}
        onGenerar={generarReporteFiltrado}
      />

      {/* MODAL CREAR / EDITAR INSPECCIÓN (ADMIN) */}
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
                  <label className="text-slate-600 block mb-1">Categoría</label>
                  <input type="text" disabled value={formInsp.categoria} className="w-full border p-2.5 rounded-xl bg-slate-100 text-emerald-700 font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Registrado por (Inspectora)</label>
                  <select value={formInsp.inspector_id} onChange={e => setFormInsp({...formInsp, inspector_id: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    <option value="001">Rubí (001)</option>
                    <option value="002">María (002)</option>
                    <option value="003">Marta Patricia (003)</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Empacador Asignado:</span>
                  <span className="font-black text-emerald-700 text-xs">{formInsp.empacador_nombre}</span>
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
                  <label className="text-slate-600 block mb-1">Empaque / Marca</label>
                  <select value={formInsp.empaque} onChange={e => setFormInsp({...formInsp, empaque: e.target.value})} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    {configActual.empaques.map(emp => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
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
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600" /> Distribución de Tamaños / Calibres (PZ)
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
                  <label className="text-slate-600 block mb-1">Total Muestras (PZ)</label>
                  <input type="number" value={formInsp.total_muestras} readOnly className="w-full border p-2.5 rounded-xl bg-slate-100 font-black text-emerald-700 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">% Defecto Total</label>
                  <input type="text" disabled value={`${formInsp.porcentaje_defecto}%`} className="w-full border p-2.5 rounded-xl bg-slate-100 font-black text-emerald-800 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Calidad Global</label>
                  <select name="calidad" value={formInsp.calidad} onChange={handleInspChange} className="w-full border p-2.5 rounded-xl bg-white font-bold">
                    <option value="Primera">Primera</option>
                    <option value="Segunda">Segunda</option>
                    <option value="Rechazo">Rechazo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-800 flex items-center gap-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Defectos de 2da Calidad
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Tipo de Daño</label>
                    <select value={formInsp.defecto_segunda} onChange={e => setFormInsp({...formInsp, defecto_segunda: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50 font-bold">
                      {DEFECTOS_SEGUNDA.map(def => <option key={def} value={def}>{def}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Piezas (PZ)</label>
                    <input type="number" min="0" name="piezas_segunda" value={formInsp.piezas_segunda} onChange={handleInspChange} className="w-full border p-2 rounded-lg font-black text-amber-700" />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-200 space-y-2">
                  <div className="font-bold text-red-800 flex items-center gap-1 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-red-600" /> Defectos de Rezaga
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Tipo de Daño</label>
                    <select value={formInsp.defecto_rezaga} onChange={e => setFormInsp({...formInsp, defecto_rezaga: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50 font-bold">
                      {DEFECTOS_REZAGA.map(def => <option key={def} value={def}>{def}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Piezas (PZ)</label>
                    <input type="number" min="0" name="piezas_rezaga" value={formInsp.piezas_rezaga} onChange={handleInspChange} className="w-full border p-2 rounded-lg font-black text-red-700" />
                  </div>
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
            <th className="p-2">Temp (°C)</th>
            <th className="p-2">Empacador</th>
            <th className="p-2">Producto / Variedad</th>
            <th className="p-2">Cuadro / Etapa</th>
            <th className="p-2">Tamaños (PZ)</th>
            <th className="p-2">Daños Registrados</th>
            <th className="p-2">% Defecto</th>
            <th className="p-2">Calidad</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registros.map(insp => {
            // LECTURA ROBUSTA DE LA TEMPERATURA REAL GUARDADA EN LA BASE DE DATOS
            const tempExtraida = insp.temperatura ?? insp.temperatura_c ?? insp.temp;
            const tempValida = (tempExtraida !== undefined && tempExtraida !== null && tempExtraida !== '' && !isNaN(Number(tempExtraida))) 
              ? `${Number(tempExtraida).toFixed(1)} °C` 
              : 'N/D';

            return (
              <tr key={insp.id} className="border-b bg-white hover:bg-slate-50">
                <td className="p-2 font-bold">#{insp.id}</td>
                <td className="p-2">{insp.fecha?.split('T')[0]} ({insp.hora})</td>
                <td className="p-2 font-black text-cyan-700">{tempValida}</td>
                <td className="p-2 font-bold text-emerald-700">#{insp.empacador_num} <span className="text-[10px] text-slate-500 font-normal">({insp.empacador_nombre})</span></td>
                <td className="p-2 font-medium">{insp.producto} <span className="text-slate-400 text-[10px]">({insp.variedad})</span></td>
                <td className="p-2">{insp.cuadro}</td>
                <td className="p-2 font-bold text-slate-700">
                  <div className="text-slate-900 font-black">
                    {insp.tamano_resumen && insp.tamano_resumen !== 'Sin desglose' && insp.tamano_resumen !== 'N/D' ? insp.tamano_resumen : `Total: ${insp.total_muestras} pz`}
                  </div>
                </td>
                <td className="p-2 text-slate-700">{insp.defecto}</td>
                <td className="p-2 text-red-600 font-bold">{insp.porcentaje_defecto}%</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${insp.calidad === 'Primera' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{insp.calidad}</span>
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