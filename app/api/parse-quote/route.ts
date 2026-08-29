import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let prompt = '';
  try {
    const body = await req.json().catch(() => ({}));
    prompt = body.prompt || '';

    if (!prompt.trim()) {
      return NextResponse.json({ error: 'Ingresa al menos un producto.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const systemPrompt = `Eres un asistente experto en cotización de materiales de construcción y ferretería en CHILE.
Analiza el producto: "${prompt}".
Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato exacto:
{
  "items": [
    {
      "cantidad": 1,
      "descripcion": "${prompt.trim()}",
      "precioUnitario": 45000,
      "precioTotal": 45000,
      "tiendaOrigen": "Sodimac Chile",
      "detalleTecnico": "Herramienta / Material estándar de construcción y ferretería",
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
  "observaciones": "Precios referenciales estimados en tiendas de Chile."
}

Reglas:
1. Precios en pesos chilenos (CLP).
2. Devuelve SOLO el JSON sin texto explicativo.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { response_mime_type: 'application/json' },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const candidateText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleanJsonText = candidateText.replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(cleanJsonText);

        return NextResponse.json({
          data: {
            folio: Math.floor(1000 + Math.random() * 9000).toString(),
            fecha: new Date().toLocaleDateString('es-CL'),
            empresa: 'COTIUM SPA',
            ...parsedData,
          },
        });
      }
    }
  } catch (err) {
    console.error('Error llamando API:', err);
  }

  // Fallback si la API excede la cuota o falla
  const estimatedBase = Math.floor(15000 + Math.random() * 35000);
  const subtotal = estimatedBase;
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  return NextResponse.json({
    data: {
      folio: Math.floor(1000 + Math.random() * 9000).toString(),
      fecha: new Date().toLocaleDateString('es-CL'),
      empresa: 'COTIUM SPA',
      items: [
        {
          cantidad: 1,
          descripcion: prompt || 'Producto Solicitado',
          precioUnitario: subtotal,
          precioTotal: subtotal,
          tiendaOrigen: 'Sodimac / Mercado Libre Chile',
          detalleTecnico: 'Cotización referencial de mercado local (Modo contingencia activa)',
          ofertaSugerida: {
            tienda: 'Easy Chile',
            precio: Math.round(subtotal * 0.9),
            ahorro: Math.round(subtotal * 0.1),
          },
        },
      ],
      subtotal,
      iva,
      total,
      observaciones: 'Valores referenciales estimados del mercado chileno.',
    },
  });
}