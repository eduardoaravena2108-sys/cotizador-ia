import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa, existingItems = [] } = await req.json();

    const apiKey = 
      process.env.GEMINI_API_KEY || 
      process.env.Gemini_API_Key_2 || 
      process.env.GEMINI_API_KEY_2 || 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No se detectó la API Key en Vercel.' },
        { status: 500 }
      );
    }

    const promptTexto = `
Eres un experto cotizador ferretero y retail de Chile (Sodimac, Easy, Imperial, MercadoLibre).
Calcula un precio estimado real en pesos chilenos (CLP) para el siguiente producto: "${prompt}".

Devuelve UNICAMENTE un objeto JSON válido con este formato:
{
  "folio": "${Math.floor(1000 + Math.random() * 9000)}",
  "fecha": "${new Date().toLocaleDateString('es-CL')}",
  "empresa": "${empresa || 'COTIUM SPA'}",
  "cliente": "${cliente || 'Cliente General'}",
  "items": [
    {
      "cantidad": 1,
      "descripcion": "${prompt}",
      "precioUnitario": 45000,
      "tiendaOrigen": "Homecenter Sodimac",
      "ofertaSugerida": {
        "tienda": "Easy Chile",
        "precio": 39990,
        "ahorro": 5010
      }
    }
  ],
  "observaciones": "Valores referenciales estimados mercado Chile."
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptTexto }] }],
          generationConfig: { response_mime_type: 'application/json' },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error de Google Gemini (${response.status}): ${data.error?.message || 'Error en la petición'}` },
        { status: response.status }
      );
    }

    const rawText = data.candidates[0]?.content?.parts[0]?.text;
    const result = JSON.parse(rawText);

    const items = result.items || [];
    const subtotal = items.reduce(
      (acc: number, item: any) => acc + (item.cantidad * item.precioUnitario),
      0
    );
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return NextResponse.json({
      data: {
        ...result,
        items,
        subtotal,
        iva,
        total,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Error interno: ${err.message}` },
      { status: 500 }
    );
  }
}