import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || '';

    if (!prompt.trim()) {
      return NextResponse.json({ error: 'Ingresa al menos un producto.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta configurar la variable GEMINI_API_KEY en Vercel.' },
        { status: 500 }
      );
    }

    const systemPrompt = `Eres un asistente experto en cotización de materiales de construcción y ferretería en CHILE.
Tu tarea es analizar la solicitud y responder con datos de tiendas de Chile (Sodimac, Easy, Imperial, Construmart, Mercado Libre Chile).

Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato:
{
  "items": [
    {
      "cantidad": 1,
      "descripcion": "${prompt}",
      "precioUnitario": 15000,
      "precioTotal": 15000,
      "tiendaOrigen": "Sodimac Chile",
      "detalleTecnico": "Especificación estándar de mercado",
      "ofertaSugerida": {
        "tienda": "Easy Chile",
        "precio": 13500,
        "ahorro": 1500
      }
    }
  ],
  "subtotal": 15000,
  "iva": 2850,
  "total": 17850,
  "observaciones": "Precios referenciales estimados."
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { response_mime_type: 'application/json' },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message || 'Error en la respuesta de la API de Gemini.' },
        { status: response.status }
      );
    }

    const candidateText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsedData = JSON.parse(candidateText);

    return NextResponse.json({
      data: {
        folio: Math.floor(1000 + Math.random() * 9000).toString(),
        fecha: new Date().toLocaleDateString('es-CL'),
        empresa: 'COTIUM SPA',
        ...parsedData,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno.' }, { status: 500 });
  }
}