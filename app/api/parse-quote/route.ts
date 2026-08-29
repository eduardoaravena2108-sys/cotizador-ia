import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa, existingItems = [] } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No se encontró la clave OPENAI_API_KEY en las variables de Vercel.' },
        { status: 500 }
      );
    }

    const systemPrompt = `
Eres un experto en compras y cotizaciones en Chile.
Para cada producto solicitado, genera una lista de ítems en CLP.
Indica en 'tiendaOrigen' la tienda donde se cotiza (ej: Homecenter Sodimac) y en 'ofertaSugerida' si existe una mejor opción (ej: Easy Chile).

Devuelve EXCLUSIVAMENTE un JSON válido con esta estructura exacta:
{
  "folio": "${Math.floor(1000 + Math.random() * 9000)}",
  "fecha": "${new Date().toLocaleDateString('es-CL')}",
  "empresa": "${empresa || 'COTIUM SPA'}",
  "cliente": "${cliente || 'Cliente General'}",
  "items": [
    {
      "cantidad": 1,
      "descripcion": "Nombre del producto",
      "precioUnitario": 25000,
      "tiendaOrigen": "Homecenter Sodimac",
      "ofertaSugerida": {
        "tienda": "Easy Chile",
        "precio": 21990,
        "ahorro": 3010
      }
    }
  ],
  "observaciones": "Precios verificados en línea."
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Ítems actuales: ${JSON.stringify(existingItems)}. Agregar: ${prompt}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Error en la respuesta de OpenAI' },
        { status: response.status }
      );
    }

    const result = JSON.parse(data.choices[0].message.content);

    const subtotal = result.items.reduce(
      (acc: number, item: any) => acc + (item.cantidad * item.precioUnitario),
      0
    );
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return NextResponse.json({
      data: {
        ...result,
        subtotal,
        iva,
        total,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error interno en el servidor.' },
      { status: 500 }
    );
  }
}