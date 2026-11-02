import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM bitacora_temperatura 
      ORDER BY id DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, hora, inspector_id, producto, temperatura, temperatura_c, estado, observaciones } = body;

    // Se utiliza el valor que venga en 'temperatura' o 'temperatura_c'
    const valorTemperatura = Number(temperatura_c ?? temperatura ?? 0);

    const sql = `
      INSERT INTO bitacora_temperatura 
      (fecha, hora, inspector_id, producto, temperatura_c, estado, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *;
    `;

    const values = [
      fecha,
      hora,
      inspector_id || '004',
      producto || 'Pepino',
      valorTemperatura,
      estado || 'Normal',
      observaciones || 'Sin novedades'
    ];

    const result = await query(sql, values);
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al guardar temperatura';
    console.error('Error en POST /api/temperatura:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}