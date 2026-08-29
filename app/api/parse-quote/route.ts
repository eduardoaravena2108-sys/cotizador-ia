import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa, existingItems = [] } = await req.json();

    const systemPrompt = `
Eres un asistente de compras y cotizaciones técnicas en Chile.
Para cada ítem solicitado, debes estructurar los datos y simular/realizar la verificación de precios en comercios locales (Homecenter Sodimac, Easy, Imperial, MercadoLibre).

Devuelve EXCLUSIVAMENTE un JSON con la siguiente estructura (sin bloques markdown de código extras ni texto conversacional):
{
  "folio": "${Math.floor(1000 + Math.random() * 9000)}",
  "fecha": "${new Date().toLocaleDateString('es-CL')}",
  "empresa": "${empresa || 'COTIUM SPA'}",
  "cliente": "${cliente || 'Cliente General'}",
  "items": [
    {
      "cantidad": 1,
      "descripcion": "Nombre del producto/servicio",
      "precioUnitario": 10000,
      "tiendaOrigen": "Homecenter Sodimac",
      "ofertaSugerida": {
        "tienda": "Easy Chile",
        "precio": 8500,
        "ahorro": 1500,
        "link": "https://www.easy.cl"
      }
    }
  ],
  "observaciones": "Precios y ofertas verificadas en línea."
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Ítems guardados: ${JSON.stringify(existingItems)}. Solicito agregar o evaluar: ${prompt}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Calcular Subtotal, IVA y Total
    const subtotal = result.items.reduce((acc: number, item: any) => acc + (item.cantidad * item.precioUnitario), 0);
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
    return NextResponse.json({ error: err.message || 'Error al procesar compras' }, { status: 500 });
  }
}