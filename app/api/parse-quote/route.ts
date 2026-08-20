import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Falta la API Key en Vercel' }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres un asistente experto en cotizaciones. Extrae y genera una cotización estructurada en formato JSON a partir del siguiente requerimiento: "${prompt}". Devuelve únicamente el objeto JSON con las claves: producto, cantidad, precio_estimado_unitario_clp, total_estimado_clp y observaciones.`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar la cotización.';

    return NextResponse.json({ resultado: textResult });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
  }
}