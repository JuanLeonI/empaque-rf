import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || '').trim();
    const password = String(body.password || '').trim();

    console.log(`[LOGIN] Buscando ID: "${id}" con Contraseña: "${password}"`);

    // Usamos TRIM para evitar problemas con espacios en blanco en la base de datos
    const result = await query(
      'SELECT id, nombre, rol FROM usuarios WHERE TRIM(id) = $1 AND TRIM(password_hash) = $2',
      [id, password]
    );

    if (result.rows.length > 0) {
      console.log('¡Login exitoso para:', result.rows[0]);
      return NextResponse.json({ success: true, user: result.rows[0] });
    }

    console.log('No se encontró coincidencia en la tabla usuarios.');
    return NextResponse.json(
      { success: false, message: 'ID o contraseña incorrectos' },
      { status: 401 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error de conexión a la base de datos';
    console.error('Error en API Auth:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}