'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [empresa, setEmpresa] = useState('COTIUM SPA');
  const [cliente, setCliente] = useState('Cliente General / Empresa');
  const [prompt, setPrompt] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cliente, empresa, existingItems: quote?.items || [] }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuote(data.data);
        setPrompt('');
      }
    } catch {
      setError('Error al procesar los precios.');
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar la oferta sugerida por la IA
  const applyOffer = (itemIndex: number) => {
    if (!quote) return;
    const updatedItems = [...quote.items];
    const item = updatedItems[itemIndex];

    if (item.ofertaSugerida) {
      item.precioUnitario = item.ofertaSugerida.precio;
      item.tiendaOrigen = `${item.ofertaSugerida.tienda} (Oferta Aplicada)`;
      item.ofertaSugerida = null; // Oferta ya aplicada
    }

    const subtotal = updatedItems.reduce((a: number, b: any) => a + (b.cantidad * b.precioUnitario), 0);
    const iva = Math.round(subtotal * 0.19);
    setQuote({ ...quote, items: updatedItems, subtotal, iva, total: subtotal + iva });
  };

  return (
    <main className="min-h-screen bg-[#030712] text-cyan-100 p-6 font-mono">
      <header className="max-w-6xl mx-auto mb-8 border border-cyan-500/40 bg-slate-950 p-6 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.15)] flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">COTIUM SPA</h1>
          <p className="text-xs text-cyan-400">SISTEMA INTELIGENTE DE VERIFICACIÓN DE PRECIOS Y OFERTAS</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* PANEL DE BÚSQUEDA */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-slate-950 border border-cyan-500/30 p-6 rounded-2xl">
            <h2 className="text-xs font-bold uppercase text-cyan-400 mb-4">🔍 Búsqueda de Precios y Materiales</h2>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Foco LED embutido 18W, 5 metros cable 2.5mm..."
              className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-3 text-xs text-cyan-100 resize-none outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg text-xs tracking-wider uppercase transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {loading ? 'BUSCANDO EN TIENDAS EN LÍNEA...' : '⚡ CONSULTAR Y COMPARAR PRECIOS'}
            </button>
          </div>
        </div>

        {/* DETALLE Y OFERTAS DETECTADAS */}
        <div className="md:col-span-8 space-y-4">
          {quote && (
            <div className="bg-slate-950 border border-cyan-500/40 p-6 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <h3 className="text-sm font-bold text-cyan-300 mb-4 border-b border-cyan-500/20 pb-2">
                DESGLOSE DE MATERIALES Y AUDITORÍA DE TIENDAS
              </h3>

              <div className="space-y-4">
                {quote.items.map((item: any, i: number) => (
                  <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/20 text-xs">
                    <div className="flex justify-between font-bold text-cyan-100">
                      <span>{item.cantidad}x {item.descripcion}</span>
                      <span className="text-cyan-400">${(item.cantidad * item.precioUnitario).toLocaleString('es-CL')}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1">
                      📍 <strong>Fuente/Verificación:</strong> {item.tiendaOrigen || 'Homecenter Sodimac'}
                    </p>

                    {/* ALERTA DE OFERTA ENCONTRADA */}
                    {item.ofertaSugerida && (
                      <div className="mt-3 bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-lg flex justify-between items-center text-emerald-300">
                        <div>
                          <p className="font-bold text-[11px]">💡 Oferta alternativa encontrada en {item.ofertaSugerida.tienda}</p>
                          <p className="text-[10px] text-emerald-400">
                            Precio: ${item.ofertaSugerida.precio.toLocaleString('es-CL')} (Ahorras ${item.ofertaSugerida.ahorro.toLocaleString('es-CL')})
                          </p>
                        </div>
                        <button
                          onClick={() => applyOffer(i)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded font-bold text-[10px] uppercase transition"
                        >
                          Usar esta oferta
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* RESUMEN TOTALES */}
              <div className="mt-6 border-t border-cyan-500/20 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Neto + IVA (19%)</span>
                <span className="text-base font-bold text-cyan-300">${quote.total.toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}