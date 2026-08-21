import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No se detecta GEMINI_API_KEY en Vercel.' },
        { status: 400 }
      );
    }

    // Consulta directa a la API de Google para listar tus modelos activos
    const resV1Beta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const dataV1Beta = await resV1Beta.json();

    if (dataV1Beta.error) {
      return NextResponse.json({ error: dataV1Beta.error.message }, { status: 400 });
    }

    // Filtramos solo los modelos que soportan generateContent
    const validModels = (dataV1Beta.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''));

    return NextResponse.json({ 
      mensaje: "Modelos disponibles para tu API Key:",
      modelosDisponibles: validModels 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}