import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT i.*, u.nombre AS nombre_inspector 
      FROM inspecciones i
      LEFT JOIN usuarios u ON TRIM(i.inspector_id) = TRIM(u.id)
      ORDER BY i.id DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al consultar inspecciones';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
// En app/api/inspecciones/route.ts (POST y PUT):
const {
  fecha, hora, inspector_id, categoria, producto, variedad,
  etapaSeleccionada, cuadroSeleccionado, cuadro, empaque, tipo_bolsa, con_etiqueta, tamano, 
  tamano_resumen, temperatura, peso, peso_unidad, calidad, calidad_global, defecto, categoria_defecto, 
  piezas_defecto, total_muestras, porcentaje_defecto, porcentaje_general, 
  porcentaje_primera, porcentaje_segunda, porcentaje_rezaga, 
  empacador_num, empacador_nombre, cajas_revisadas, cajas_totales
} = body;

    const etapaFinal = etapaSeleccionada || 'Etapa 1';
    const cuadroFinal = cuadroSeleccionado ? `Cuadro: ${cuadroSeleccionado}` : (cuadro || 'C-01');
    const calGlobalFinal = calidad_global || calidad || 'Primera (Limpia)';

    const sql = `
      INSERT INTO inspecciones 
      (fecha, hora, inspector_id, categoria, producto, variedad, etapa, cuadro, empaque, con_etiqueta, tamano, tamano_resumen, temperatura, peso, peso_unidad, calidad, calidad_global, defecto, categoria_defecto, piezas_defecto, total_muestras, porcentaje_defecto, porcentaje_general, porcentaje_primera, porcentaje_segunda, porcentaje_rezaga, empacador_num, empacador_nombre, cajas_revisadas, cajas_totales)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) 
      RETURNING *;
    `;

    const values = [
      fecha || new Date().toISOString().split('T')[0],
      hora || '08:00',
      inspector_id || '001',
      categoria || 'Frescas',
      producto || 'Zucchini',
      variedad || 'Alessandra',
      etapaFinal,
      cuadroFinal,
      empaque || 'Rico Farms',
      con_etiqueta ?? true,
      tamano || 'Extra Fancy',
      tamano_resumen || 'Sin desglose',
      temperatura !== undefined && temperatura !== null && temperatura !== '' ? Number(temperatura) : null,
      Number(peso || 40.0),
      peso_unidad || 'lb',
      calGlobalFinal,
      calGlobalFinal,
      defecto || 'Ninguno',
      categoria_defecto || 'Segunda',
      Number(piezas_defecto || 0),
      Number(total_muestras || 0),
      Number(porcentaje_defecto || 0),
      Number(porcentaje_general ?? 100),
      Number(porcentaje_primera ?? 0),
      Number(porcentaje_segunda ?? 0),
      Number(porcentaje_rezaga ?? 0),
      Number(empacador_num || 1),
      empacador_nombre || 'RUTH NOHEMI DOMINGUEZ',
      Number(cajas_revisadas || 5),
      Number(cajas_totales || 100)
    ];

    const result = await query(sql, values);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar inspección';
    console.error('Error POST /api/inspecciones:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
  
}
