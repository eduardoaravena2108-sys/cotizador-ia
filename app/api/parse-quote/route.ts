import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No se encontró la variable GEMINI_API_KEY en Vercel.' },
        { status: 400 }
      );
    }

    const systemPrompt = `
      Eres un asistente experto en cotizaciones para Chile.
      Analiza los datos y responde EXCLUSIVAMENTE con un JSON válido estructurado así, sin bloques markdown (\`\`\`json):
      {
        "folio": "CTM-${Math.floor(100000 + Math.random() * 900000)}",
        "fecha": "${new Date().toLocaleDateString('es-CL')}",
        "cliente": "${cliente || 'Cliente General'}",
        "empresa": "${empresa || 'COTIUM SPA'}",
        "items": [
          {
            "cantidad": 1,
            "descripcion": "Nombre del producto",
            "precioUnitario": 1000,
            "total": 1000
          }
        ],
        "subtotal": 1000,
        "iva": 190,
        "total": 1190,
        "observaciones": "Valores en CLP."
      }
      Ítem a cotizar: ${prompt}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      }
    );

    const result = await response.json();

    if (result.error) {
      return NextResponse.json(
        { error: `Error de Google: ${result.error.message}` },
        { status: 400 }
      );
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    return NextResponse.json(
      { error: `Error en backend: ${error.message}` },
      { status: 500 }
    );
  }
}