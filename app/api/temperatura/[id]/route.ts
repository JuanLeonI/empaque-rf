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
    const { producto, temperatura, temperatura_c, estado, observaciones } = body;

    const valorTemperatura = Number(temperatura_c ?? temperatura ?? 0);

    const result = await query(
      `UPDATE bitacora_temperatura 
       SET producto = $1, 
           temperatura_c = $2, 
           estado = $3, 
           observaciones = CONCAT(COALESCE(observaciones, ''), ' [EDITADO]')
       WHERE id = $4 RETURNING *;`,
      [producto, valorTemperatura, estado, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Registro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en PUT /api/temperatura/[id]:', errorMessage);
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

    await query('DELETE FROM bitacora_temperatura WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}