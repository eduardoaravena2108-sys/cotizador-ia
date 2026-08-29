import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa, existingItems = [] } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la clave API en el servidor (OPENAI_API_KEY).' },
        { status: 500 }
      );
    }

    const systemPrompt = `
Eres un experto en compras y cotizaciones de mantenimiento y servicios técnicos en Chile.
Para cada producto o servicio que pida el usuario, genera una estructura JSON con precios estimados de mercado chileno (en CLP).
Para cada ítem, indica su 'tiendaOrigen' (ej: Homecenter Sodimac, Easy, Imperial, MercadoLibre) y, si aplica, incluye una 'ofertaSugerida' con un precio más económico en otra tienda de competencia.

Devuelve ÚNICAMENTE un objeto JSON válido con este formato:
{
  "folio": "${Math.floor(1000 + Math.random() * 9000)}",
  "fecha": "${new Date().toLocaleDateString('es-CL')}",
  "empresa": "${empresa || 'COTIUM SPA'}",
  "cliente": "${cliente || 'Cliente General'}",
  "items": [
    {
      "cantidad": 1,
      "descripcion": "Nombre del ítem",
      "precioUnitario": 15000,
      "tiendaOrigen": "Homecenter Sodimac",
      "ofertaSugerida": {
        "tienda": "Easy Chile",
        "precio": 12500,
        "ahorro": 2500
      }
    }
  ],
  "observaciones": "Valores referenciales verificados en tiendas del rubro."
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
          { role: 'user', content: `Ítems actuales: ${JSON.stringify(existingItems)}. Solicito agregar: ${prompt}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Error al conectar con la API de IA' },
        { status: response.status }
      );
    }

    const result = JSON.parse(data.choices[0].message.content);

    const subtotal = result.items.reduce(
      (acc: number, item: any) => acc + item.cantidad * item.precioUnitario,
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
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}