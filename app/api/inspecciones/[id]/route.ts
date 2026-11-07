import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    console.log("--- INTENTO DE ACTUALIZACIÓN (ID:", id, ") ---");
    console.log("Body recibido:", body);

    const {
      fecha,
      hora,
      inspector_id,
      categoria,
      producto,
      variedad,
      etapa,
      cuadro,
      empaque,
      tipo_bolsa,
      con_etiqueta,
      tamano_resumen,
      temperatura,
      peso,
      peso_unidad,
      calidad,
      calidad_global,
      defecto,
      categoria_defecto,
      piezas_defecto,
      total_muestras,
      porcentaje_defecto,
      porcentaje_general,
      porcentaje_primera,
      porcentaje_segunda,
      porcentaje_rezaga,
      empacador_num,
      empacador_nombre,
      desglose_defectos
    } = body;

    const total = Number(total_muestras || 1);
    const piezas = Number(piezas_defecto || 0);
    const pDefecto = Number(((piezas / total) * 100).toFixed(2));

    const queryText = `
      UPDATE inspecciones 
      SET fecha = $1, hora = $2, inspector_id = $3, categoria = $4, producto = $5, variedad = $6, 
          etapa = $7, cuadro = $8, empaque = $9, tipo_bolsa = $10, con_etiqueta = $11, tamano_resumen = $12, 
          temperatura = $13, peso = $14, peso_unidad = $15, calidad = $16, calidad_global = $17, 
          defecto = $18, categoria_defecto = $19, piezas_defecto = $20, total_muestras = $21, 
          porcentaje_defecto = $22, porcentaje_general = $23, porcentaje_primera = $24, 
          porcentaje_segunda = $25, porcentaje_rezaga = $26, empacador_num = $27, empacador_nombre = $28,
          desglose_defectos = $29
      WHERE id = $30 
      RETURNING *;
    `;

    const values = [
      fecha || new Date().toISOString().split('T')[0],
      hora || '08:00',
      String(inspector_id || '001'),
      categoria || 'Frescas',
      producto || 'Zucchini',
      variedad || 'Alessandra',
      etapa || 'Etapa 1',
      cuadro || 'Cuadro: 9-4',
      empaque || 'Rico Farms',
      tipo_bolsa || 'Sin Bolsa (S/B)',
      con_etiqueta ?? true,
      tamano_resumen || 'Sin desglose',
      Number(temperatura || 0),
      Number(peso || 0),
      peso_unidad || 'lb',
      calidad_global || calidad || 'Primera (Limpia)',
      calidad_global || calidad || 'Primera (Limpia)',
      defecto || 'NINGUNO',
      categoria_defecto || 'Segunda',
      piezas,
      total,
      pDefecto,
      Number(porcentaje_general ?? 100),
      Number(porcentaje_primera ?? 0),
      Number(porcentaje_segunda ?? 0),
      Number(porcentaje_rezaga ?? 0),
      Number(empacador_num || 1),
      empacador_nombre || 'RUTH NOHEMI DOMINGUEZ',
      JSON.stringify(desglose_defectos || []),
      Number(id)
    ];

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      console.warn("⚠️ Registro no encontrado para el ID:", id);
      return NextResponse.json({ success: false, error: 'Registro no encontrado en la base de datos' }, { status: 404 });
    }

    console.log("¡Actualización exitosa en BD!");
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('🔥 ERROR CRÍTICO EN RUTA PUT /api/inspecciones/[id]:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    await query('DELETE FROM inspecciones WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Eliminado correctamente' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}