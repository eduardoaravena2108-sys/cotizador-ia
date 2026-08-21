import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la variable GEMINI_API_KEY en Vercel.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      Eres un asistente experto en cotizaciones para el mercado de Chile.
      Analiza el texto ingresado y responde EXCLUSIVAMENTE con un JSON válido estructurado así:
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
        "observaciones": "Valores expresados en Pesos Chilenos (CLP)."
      }
      Calcula los precios unitarios estimando valores de mercado en CLP si no se especifican.
      Calcula correctamente el IVA (19%) sobre el subtotal.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const textResponse = response.text;
    
    if (!textResponse) {
      throw new Error('La IA no devolvió respuesta.');
    }

    const parsedData = JSON.parse(textResponse);

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error('Error en API Cotium:', error);
    return NextResponse.json(
      { error: `Error en servidor: ${error.message}` },
      { status: 500 }
    );
  }
}