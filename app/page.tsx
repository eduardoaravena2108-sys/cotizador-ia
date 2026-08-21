'use client';
import { useState } from 'react';

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
      if (data.error) setError(data.error);
      else { setQuote(data.data); setPrompt(''); }
    } catch { setError('Error al procesar la cotización.'); } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
  };

  const removeItem = (idx: number) => {
    if (!quote) return;
    const updated = quote.items.filter((_: any, i: number) => i !== idx);
    const subtotal = updated.reduce((a: number, b: any) => a + (b.cantidad * b.precioUnitario), 0);
    const iva = Math.round(subtotal * 0.19);
    setQuote({ ...quote, items: updated, subtotal, iva, total: subtotal + iva });
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 p-4 md:p-8 font-sans">
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-area { background: white !important; color: black !important; border: none !important; }
          .print-area * { color: black !important; border-color: #e4e4e7 !important; }
        }
      `}</style>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="no-print md:col-span-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xs font-bold uppercase text-emerald-400 tracking-widest mb-6 pb-2 border-b border-zinc-800">
            📊 Emisión de Cotización
          </h2>
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
              <label className="block text-zinc-400 mb-1 font-semibold font-mono">Agregar Ítem (Enter)</label>
              <textarea rows={3} value={prompt} onKeyDown={handleKeyDown} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: Servicio de mantenimiento..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 outline-none resize-none focus:border-emerald-500" />
            </div>
            {error && <div className="p-3 bg-red-950/40 text-red-400 rounded-lg border border-red-800/30">{error}</div>}
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold py-3 rounded-lg transition">
              {loading ? 'Calculando...' : 'Sumar al Balance'}
            </button>
            {quote && (
              <button onClick={() => window.print()} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg border border-zinc-700 font-semibold">
                🖨️ Generar PDF
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-8">
          {quote ? (
            <div className="print-area bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">{quote.empresa}</h1>
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-1">Documento Comercial</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-zinc-200">FOLIO: {quote.folio}</p>
                  <p className="text-zinc-500">{quote.fecha}</p>
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
              Esperando registros...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}