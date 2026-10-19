"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Send, Printer, PlusCircle, Trash2, FileCheck, ClipboardList } from 'lucide-react';

// Opciones de tamaños por producto
const TAMANOS_POR_PRODUCTO = {
  'Zucchini': ['X.Fancy', 'Fancy', 'Medium', 'Large', 'X.Large', 'Menor a 7"'],
  'Amarilla': ['X.Fancy', 'Fancy', 'Medium', 'Large', 'Menor a XF'],
  'Pepino': ['42', '36', '30', '24', 'Menor a 42'],
  'DEFAULT': ['Small', 'Medium', 'Large', 'X.Large', 'Jumbo']
};

// Rangos óptimos de temperatura (°C) por producto
const RANGOS_TEMP = {
  'Zucchini': { min: 5.5, optMax: 10.5, tolMax: 12.0 },
  'Amarilla': { min: 5.5, optMax: 10.5, tolMax: 12.0 },
  'Pepino': { min: 7.0, optMax: 10.0, tolMax: 12.5 },
  'DEFAULT': { min: 5.0, optMax: 10.0, tolMax: 12.0 }
};

export default function QCReport() {
  // Datos generales del Lote / Turno (Todos en blanco excepto Inspector editable y Fecha editable)
  const [loteInfo, setLoteInfo] = useState({
    fecha: '',
    grower: 'AGRICOLA SONORG SA DE CV',
    producto: '',
    empaque: '',
    cuadro: '',
    inspector: 'Miriam Leon Ibarra'
  });

  // Lista de muestras capturadas en el día
  const [muestrasList, setMuestrasList] = useState([]);

  // Formulario actual de muestra en vivo (Completamente en blanco)
  const [formData, setFormData] = useState({
    hora: '',
    tamanoSelected: '',
    pesoNeto: '',
    temperatura: '',
    
    totalMuestra: '',
    piezasPrimera: '',
    piezasSegunda: '',
    piezasRezaga: '',

    // DEFECTOS SEGUNDA
    lacradoSegunda: '',
    bajoColorCacheteado: '',
    deformeSegunda: '',
    protuberanciaSegunda: '',
    danoHojaSegunda: '',
    pittingSegunda: '',
    virosisSegunda: '',
    curvoSegunda: '',
    bajoDiametro: '',

    // DEFECTOS REZAGA
    lacradoRezaga: '',
    danoMecanicoRezaga: '',
    danoPecioloRezaga: '',
    pudricion: '',
    deformeRezaga: '',
    amarilloCacheteado: '',
    cuchillo: '',
    pittingRezaga: '',
    protuberanciaRezaga: '',
    curvoRezaga: '',
    virosisRezaga: ''
  });

  const handleLoteChange = (e) => {
    const { name, value } = e.target;
    setLoteInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const num = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  // Agregar la muestra actual a la bitácora del turno
  const agregarMuestra = (e) => {
    e.preventDefault();
    if (!formData.totalMuestra || num(formData.totalMuestra) <= 0) {
      alert('Por favor ingresa la Muestra Total en piezas antes de guardar.');
      return;
    }

    const nuevaMuestra = {
      id: Date.now(),
      ...formData
    };

    setMuestrasList([...muestrasList, nuevaMuestra]);

    // Limpiar formulario para la siguiente muestra
    setFormData({
      hora: '',
      tamanoSelected: '',
      pesoNeto: '',
      temperatura: '',
      totalMuestra: '',
      piezasPrimera: '',
      piezasSegunda: '',
      piezasRezaga: '',
      lacradoSegunda: '',
      bajoColorCacheteado: '',
      deformeSegunda: '',
      protuberanciaSegunda: '',
      danoHojaSegunda: '',
      pittingSegunda: '',
      virosisSegunda: '',
      curvoSegunda: '',
      bajoDiametro: '',
      lacradoRezaga: '',
      danoMecanicoRezaga: '',
      danoPecioloRezaga: '',
      pudricion: '',
      deformeRezaga: '',
      amarilloCacheteado: '',
      cuchillo: '',
      pittingRezaga: '',
      protuberanciaRezaga: '',
      curvoRezaga: '',
      virosisRezaga: ''
    });
  };

  const eliminarMuestra = (id) => {
    setMuestrasList(muestrasList.filter(m => m.id !== id));
  };

  // CÁLCULOS CONSOLIDADOS DEL LOTE ACUMULADO
  const totalMuestraPz = muestrasList.reduce((acc, m) => acc + num(m.totalMuestra), 0) || num(formData.totalMuestra);
  const piezasPrimeraPz = muestrasList.reduce((acc, m) => acc + num(m.piezasPrimera), 0) || num(formData.piezasPrimera);
  const piezasSegundaPz = muestrasList.reduce((acc, m) => acc + num(m.piezasSegunda), 0) || num(formData.piezasSegunda);
  const piezasRezagaPz = muestrasList.reduce((acc, m) => acc + num(m.piezasRezaga), 0) || num(formData.piezasRezaga);

  const totalDefectosPz = piezasSegundaPz + piezasRezagaPz;
  const pctBuenaCalidad = totalMuestraPz > 0 ? ((piezasPrimeraPz / totalMuestraPz) * 100).toFixed(1) : "0.0";
  const pctDefectos = totalMuestraPz > 0 ? ((totalDefectosPz / totalMuestraPz) * 100).toFixed(1) : "0.0";
  const pctCalidadDefectos = totalMuestraPz > 0 ? ((piezasSegundaPz / totalMuestraPz) * 100).toFixed(1) : "0.0";
  const pctCondicionDefectos = totalMuestraPz > 0 ? ((piezasRezagaPz / totalMuestraPz) * 100).toFixed(1) : "0.0";

  // Semáforo Calidad
  const valCalidad = Number(pctBuenaCalidad);
  let estatusCalidad = 'CRÍTICA';
  let colorBadgeCalidad = 'bg-red-600 text-white';
  if (totalMuestraPz > 0) {
    if (valCalidad >= 90) {
      estatusCalidad = 'ACEPTABLE';
      colorBadgeCalidad = 'bg-emerald-600 text-white';
    } else if (valCalidad >= 80) {
      estatusCalidad = 'TOLERABLE';
      colorBadgeCalidad = 'bg-amber-400 text-gray-900';
    }
  } else {
    estatusCalidad = 'SIN DATOS';
    colorBadgeCalidad = 'bg-slate-200 text-slate-700';
  }

  // Temperatura promedio registrada
  const tempsValidas = muestrasList.map(m => num(m.temperatura)).filter(t => t > 0);
  const tempPromedio = tempsValidas.length > 0 
    ? (tempsValidas.reduce((a, b) => a + b, 0) / tempsValidas.length).toFixed(1)
    : (formData.temperatura || '');

  const rangoProd = RANGOS_TEMP[loteInfo.producto] || RANGOS_TEMP['DEFAULT'];
  const tempVal = num(tempPromedio);
  let estatusTemp = 'ACEPTABLE';
  let colorBadgeTemp = 'bg-emerald-600 text-white';

  if (tempPromedio !== '') {
    if (tempVal < rangoProd.min || tempVal >= rangoProd.tolMax) {
      estatusTemp = 'CRÍTICA';
      colorBadgeTemp = 'bg-red-600 text-white';
    } else if (tempVal > rangoProd.optMax) {
      estatusTemp = 'TOLERABLE';
      colorBadgeTemp = 'bg-amber-400 text-gray-900';
    }
  } else {
    estatusTemp = 'SIN REGISTRO';
    colorBadgeTemp = 'bg-slate-200 text-slate-700';
  }

  const listaTamanosActuales = TAMANOS_POR_PRODUCTO[loteInfo.producto] || TAMANOS_POR_PRODUCTO['DEFAULT'];

  // Suma acumulada de defectos entre todas las muestras
  const fuenteMuestras = muestrasList.length > 0 ? muestrasList : [formData];

  const sumarDefecto = (key) => fuenteMuestras.reduce((acc, m) => acc + num(m[key]), 0);

  const listaDefectosCompleta = [
    { name: 'Lacrado 2a', pz: sumarDefecto('lacradoSegunda'), cat: '2a Calidad' },
    { name: 'Bajo color cacheteado', pz: sumarDefecto('bajoColorCacheteado'), cat: '2a Calidad' },
    { name: 'Deforme 2a', pz: sumarDefecto('deformeSegunda'), cat: '2a Calidad' },
    { name: 'Protuberancia 2a', pz: sumarDefecto('protuberanciaSegunda'), cat: '2a Calidad' },
    { name: 'Daño por hoja 2a', pz: sumarDefecto('danoHojaSegunda'), cat: '2a Calidad' },
    { name: 'Pitting 2a', pz: sumarDefecto('pittingSegunda'), cat: '2a Calidad' },
    { name: 'Viosis 2a', pz: sumarDefecto('virosisSegunda'), cat: '2a Calidad' },
    { name: 'Curvo 2a', pz: sumarDefecto('curvoSegunda'), cat: '2a Calidad' },
    { name: 'Bajo diámetro', pz: sumarDefecto('bajoDiametro'), cat: '2a Calidad' },

    { name: 'Lacrado Rezaga', pz: sumarDefecto('lacradoRezaga'), cat: 'Rezaga' },
    { name: 'Daño mecánico Rezaga', pz: sumarDefecto('danoMecanicoRezaga'), cat: 'Rezaga' },
    { name: 'Daño por peciolo Rezaga', pz: sumarDefecto('danoPecioloRezaga'), cat: 'Rezaga' },
    { name: 'Pudrición', pz: sumarDefecto('pudricion'), cat: 'Rezaga' },
    { name: 'Deforme Rezaga', pz: sumarDefecto('deformeRezaga'), cat: 'Rezaga' },
    { name: 'Amarillo cacheteado', pz: sumarDefecto('amarilloCacheteado'), cat: 'Rezaga' },
    { name: 'Cuchillo', pz: sumarDefecto('cuchillo'), cat: 'Rezaga' },
    { name: 'Pitting Rezaga', pz: sumarDefecto('pittingRezaga'), cat: 'Rezaga' },
    { name: 'Protuberancia Rezaga', pz: sumarDefecto('protuberanciaRezaga'), cat: 'Rezaga' },
    { name: 'Curvo Rezaga', pz: sumarDefecto('curvoRezaga'), cat: 'Rezaga' },
    { name: 'Viosis Rezaga', pz: sumarDefecto('virosisRezaga'), cat: 'Rezaga' },
  ]
  .filter(item => item.pz > 0)
  .map(item => ({
    ...item,
    val: totalMuestraPz > 0 ? Number(((item.pz / totalMuestraPz) * 100).toFixed(1)) : 0
  }))
  .sort((a, b) => b.val - a.val);

  const imprimirPDF = () => {
    window.print();
  };

  const copiarWhatsApp = () => {
    const defectosTexto = listaDefectosCompleta.map(d => `${d.name}: ${d.pz} pz (${d.val}%)`).join(', ');
    const texto = `⚠️ *RICO FARMS - CONTROL DE CALIDAD*\n` +
      `📌 *Producto:* ${loteInfo.producto || 'N/A'} (${loteInfo.empaque || 'N/A'})\n` +
      `📍 *Cuadro:* ${loteInfo.cuadro || 'N/A'} | 📅 *Fecha:* ${loteInfo.fecha || 'N/A'}\n` +
      `🧪 *Muestras evaluadas:* ${muestrasList.length || 1}\n` +
      `📊 *1a Calidad:* ${pctBuenaCalidad}% (${estatusCalidad})\n` +
      `🌡️ *Temp Promedio:* ${tempPromedio !== '' ? `${tempPromedio}°C` : 'N/A'} (${estatusTemp})\n` +
      `🚨 *Defectos:* ${defectosTexto || 'Sin defectos'}\n` +
      `👷‍♀️ *Inspector:* ${loteInfo.inspector || 'N/A'}`;
    
    navigator.clipboard.writeText(texto);
    alert('¡Alerta de WhatsApp copiada!');
  };

  const productosLista = ['Zucchini', 'Amarilla', 'Pepino', 'Butternut', 'Delicata', 'Acorn', 'Spaghetti', 'Kabocha', 'Berenjena', 'Sandía mini', 'Sandía regular'];
  const empaquesLista = ['1 bushel', 'RF 4/7', 'RF 1 1/9', '14×2', '8×3.5', '9×2'];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-100 min-h-screen text-slate-800">
      
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { width: 100% !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* COLUMNA DE CAPTURA RÁPIDA MUESTRA POR MUESTRA (IZQUIERDA) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 no-print space-y-4">
          
          {/* ENCABEZADO DEL LOTE (DATOS EN BLANCO INICIALMENTE + FECHA EDITABLE) */}
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
              <ClipboardList className="w-4 h-4" /> Datos Generales del Lote / Turno
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block">Fecha</label>
                <input type="date" name="fecha" value={loteInfo.fecha} onChange={handleLoteChange} className="w-full p-1.5 border rounded-lg font-normal mt-0.5 bg-white" />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block">Producto</label>
                <select name="producto" value={loteInfo.producto} onChange={handleLoteChange} className="w-full p-1.5 border rounded-lg bg-white font-normal mt-0.5">
                  <option value="">-- Seleccionar --</option>
                  {productosLista.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 font-semibold block">Empaque</label>
                <select name="empaque" value={loteInfo.empaque} onChange={handleLoteChange} className="w-full p-1.5 border rounded-lg bg-white font-normal mt-0.5">
                  <option value="">-- Seleccionar --</option>
                  {empaquesLista.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500 font-semibold block">Cuadro / Pase</label>
                <input type="text" name="cuadro" placeholder="ej. 5" value={loteInfo.cuadro} onChange={handleLoteChange} className="w-full p-1.5 border rounded-lg font-normal mt-0.5" />
              </div>
              <div className="col-span-2">
                <label className="text-slate-500 font-semibold block">Inspector</label>
                <input type="text" name="inspector" value={loteInfo.inspector} onChange={handleLoteChange} className="w-full p-1.5 border rounded-lg font-normal mt-0.5" />
              </div>
            </div>
          </div>

          {/* FORMULARIO DE MUESTRA EN VIVO */}
          <form onSubmit={agregarMuestra} className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center pb-1 border-b">
              <span className="text-sm font-bold text-slate-800">Capturar Muestra #{muestrasList.length + 1}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{muestrasList.length} registradas</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-500">Hora</label>
                <input type="text" name="hora" placeholder="ej. 10:37" value={formData.hora} onChange={handleFormChange} className="w-full p-2 border rounded-lg mt-0.5 font-normal" />
              </div>
              <div>
                <label className="text-slate-500">Tamaño</label>
                <select name="tamanoSelected" value={formData.tamanoSelected} onChange={handleFormChange} className="w-full p-2 border rounded-lg mt-0.5 font-normal bg-white">
                  <option value="">-- Ver --</option>
                  {listaTamanosActuales.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-500">Temp (°C)</label>
                <input type="number" step="0.1" name="temperatura" placeholder="ej. 5.5" value={formData.temperatura} onChange={handleFormChange} className="w-full p-2 border rounded-lg mt-0.5 font-normal" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 font-bold text-emerald-700">Conteo de Piezas</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-500">Muestra total (PZ)</label>
                <input type="number" name="totalMuestra" placeholder="0" value={formData.totalMuestra} onChange={handleFormChange} className="w-full p-2 border rounded-lg mt-0.5 font-normal bg-amber-50/40" />
              </div>
              <div>
                <label className="text-slate-500">1a Calidad (PZ)</label>
                <input type="number" name="piezasPrimera" placeholder="0" value={formData.piezasPrimera} onChange={handleFormChange} className="w-full p-2 border rounded-lg mt-0.5 font-normal" />
              </div>
              <div>
                <label className="text-slate-500">2a Calidad (PZ)</label>
                <input type="number" name="piezasSegunda" placeholder="0" value={formData.piezasSegunda} onChange={handleFormChange} className="w-full p-2 border rounded-lg mt-0.5 font-normal" />
              </div>
              <div>
                <label className="text-slate-500">Rezaga (PZ)</label>
                <input type="number" name="piezasRezaga" placeholder="0" value={formData.piezasRezaga} onChange={handleFormChange} className="w-full p-2 border rounded-lg mt-0.5 font-normal" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 font-bold text-amber-600">Defectos de 2a Calidad (PZ)</div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-slate-500">Lacrado 2a</label><input type="number" name="lacradoSegunda" placeholder="0" value={formData.lacradoSegunda} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Bajo color cacheteado</label><input type="number" name="bajoColorCacheteado" placeholder="0" value={formData.bajoColorCacheteado} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Deforme 2a</label><input type="number" name="deformeSegunda" placeholder="0" value={formData.deformeSegunda} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Protuberancia 2a</label><input type="number" name="protuberanciaSegunda" placeholder="0" value={formData.protuberanciaSegunda} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Daño por hoja 2a</label><input type="number" name="danoHojaSegunda" placeholder="0" value={formData.danoHojaSegunda} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Pitting 2a</label><input type="number" name="pittingSegunda" placeholder="0" value={formData.pittingSegunda} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Viosis 2a</label><input type="number" name="virosisSegunda" placeholder="0" value={formData.virosisSegunda} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Curvo 2a</label><input type="number" name="curvoSegunda" placeholder="0" value={formData.curvoSegunda} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Bajo diámetro</label><input type="number" name="bajoDiametro" placeholder="0" value={formData.bajoDiametro} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
            </div>

            <div className="pt-2 border-t border-slate-100 font-bold text-red-600">Defectos de Rezaga (PZ)</div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-slate-500">Lacrado Rezaga</label><input type="number" name="lacradoRezaga" placeholder="0" value={formData.lacradoRezaga} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Daño mecánico</label><input type="number" name="danoMecanicoRezaga" placeholder="0" value={formData.danoMecanicoRezaga} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Daño por peciolo</label><input type="number" name="danoPecioloRezaga" placeholder="0" value={formData.danoPecioloRezaga} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Pudrición</label><input type="number" name="pudricion" placeholder="0" value={formData.pudricion} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Deforme Rezaga</label><input type="number" name="deformeRezaga" placeholder="0" value={formData.deformeRezaga} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Amarillo cacheteado</label><input type="number" name="amarilloCacheteado" placeholder="0" value={formData.amarilloCacheteado} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Cuchillo</label><input type="number" name="cuchillo" placeholder="0" value={formData.cuchillo} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Pitting Rezaga</label><input type="number" name="pittingRezaga" placeholder="0" value={formData.pittingRezaga} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Protuberancia Rezaga</label><input type="number" name="protuberanciaRezaga" placeholder="0" value={formData.protuberanciaRezaga} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Curvo Rezaga</label><input type="number" name="curvoRezaga" placeholder="0" value={formData.curvoRezaga} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
              <div><label className="text-slate-500">Viosis Rezaga</label><input type="number" name="virosisRezaga" placeholder="0" value={formData.virosisRezaga} onChange={handleFormChange} className="w-full p-1.5 border rounded mt-0.5 font-normal" /></div>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm text-sm">
              <PlusCircle className="w-4 h-4" /> Guardar y Agregar Muestra
            </button>
          </form>

          {/* TABLA DE MUESTRAS CAPTURADAS EN EL TURNO CON FILA DE TOTALES */}
          {muestrasList.length > 0 && (
            <div className="pt-3 border-t">
              <h3 className="font-bold text-xs text-slate-700 mb-2">Bitácora de Muestras del Turno ({muestrasList.length})</h3>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                    <tr>
                      <th className="p-1.5">Hora</th>
                      <th className="p-1.5">Muestra</th>
                      <th className="p-1.5">1a Cal</th>
                      <th className="p-1.5">2a Cal</th>
                      <th className="p-1.5">Rezaga</th>
                      <th className="p-1.5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {muestrasList.map((m, idx) => (
                      <tr key={m.id} className="border-b hover:bg-slate-50">
                        <td className="p-1.5 font-semibold">{m.hora || `#${idx+1}`}</td>
                        <td className="p-1.5">{m.totalMuestra} pz</td>
                        <td className="p-1.5 text-emerald-700 font-bold">{m.piezasPrimera || 0}</td>
                        <td className="p-1.5 text-amber-600">{m.piezasSegunda || 0}</td>
                        <td className="p-1.5 text-red-600">{m.piezasRezaga || 0}</td>
                        <td className="p-1.5 text-center">
                          <button onClick={() => eliminarMuestra(m.id)} className="text-slate-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* FILA DE TOTAL ACUMULADO */}
                    <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-700">
                      <td className="p-1.5 text-amber-400 uppercase">TOTAL</td>
                      <td className="p-1.5 font-black">{totalMuestraPz} pz</td>
                      <td className="p-1.5 text-emerald-400 font-black">{piezasPrimeraPz}</td>
                      <td className="p-1.5 text-amber-300 font-black">{piezasSegundaPz}</td>
                      <td className="p-1.5 text-red-400 font-black">{piezasRezagaPz}</td>
                      <td className="p-1.5"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* VISTA PREVIA DEL REPORTE FINAL CONSOLIDADO (DERECHA) */}
        <div className="lg:col-span-7 space-y-4 print-only">
          <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 no-print">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" /> Reporte Consolidado Acumulado
            </h2>
            <div className="flex gap-2">
              <button onClick={imprimirPDF} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl font-semibold text-xs transition shadow-sm">
                <Printer className="w-4 h-4" /> Descargar / Imprimir PDF
              </button>
              <button onClick={copiarWhatsApp} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition shadow-sm">
                <Send className="w-4 h-4" /> Alerta WhatsApp
              </button>
            </div>
          </div>

          {/* HOJA DE REPORTE CONSOLIDADO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 text-white font-black p-3 rounded-xl text-xl">RF</div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase">Informe de Control de Calidad</h1>
                  <p className="text-xs text-slate-500 font-medium">Empaque San Luis · Rico Farms</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-slate-700 block">{loteInfo.fecha || 'Sin fecha'}</span>
                <span className="text-slate-400">
                  {muestrasList.length > 0 ? `${muestrasList.length} muestra(s) en total` : 'En captura'}
                </span>
              </div>
            </div>

            {/* ENCABEZADOS DE INFORMACIÓN */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 font-bold block uppercase">Productor</span>
                <span className="font-semibold text-slate-800">{loteInfo.grower}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase">Producto / Empaque</span>
                <span className="font-semibold text-slate-800">
                  {loteInfo.producto || 'N/A'} {loteInfo.empaque ? `- ${loteInfo.empaque}` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase">Cuadro / Pase</span>
                <span className="font-semibold text-slate-800">{loteInfo.cuadro ? `Cuadro ${loteInfo.cuadro}` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase">Inspector</span>
                <span className="font-semibold text-slate-800">{loteInfo.inspector || 'N/A'}</span>
              </div>
            </div>

            {/* TARJETAS DE MÉTRICAS CONSOLIDADAS */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
              <div className="p-2 border rounded-xl bg-white shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Muestra Total</span>
                <span className="text-lg font-black text-slate-800">{totalMuestraPz} PZ</span>
              </div>
              <div className="p-2 border rounded-xl bg-amber-50/60 border-amber-200 text-amber-700 shadow-xs">
                <span className="text-[10px] font-bold block uppercase">% Buena Calidad</span>
                <span className="text-lg font-black">{pctBuenaCalidad} %</span>
              </div>
              <div className="p-2 border rounded-xl bg-white shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">% Defectos</span>
                <span className="text-lg font-black text-slate-800">{pctDefectos} %</span>
              </div>
              <div className="p-2 border rounded-xl bg-white shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">% Calidad</span>
                <span className="text-lg font-black text-slate-800">{pctCalidadDefectos} %</span>
              </div>
              <div className="p-2 border rounded-xl bg-white shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">% Condición</span>
                <span className="text-lg font-black text-slate-800">{pctCondicionDefectos} %</span>
              </div>
              <div className="p-2 border rounded-xl bg-amber-50/60 border-amber-200 text-amber-700 shadow-xs">
                <span className="text-[10px] font-bold block uppercase">Temp Prom.</span>
                <span className="text-lg font-black">{tempPromedio !== '' ? `${tempPromedio} °C` : 'N/A'}</span>
              </div>
            </div>

            {/* SECCIÓN DE SEMÁFOROS DINÁMICOS POR PRODUCTO */}
            <div className="space-y-3 text-xs border p-3 rounded-xl bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 uppercase">Semáforo de Calidad</span>
                  <div className="flex text-[10px] font-bold">
                    <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-l">≤ 80%</span>
                    <span className="bg-amber-400 text-gray-900 px-1.5 py-0.5">80 - 90%</span>
                    <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded-r">≥ 90%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">lote con {pctBuenaCalidad} % de buena calidad:</span>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${colorBadgeCalidad}`}>{estatusCalidad}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 uppercase">Temperatura (°C) [{loteInfo.producto || 'General'}]</span>
                  <div className="flex text-[10px] font-bold">
                    <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-l">&lt; {rangoProd.min}°C</span>
                    <span className="bg-emerald-600 text-white px-1.5 py-0.5">{rangoProd.min} - {rangoProd.optMax}°C</span>
                    <span className="bg-amber-400 text-gray-900 px-1.5 py-0.5">{rangoProd.optMax} - {rangoProd.tolMax}°C</span>
                    <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-r">≥ {rangoProd.tolMax}°C</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">promedio ( {tempPromedio !== '' ? `${tempPromedio} °C` : 'N/A'} ) es:</span>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${colorBadgeTemp}`}>{estatusTemp}</span>
                </div>
              </div>
            </div>

            {/* GRÁFICA DE DEFECTOS ACUMULADOS */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase">Gráfica Visual de Defectos (0% a 100%)</h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listaDefectosCompleta.length > 0 ? listaDefectosCompleta : [{ name: 'Sin Defectos', val: 0 }]} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} unit="%" ticks={[0, 20, 40, 60, 80, 100]} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Impacto']} />
                    <Bar dataKey="val" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="val" position="right" formatter={(v) => `${v}%`} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#334155' }} />
                      {listaDefectosCompleta.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cat === 'Rezaga' ? '#ef4444' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TABLA DE DESGLOSE DETALLADO DE DEFECTOS */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase">Desglose Detallado de Defectos</h4>
              <div className="border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b">
                      <th className="p-2.5">DEFECTO</th>
                      <th className="p-2.5">TIPO DE CATEGORÍA</th>
                      <th className="p-2.5 text-right">% IMPACTO ACUMULADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaDefectosCompleta.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-3 text-slate-400 italic text-center">No se registraron defectos en esta inspección.</td>
                      </tr>
                    ) : (
                      listaDefectosCompleta.map((d, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-800">{d.name}</td>
                          <td className="p-2.5 text-slate-500">{d.cat === 'Rezaga' ? 'CONDITION (REZAGA)' : 'QUALITY (2A CALIDAD)'}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">{d.pz} pz ({d.val} %)</td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-slate-900 text-white font-bold">
                      <td className="p-2.5">TOTAL DEFECTOS DETECTADOS</td>
                      <td className="p-2.5 text-slate-300">ACUMULADO TOTAL</td>
                      <td className="p-2.5 text-right text-amber-400 font-black">{totalDefectosPz} pz ({pctDefectos} %)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}