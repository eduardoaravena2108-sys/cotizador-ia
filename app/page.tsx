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
    <main className="min-h-screen bg-[#030712] text-cyan-100 p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      <style jsx global>{`
        @media print {
          body {
            background-color: #030712 !important;
            color: #ecfeff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-area {
            border: 1px solid #06b6d4 !important;
            background-color: #080e21 !important;
            box-shadow: 0 0 25px rgba(6, 182, 212, 0.3) !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
          }
        }
      `}</style>

      {/* ENCABEZADO ESTILO NEÓN CYBERPUNK */}
      <header className="no-print max-w-6xl mx-auto mb-8 border border-cyan-500/40 bg-slate-950/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Cotium SPA Logo" className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              COTIUM SPA
            </h1>
            <p className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              PROYECTA CONTROL, ORDEN Y AUTORIDAD EN TU GESTIÓN
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-full border border-cyan-500/50 bg-cyan-950/40 text-cyan-300 font-mono text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          SISTEMA DE MANTENIMIENTO & COTIZACIÓN
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* PANEL IZQUIERDO DE CONTROL */}
        <div className="no-print md:col-span-4 space-y-6">
          <div className="bg-slate-950/90 border border-cyan-500/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <h2 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-widest mb-6 pb-2 border-b border-cyan-500/20 flex items-center justify-between">
              <span>⚡ OPERACIONES / INGRESO</span>
              <span className="text-[10px] text-blue-400">v2.4</span>
            </h2>
            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-cyan-300 mb-1 font-semibold">Empresa Emisora</label>
                <input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2.5 text-cyan-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
              </div>
              <div>
                <label className="block text-cyan-300 mb-1 font-semibold">Cliente / Receptor</label>
                <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2.5 text-cyan-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
              </div>
              <div>
                <label className="block text-cyan-300 mb-1 font-semibold">Agregar Servicio / Ítem (Enter)</label>
                <textarea rows={3} value={prompt} onKeyDown={handleKeyDown} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: Mantención preventiva motor tripatas..." className="w-full bg-slate-900 border border-cyan-500/30 rounded-lg p-2.5 text-cyan-100 outline-none resize-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
              </div>
              {error && <div className="p-3 bg-red-950/60 text-red-300 rounded-lg border border-red-500/40 text-xs">{error}</div>}
              <button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-sans py-3 rounded-lg transition shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                {loading ? 'PROCESANDO REGISTRO...' : '⚡ INCLUIR EN COTIZACIÓN'}
              </button>
              {quote && (
                <button onClick={() => window.print()} className="w-full bg-slate-900 hover:bg-slate-800 text-cyan-300 py-2.5 rounded-lg border border-cyan-500/40 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  🖨️ EXPORTAR PDF (ESTILO CONTROL NEÓN)
                </button>
              )}
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="bg-slate-950/90 border border-cyan-500/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-widest mb-4 pb-2 border-b border-cyan-500/20 flex justify-between items-center">
              <span>📁 HISTORIAL DE REGISTROS</span>
              <span className="text-[10px] bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 rounded text-cyan-300 font-mono">{history.length}</span>
            </h3>
            {history.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 text-center py-4">Sin registros guardados.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 font-mono">
                {history.map((item) => (
                  <div
                    key={item.folio}
                    onClick={() => setQuote(item)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex justify-between items-center ${
                      quote?.folio === item.folio
                        ? 'bg-slate-800 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/40'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-cyan-300">FOLIO: {item.folio}</p>
                      <p className="text-[10px] text-slate-400">{item.cliente} • ${item.total?.toLocaleString('es-CL')}</p>
                    </div>
                    <button
                      onClick={(e) => deleteQuoteFromHistory(item.folio, e)}
                      title="Eliminar registro"
                      className="text-slate-500 hover:text-red-400 p-1 font-bold text-sm transition"
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
            <div className="print-area bg-slate-950 border border-cyan-500/40 p-8 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
              
              <div className="flex justify-between items-start border-b border-cyan-500/20 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <img src="/logo.png" alt="Cotium SPA Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  <div>
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300 tracking-wider">{quote.empresa}</h1>
                    <p className="text-xs text-cyan-400 font-mono font-semibold uppercase tracking-widest mt-0.5">DOCUMENTO OFICIAL DE GESTIÓN & MANTENIMIENTO</p>
                  </div>
                </div>
                <div className="text-right text-xs font-mono">
                  <p className="font-bold text-cyan-300 border border-cyan-500/40 bg-cyan-950/40 px-3 py-1 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.2)]">FOLIO: {quote.folio}</p>
                  <p className="text-slate-400 mt-2">{quote.fecha}</p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/20 mb-6 text-xs font-mono">
                <span className="text-cyan-400 uppercase block mb-1">DESTINATARIO / RECEPTOR:</span>
                <p className="text-sm font-semibold text-cyan-100">{quote.cliente}</p>
              </div>

              <table className="w-full text-left border-collapse text-xs font-mono mb-6">
                <thead>
                  <tr className="border-b border-cyan-500/30 text-cyan-400 uppercase">
                    <th className="py-2.5 px-2 text-center">Cant.</th>
                    <th className="py-2.5 px-2">Descripción</th>
                    <th className="py-2.5 px-2 text-right">P. Unitario</th>
                    <th className="py-2.5 px-2 text-right">Total</th>
                    <th className="py-2.5 px-2 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {quote.items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-cyan-950/20 transition">
                      <td className="py-3 px-2 text-center font-bold text-cyan-400">{item.cantidad}</td>
                      <td className="py-3 px-2 text-slate-200">{item.descripcion}</td>
                      <td className="py-3 px-2 text-right text-slate-400">${item.precioUnitario.toLocaleString('es-CL')}</td>
                      <td className="py-3 px-2 text-right font-bold text-cyan-300">${(item.cantidad * item.precioUnitario).toLocaleString('es-CL')}</td>
                      <td className="py-3 px-2 text-center no-print">
                        <button onClick={() => removeItem(i)} className="text-slate-500 hover:text-red-400 font-bold">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-end border-t border-cyan-500/20 pt-6 text-xs font-mono">
                <p className="text-slate-400 max-w-xs leading-relaxed">{quote.observaciones}</p>
                <div className="w-60 space-y-2 bg-slate-900/90 p-4 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>${quote.subtotal.toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between text-slate-400"><span>19% IVA</span><span>${quote.iva.toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between font-bold text-cyan-300 text-sm border-t border-cyan-500/30 pt-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]"><span>Total CLP</span><span>${quote.total.toLocaleString('es-CL')}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 border border-cyan-500/20 p-16 text-center text-cyan-500/50 rounded-2xl text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.05)]">
              ESPERANDO REGISTROS DE CONTROL O SELECCIONA UNA COTIZACIÓN DEL HISTORIAL...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}