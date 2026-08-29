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
Tu tarea es analizar la solicitud y responder con precios estimativos reales de tiendas de Chile (Sodimac, Easy, Imperial, Construmart, Mercado Libre Chile).

Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato:
{
  "items": [
    {
      "cantidad": 1,
      "descripcion": "${prompt}",
      "precioUnitario": 45000,
      "precioTotal": 45000,
      "tiendaOrigen": "Sodimac Chile",
      "detalleTecnico": "Especificación estándar de mercado Chile",
      "ofertaSugerida": {
        "tienda": "Easy Chile",
        "precio": 39990,
        "ahorro": 5010
      }
    }
  ],
  "subtotal": 45000,
  "iva": 8550,
  "total": 53550,
  "observaciones": "Precios referenciales estimados mercado Chile."
}`;

    // Endpoint actualizado usando v1/models/gemini-2.5-flash (o fallback v1/models/gemini-2.0-flash)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { response_mime_type: 'application/json' },
      }),
    });

    // Respaldar con endpoint alternativo si falla el modelo principal
    if (!response.ok) {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { response_mime_type: 'application/json' },
        }),
      });
    }

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