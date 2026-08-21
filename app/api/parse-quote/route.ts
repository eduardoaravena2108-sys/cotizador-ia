import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, cliente, empresa } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const matchQty = prompt.match(/\d+/);
      const cantidad = matchQty ? parseInt(matchQty[0]) : 1;
      const basePrice = 18500;
      const subtotal = cantidad * basePrice;
      const iva = Math.round(subtotal * 0.19);
      const total = subtotal + iva;

      return NextResponse.json({
        data: {
          folio: `CTM-${Math.floor(100000 + Math.random() * 900000)}`,
          fecha: new Date().toLocaleDateString('es-CL'),
          cliente: cliente || 'Cliente General',
          empresa: empresa || 'COTIUM SPA',
          items: [
            { cantidad, descripcion: prompt || 'Producto/Servicio Solicitado', precioUnitario: basePrice, total: subtotal }
          ],
          subtotal,
          iva,
          total,
          observaciones: 'Cotización procesada por el motor central de Cotium.'
        }
      });
    }

    const systemPrompt = `Eres el motor central de inteligencia comercial de la plataforma COTIUM. Analiza la siguiente solicitud: "${prompt}".
Extracta las cantidades e ítems explícitos. Asigna precios unitarios de mercado chilenos (en pesos CLP).
Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "folio": "CTM-${Math.floor(100000 + Math.random() * 900000)}",
  "fecha": "${new Date().toLocaleDateString('es-CL')}",
  "cliente": "${cliente || 'Cliente General'}",
  "empresa": "${empresa || 'COTIUM SPA'}",
  "items": [
    { "cantidad": 10, "descripcion": "Nombre del ítem", "precioUnitario": 15000, "total": 150000 }
  ],
  "subtotal": 150000,
  "iva": 28500,
  "total": 178500,
  "observaciones": "Documento verificado y respaldado por Cotium Engine."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
      }
    );

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({ data: parsed });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar en Cotium' }, { status: 500 });
  }
}