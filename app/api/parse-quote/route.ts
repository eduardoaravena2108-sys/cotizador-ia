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
Tu tarea es BUSCAR EN LA WEB EN TIEMPO REAL precios reales y actuales en tiendas de Chile (Sodimac, Easy, Imperial, Construmart, Mercado Libre Chile).

Para la consulta del usuario, debes devolver EXCLUSIVAMENTE un objeto JSON válido con este formato exacto:
{
  "items": [
    {
      "cantidad": 1,
      "descripcion": "Nombre exacto del producto encontrado",
      "precioUnitario": 45000,
      "precioTotal": 45000,
      "tiendaOrigen": "Nombre de la tienda (ej: Sodimac Chile)",
      "detalleTecnico": "Especificación técnica real obtenida de la web",
      "ofertaSugerida": {
        "tienda": "Tienda alternativa con menor precio",
        "precio": 39990,
        "ahorro": 5010
      }
    }
  ],
  "subtotal": 45000,
  "iva": 8550,
  "total": 53550,
  "observaciones": "Fuente de datos: Búsqueda web en vivo realizada en tiendas de Chile."
}

Reglas:
1. Todos los precios deben ser en pesos chilenos (CLP) reales encontrados en la web.
2. Devuelve SOLO el JSON sin texto explicativo ni bloques markdown adicionales.`;

    // Endpoint actualizado a gemini-3.6-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nConsulta del usuario: ${prompt}` }],
          },
        ],
        tools: [{ googleSearch: {} }],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message || 'Error en la respuesta de la API de Gemini.' },
        { status: response.status }
      );
    }

    const candidateText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    const cleanJsonText = candidateText.replace(/```json|```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanJsonText);
    } catch (e) {
      throw new Error('La respuesta recibida no tiene formato JSON válido.');
    }

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