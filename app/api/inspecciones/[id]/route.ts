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

    const {
      inspector_id,
      producto,
      tamano,
      total_muestras,
      piezas_defecto,
      calidad
    } = body;

    const total = Number(total_muestras || 1);
    const piezas = Number(piezas_defecto || 0);
    const porcentaje = Number(((piezas / total) * 100).toFixed(2));

    const result = await query(
      `UPDATE inspecciones 
       SET inspector_id = $1, producto = $2, tamano = $3, total_muestras = $4, piezas_defecto = $5, porcentaje_defecto = $6, calidad = $7, defecto = CONCAT(COALESCE(defecto, 'Ninguno'), ' [EDITADO]')
       WHERE id = $8 RETURNING *;`,
      [inspector_id, producto, tamano, total, piezas, porcentaje, calidad, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Registro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
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