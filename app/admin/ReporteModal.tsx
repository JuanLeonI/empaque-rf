"use client";
import React, { useState, useEffect } from 'react';

interface ReporteModalProps {
  isOpen: boolean;
  onClose: () => void;
  variedadesDisponibles: string[];
  onGenerar: (filtros: { fecha: string; inspectorId: string; variedad: string }) => void;
}

export default function ReporteModal({ isOpen, onClose, variedadesDisponibles, onGenerar }: ReporteModalProps) {
  const [fecha, setFecha] = useState('');
  const [inspectorId, setInspectorId] = useState('TODOS');
  const [variedad, setVariedad] = useState('TODAS');

  useEffect(() => {
    if (isOpen) {
      setFecha(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4 text-xs text-slate-800">
        <h3 className="font-black text-sm text-slate-900 uppercase">Generar Informe de Control de Calidad</h3>
        <p className="text-slate-500">Selecciona los filtros para consolidar las inspecciones en el reporte oficial de Rico Farms.</p>
        
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Fecha de Inspección</label>
            <input 
              type="date" 
              value={fecha} 
              onChange={e => setFecha(e.target.value)} 
              className="w-full border p-2.5 rounded-xl font-bold bg-slate-50"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Inspectora</label>
            <select 
              value={inspectorId} 
              onChange={e => setInspectorId(e.target.value)} 
              className="w-full border p-2.5 rounded-xl font-bold bg-slate-50">
              <option value="TODOS">Todas las Inspectoras</option>
              <option value="001">Rubí (001)</option>
              <option value="002">María (002)</option>
              <option value="003">Marta Patricia (003)</option>
              <option value="100">Miriam (100 - Admin)</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Producto / Variedad</label>
            <select 
              value={variedad} 
              onChange={e => setVariedad(e.target.value)} 
              className="w-full border p-2.5 rounded-xl font-bold bg-slate-50">
              <option value="TODAS">Todas las Variedades</option>
              {variedadesDisponibles.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl cursor-pointer">Cancelar</button>
          <button 
            onClick={() => onGenerar({ fecha, inspectorId, variedad })} 
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow">
            Imprimir Informe PDF
          </button>
        </div>
      </div>
    </div>
  );
}