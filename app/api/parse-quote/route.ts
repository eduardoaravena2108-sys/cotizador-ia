import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No se detecta GEMINI_API_KEY en Vercel.' },
        { status: 400 }
      );
    }

    // 1. Obtener automáticamente el modelo disponible de la cuenta
    const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await modelsResponse.json();

    if (modelsData.error) {
      return NextResponse.json(
        { error: `Google API Error: ${modelsData.error.message}` },
        { status: 400 }
      );
    }

    // Filtramos un modelo compatible con generación de contenido
    const availableModel = modelsData.models?.find((m: any) => 
      m.supportedGenerationMethods?.includes('generateContent') &&
      (m.name.includes('flash') || m.name.includes('pro'))
    )?.name;

    const modelName = availableModel ? availableModel.replace('models/', '') : 'gemini-1.5-flash';

    // 2. Generar la cotización usando el modelo detectado
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
            "cantidad": 10,
            "descripcion": "Ampolleta LED 18W",
            "precioUnitario": 2500,
            "total": 25000
          }
        ],
        "subtotal": 25000,
        "iva": 4750,
        "total": 29750,
        "observaciones": "Valores expresados en Pesos Chilenos (CLP)."
      }
    `;

    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      }
    );

    const result = await generateResponse.json();

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