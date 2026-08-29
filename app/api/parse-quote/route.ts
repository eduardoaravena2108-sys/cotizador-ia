import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt || 'Materiales varios';
    const cliente = body.cliente || 'Cliente General';
    const empresa = body.empresa || 'COTIUM SPA';

    const apiKey = 
      process.env.GEMINI_API_KEY || 
      process.env.Gemini_API_Key_2 || 
      process.env.GEMINI_API_KEY_2 || 
      process.env.OPENAI_API_KEY;

    // Si no hay API Key configurada, generar respuesta de respaldo calculada dinámicamente según la palabra
    if (!apiKey) {
      const mockPrice = Math.floor(Math.random() * 50000) + 15000;
      return NextResponse.json({
        data: {
          folio: Math.floor(1000 + Math.random() * 9000).toString(),
          fecha: new Date().toLocaleDateString('es-CL'),
          empresa,
          cliente,
          items: [
            {
              cantidad: 1,
              descripcion: prompt,
              precioUnitario: mockPrice,
              tiendaOrigen: 'Homecenter Sodimac',
              ofertaSugerida: {
                tienda: 'Easy Chile',
                precio: Math.round(mockPrice * 0.88),
                ahorro: Math.round(mockPrice * 0.12)
              }
            }
          ],
          subtotal: mockPrice,
          iva: Math.round(mockPrice * 0.19),
          total: Math.round(mockPrice * 1.19),
          observaciones: 'Modo de prueba activo.'
        }
      });
    }

    // Petición a Gemini
    const systemPrompt = `Devuelve un objeto JSON estricto para cotizar "${prompt}" en pesos chilenos CLP:
{
  "folio": "${Math.floor(1000 + Math.random() * 9000)}",
  "fecha": "${new Date().toLocaleDateString('es-CL')}",
  "empresa": "${empresa}",
  "cliente": "${cliente}",
  "items": [
    {
      "cantidad": 1,
      "descripcion": "${prompt}",
      "precioUnitario": 45000,
      "tiendaOrigen": "Homecenter Sodimac",
      "ofertaSugerida": {
        "tienda": "Easy Chile",
        "precio": 39990,
        "ahorro": 5010
      }
    }
  ],
  "observaciones": "Valores referenciales mercado Chile."
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { response_mime_type: 'application/json' }
        })
      }
    );

    const resultApi = await res.json();

    if (!res.ok || !resultApi.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error(resultApi.error?.message || 'Error consultando API externa');
    }

    const parsedData = JSON.parse(resultApi.candidates[0].content.parts[0].text);
    const items = parsedData.items || [];
    const subtotal = items.reduce((acc: number, it: any) => acc + (it.cantidad * it.precioUnitario), 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return NextResponse.json({
      data: {
        ...parsedData,
        items,
        subtotal,
        iva,
        total
      }
    });

  } catch (err: any) {
    // Si falla la API externa, no colgar la UI: retornar respuesta de emergencia
    const fallbackPrice = 28900;
    return NextResponse.json({
      data: {
        folio: Math.floor(1000 + Math.random() * 9000).toString(),
        fecha: new Date().toLocaleDateString('es-CL'),
        empresa: 'COTIUM SPA',
        cliente: 'Cliente General',
        items: [
          {
            cantidad: 1,
            descripcion: 'Producto Solicitado',
            precioUnitario: fallbackPrice,
            tiendaOrigen: 'Homecenter Sodimac',
            ofertaSugerida: {
              tienda: 'Easy Chile',
              precio: 24990,
              ahorro: 3910
            }
          }
        ],
        subtotal: fallbackPrice,
        iva: Math.round(fallbackPrice * 0.19),
        total: Math.round(fallbackPrice * 1.19),
        observaciones: `Respuesta de contingencia: ${err.message}`
      }
    });
  }
}