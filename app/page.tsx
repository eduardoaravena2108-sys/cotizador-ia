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
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          cliente,
          empresa,
          existingItems: quote?.items || []
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setQuote(data.data);
        setPrompt('');
      }
    } catch (err: any) {
      setError('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const removeItem = (indexToRemove: number) => {
    if (!quote) return;
    const updatedItems = quote.items.filter((_: any, idx: number) => idx !== indexToRemove);
    const subtotal = updatedItems.reduce((acc: number, item: any) => acc + (item.cantidad * item.precioUnitario), 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    setQuote({
      ...quote,
      items: updatedItems,
      subtotal,
      iva,
      total
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-area { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            color: black !important;
          }
          .print-area * { color: black !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Panel de Control Lateral */}
        <div className="no-print md:col-span-4 bg-slate-800/90 backdrop-blur p-6 rounded-2xl shadow-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h2 className="text-lg font-bold text-white tracking-wide">Panel de Cotización</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Empresa Emisora</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Cliente / Destinatario</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Agregar Ítem <span className="text-blue-400 font-normal">(Presiona Enter)</span>
              </label>
              <textarea
                rows={3}
                value={prompt}
                onKeyDown={handleKeyDown}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: 5 focos led 19w o solo 'alicate'..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Procesando con IA...' : '⚡ Agregar Ítem'}
            </button>

            {quote && (
              <button
                onClick={() => window.print()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                📄 Imprimir / Guardar PDF
              </button>
            )}
          </div>
        </div>

        {/* Vista Previa del Documento */}
        <div className="md:col-span-8">
          {quote ? (
            <div className="print-area bg-white text-slate-900 p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-200">
              
              {/* Header Documento */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{quote.empresa}</h1>
                  <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase mt-1">Cotización Oficial de Servicios</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-slate-100 px-3 py-1 rounded-md mb-2">
                    <span className="text-xs font-bold text-slate-700">FOLIO: {quote.folio}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">Fecha: {quote.fecha}</p>
                </div>
              </div>

              {/* Info Cliente */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-8">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preparado para</span>
                  <p className="text-sm font-bold text-slate-800">{quote.cliente}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Moneda</span>
                  <p className="text-sm font-bold text-slate-800">CLP (Pesos Chilenos)</p>
                </div>
              </div>

              {/* Tabla de Productos */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-2 text-center w-12">Cant.</th>
                      <th className="py-3 px-2">Descripción</th>
                      <th className="py-3 px-2 text-right w-28">P. Unitario</th>
                      <th className="py-3 px-2 text-right w-28">Total</th>
                      <th className="py-3 px-2 text-center w-10 no-print"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {quote.items.map((item: any, index: number) => (
                      <tr key={index} className="group hover:bg-slate-50/80 transition">
                        <td className="py-3 px-2 text-center font-bold text-blue-600">{item.cantidad}</td>
                        <td className="py-3 px-2 text-slate-700 font-medium">{item.descripcion}</td>
                        <td className="py-3 px-2 text-right text-slate-600">${item.precioUnitario.toLocaleString('es-CL')}</td>
                        <td className="py-3 px-2 text-right font-bold text-slate-900">${(item.cantidad * item.precioUnitario).toLocaleString('es-CL')}</td>
                        <td className="py-3 px-2 text-center no-print">
                          <button
                            onClick={() => removeItem(index)}
                            title="Eliminar ítem"
                            className="text-slate-300 hover:text-red-500 font-bold transition text-xs"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen e Impuestos */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-slate-200 pt-6 gap-6">
                <div className="text-xs text-slate-500 max-w-sm">
                  <p className="font-semibold text-slate-700 mb-1">Términos y Condiciones</p>
                  <p>{quote.observaciones}</p>
                </div>

                <div className="w-full md:w-64 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>${quote.subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>19% IVA:</span>
                    <span>${quote.iva.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                    <span>TOTAL:</span>
                    <span className="text-blue-600">${quote.total.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-800/40 border-2 border-dashed border-slate-700 p-16 rounded-2xl text-center">
              <p className="text-slate-400 font-medium">Ingresa un producto o servicio en el panel para comenzar la cotización.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}