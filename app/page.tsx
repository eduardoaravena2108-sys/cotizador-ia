'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [empresa, setEmpresa] = useState('COTIUM SPA');
  const [cliente, setCliente] = useState('Cliente General / Empresa');
  const [prompt, setPrompt] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cotium_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveHistory = (newHistory: any[]) => {
    setHistory(newHistory);
    localStorage.setItem('cotium_history', JSON.stringify(newHistory));
  };

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
        const updatedQuote = data.data;
        setQuote(updatedQuote);
        setPrompt('');

        const existingIdx = history.findIndex((h) => h.folio === updatedQuote.folio);
        let updatedHistory = [...history];
        if (existingIdx >= 0) {
          updatedHistory[existingIdx] = updatedQuote;
        } else {
          updatedHistory.unshift(updatedQuote);
        }
        saveHistory(updatedHistory);
      }
    } catch {
      setError('Error al procesar la cotización.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
  };

  const removeItem = (idx: number) => {
    if (!quote) return;
    const updated = quote.items.filter((_: any, i: number) => i !== idx);
    const subtotal = updated.reduce((a: number, b: any) => a + (b.cantidad * b.precioUnitario), 0);
    const iva = Math.round(subtotal * 0.19);
    const newQuote = { ...quote, items: updated, subtotal, iva, total: subtotal + iva };
    setQuote(newQuote);

    const updatedHistory = history.map((h) => (h.folio === newQuote.folio ? newQuote : h));
    saveHistory(updatedHistory);
  };

  const deleteQuoteFromHistory = (folio: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter((h) => h.folio !== folio);
    saveHistory(updatedHistory);
    if (quote?.folio === folio) {
      setQuote(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 p-4 md:p-8 font-sans">
      <style jsx global>{`
        @media print {
          body {
            background-color: #09090b !important;
            color: #e4e4e7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-area {
            border: 1px solid #27272a !important;
            background-color: #18181b !important;
            box-shadow: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* PANEL IZQUIERDO */}
        <div className="no-print md:col-span-4 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
              <img src="./logo.png" alt="Cotium SPA Logo" className="w-12 h-12 object-contain" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-wider">COTIUM SPA</h2>
                <p className="text-[10px] text-emerald-400 font-mono">SISTEMA DE COTIZACIÓN</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Empresa Emisora</label>
                <input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Cliente</label>
                <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Agregar Ítem (Enter)</label>
                <textarea rows={3} value={prompt} onKeyDown={handleKeyDown} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: Servicio de mantenimiento..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 outline-none resize-none focus:border-emerald-500" />
              </div>
              {error && <div className="p-3 bg-red-950/40 text-red-400 rounded-lg border border-red-800/30">{error}</div>}
              <button onClick={handleGenerate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold py-3 rounded-lg transition">
                {loading ? 'Calculando...' : 'Sumar al Balance'}
              </button>
              {quote && (
                <button onClick={() => window.print()} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg border border-zinc-700 font-semibold">
                  🖨️ Generar PDF (Estilo Oscuro)
                </button>
              )}
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-widest mb-4 pb-2 border-b border-zinc-800 flex justify-between items-center">
              <span>📁 Historial Guardado</span>
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-emerald-400">{history.length}</span>
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-4">Sin cotizaciones registradas.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.folio}
                    onClick={() => setQuote(item)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex justify-between items-center ${
                      quote?.folio === item.folio
                        ? 'bg-zinc-800 border-emerald-500/50 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-zinc-200">Folio: {item.folio}</p>
                      <p className="text-[10px] text-zinc-500">{item.cliente} • ${item.total?.toLocaleString('es-CL')}</p>
                    </div>
                    <button
                      onClick={(e) => deleteQuoteFromHistory(item.folio, e)}
                      title="Eliminar registro"
                      className="text-zinc-600 hover:text-red-400 p-1 font-bold text-sm transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VISTA PREVIA DEL DOCUMENTO */}
        <div className="md:col-span-8">
          {quote ? (
            <div className="print-area bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <img src="/logo.png" alt="Cotium SPA Logo" className="w-16 h-16 object-contain" />
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">{quote.empresa}</h1>
                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">Documento Comercial Oficial</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-zinc-200">FOLIO: {quote.folio}</p>
                  <p className="text-zinc-500 mt-1">{quote.fecha}</p>
                </div>
              </div>
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 mb-6 text-xs">
                <span className="text-zinc-500 uppercase block mb-1">Destinatario:</span>
                <p className="text-sm font-semibold text-zinc-200">{quote.cliente}</p>
              </div>
              <table className="w-full text-left border-collapse text-xs mb-6">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase">
                    <th className="py-2.5 px-2 text-center">Cant.</th>
                    <th className="py-2.5 px-2">Descripción</th>
                    <th className="py-2.5 px-2 text-right">P. Unitario</th>
                    <th className="py-2.5 px-2 text-right">Total</th>
                    <th className="py-2.5 px-2 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {quote.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3 px-2 text-center font-bold text-emerald-400">{item.cantidad}</td>
                      <td className="py-3 px-2 text-zinc-300">{item.descripcion}</td>
                      <td className="py-3 px-2 text-right text-zinc-400">${item.precioUnitario.toLocaleString('es-CL')}</td>
                      <td className="py-3 px-2 text-right font-bold text-white">${(item.cantidad * item.precioUnitario).toLocaleString('es-CL')}</td>
                      <td className="py-3 px-2 text-center no-print">
                        <button onClick={() => removeItem(i)} className="text-zinc-500 hover:text-red-400 font-bold">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-end border-t border-zinc-800 pt-6 text-xs">
                <p className="text-zinc-500 max-w-xs">{quote.observaciones}</p>
                <div className="w-56 space-y-1.5 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                  <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>${quote.subtotal.toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>19% IVA</span><span>${quote.iva.toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between font-bold text-emerald-400 text-sm border-t border-zinc-800 pt-1.5"><span>Total CLP</span><span>${quote.total.toLocaleString('es-CL')}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800 p-12 text-center text-zinc-600 rounded-2xl text-xs">
              Esperando registros o selecciona una cotización del historial...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}