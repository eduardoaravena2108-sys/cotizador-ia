import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No se detecta GEMINI_API_KEY en las variables de Vercel.' },
        { status: 400 }
      );
    }

    const systemPrompt = `
      Eres un asistente de cotizaciones para Chile. 
      Analiza la siguiente solicitud: "${prompt}"
      
      Responde EXCLUSIVAMENTE con un objeto JSON sin formato markdown ni comillas triples:
      {
        "folio": "CTM-${Math.floor(100000 + Math.random() * 900000)}",
        "fecha": "${new Date().toLocaleDateString('es-CL')}",
        "cliente": "${cliente || 'Cliente General'}",
        "empresa": "${empresa || 'COTIUM SPA'}",
        "items": [
          {
            "cantidad": 1,
            "descripcion": "Descripción del ítem",
            "precioUnitario": 10000,
            "total": 10000
          }
        ],
        "subtotal": 10000,
        "iva": 1900,
        "total": 11900,
        "observaciones": "Valores expresados en Pesos Chilenos (CLP)."
      }
    `;

    // Se actualiza el nombre del modelo a gemini-2.5-flash o gemini-1.5-flash-latest
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
        { error: `Google API Error: ${result.error.message}` },
        { status: 400 }
      );
    }

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    return NextResponse.json(
      { error: `Error interno: ${error.message}` },
      { status: 500 }
    );
  }
}