import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa } = await req.json();

    const mockQuote = {
      folio: Math.floor(1000 + Math.random() * 9000).toString(),
      fecha: new Date().toLocaleDateString('es-CL'),
      empresa: empresa || 'COTIUM SPA',
      cliente: cliente || 'Cliente General',
      items: [
        {
          cantidad: 1,
          descripcion: prompt || 'Ítem de prueba',
          precioUnitario: 35000,
          tiendaOrigen: 'Homecenter Sodimac',
          ofertaSugerida: {
            tienda: 'Easy Chile',
            precio: 29990,
            ahorro: 5010
          }
        }
      ],
      observaciones: 'Cotización referencial generada correctamente.'
    };

    const subtotal = mockQuote.items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return NextResponse.json({
      data: {
        ...mockQuote,
        subtotal,
        iva,
        total
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}