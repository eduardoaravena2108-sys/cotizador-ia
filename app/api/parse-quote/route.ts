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
            "cantidad": 5,
            "descripcion": "Foco LED 19W",
            "precioUnitario": 3500,
            "total": 17500
          }
        ],
        "subtotal": 17500,
        "iva": 3325,
        "total": 20825,
        "observaciones": "Valores expresados en Pesos Chilenos (CLP)."
      }
    `;

    // 1. Intentar primero con el modelo que exige tu API Key: gemini-3.6-flash
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      }
    );

    let result = await response.json();

    // 2. Si falla por modelo, obtener automáticamente los modelos activos de la cuenta
    if (result.error) {
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const modelsData = await modelsRes.json();
      
      const activeModel = modelsData.models?.find((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
      )?.name;

      if (activeModel) {
        response = await fetch(
          `https://generativelanguage.googleapis.com/${activeModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          }
        );
        result = await response.json();
      }
    }

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
      { error: `Error procesando la cotización: ${error.message}` },
      { status: 500 }
    );
  }
}