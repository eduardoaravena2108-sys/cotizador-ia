import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa, existingItems = [] } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Falta GEMINI_API_KEY en las variables de Vercel.' }, { status: 400 });
    }

    const systemPrompt = `
      Eres un cotizador comercial experto en Chile. 
      Analiza la siguiente solicitud: "${prompt}".
      
      Reglas estrictas:
      1. Si no se indica cantidad, la cantidad DEBE ser 1.
      2. Asigna un precio unitario de mercado realista en CLP.
      3. Responde ÚNICAMENTE en JSON válido con este formato:
      {
        "items": [
          {
            "cantidad": 1,
            "descripcion": "Nombre claro del producto/servicio",
            "precioUnitario": 5000
          }
        ]
      }
    `;

    // Solicitud a Gemini con forzado de JSON
    const fetchGemini = async (model: string) => {
      return await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { response_mime_type: 'application/json' }
          })
        }
      );
    };

    let response = await fetchGemini('gemini-3.6-flash');
    let result = await response.json();

    // Fallback si el modelo primario falla
    if (result.error) {
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const modelsData = await modelsRes.json();
      const activeModel = modelsData.models?.find((m: any) => m.supportedGenerationMethods?.includes('generateContent'))?.name;

      if (activeModel) {
        response = await fetch(
          `https://generativelanguage.googleapis.com/${activeModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: { response_mime_type: 'application/json' }
            })
          }
        );
        result = await response.json();
      }
    }

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('La API devolvió una respuesta vacía. Reintenta la solicitud.');
    }

    const newItemsData = JSON.parse(rawText);
    const formattedNewItems = (newItemsData.items || []).map((item: any) => ({
      cantidad: Number(item.cantidad) || 1,
      descripcion: String(item.descripcion),
      precioUnitario: Number(item.precioUnitario) || 0,
      total: (Number(item.cantidad) || 1) * (Number(item.precioUnitario) || 0)
    }));

    const combinedItems = [...existingItems, ...formattedNewItems];

    const subtotal = combinedItems.reduce((acc: number, item: any) => acc + (item.cantidad * item.precioUnitario), 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    return NextResponse.json({
      data: {
        folio: `CTM-${Math.floor(100000 + Math.random() * 900000)}`,
        fecha: new Date().toLocaleDateString('es-CL'),
        cliente: cliente || 'Cliente General / Empresa',
        empresa: empresa || 'COTIUM SPA',
        items: combinedItems,
        subtotal,
        iva,
        total,
        observaciones: 'Valores expresados en Pesos Chilenos (CLP). Incluye 19% de IVA.'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}