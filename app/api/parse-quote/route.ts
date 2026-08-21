import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa, existingItems = [] } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Falta GEMINI_API_KEY.' }, { status: 400 });
    }

    const systemPrompt = `
      Eres un cotizador comercial chileno en CLP.
      Analiza la solicitud: "${prompt}".
      
      REGLAS STRICTAS:
      1. Si el usuario NO especifica la cantidad de un producto, la cantidad DEBE ser 1.
      2. Asigna un precio estimado realista de mercado en Pesos Chilenos (CLP).
      3. Devuelve EXCLUSIVAMENTE este formato JSON sin markdown:
      {
        "items": [
          {
            "cantidad": 1,
            "descripcion": "Descripción del producto o servicio",
            "precioUnitario": 5000,
            "total": 5000
          }
        ]
      }
    `;

    // Consulta dinámica a Gemini
    let modelName = 'gemini-3.6-flash';
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
      }
    );

    let result = await response.json();

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
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
          }
        );
        result = await response.json();
      }
    }

    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const newItemsData = JSON.parse(cleanJson);

    // Unir los ítems nuevos con los existentes si ya había una cotización armándose
    const combinedItems = [...existingItems, ...(newItemsData.items || [])];

    // Recalcular Totales e IVA (19%)
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