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
    <main className="min-h-screen p-4 md:p-8">
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            margin: 0 !important; 
            padding: 0 !important; 
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Panel Izquierdo */}
        <div className="no-print md:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Ajustes de Cotización
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emisor / Empresa</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:bg-white focus:border-slate-800 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente / Destinatario</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:bg-white focus:border-slate-800 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Añadir Producto o Servicio <span className="text-slate-400 font-normal">(Enter)</span>
              </label>
              <textarea
                rows={3}
                value={prompt}
                onKeyDown={handleKeyDown}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: 5 focos led 19w..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:bg-white focus:border-slate-800 outline-none resize-none transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Agregar a la Cotización'}
            </button>

            {quote && (
              <button
                onClick={() => window.print()}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold border border-slate-300 py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
              >
                🖨️ Descargar / Imprimir PDF
              </button>
            )}
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="md:col-span-8">
          {quote ? (
            <div className="print-area bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-sm text-slate-900">
              
              {/* Encabezado */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{quote.empresa}</h1>
                  <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">COTIZACIÓN DE SERVICIOS</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">N° {quote.folio}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Fecha: {quote.fecha}</p>
                </div>
              </div>

              {/* Info Cliente */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 mb-6">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Cliente / Destinatario</p>
                <p className="text-sm font-bold text-slate-800">{quote.cliente}</p>
              </div>

              {/* Tabla */}
              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="border-b border-slate-300 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-2 px-2 text-center w-12">Cant.</th>
                    <th className="py-2 px-2">Descripción</th>
                    <th className="py-2 px-2 text-right w-28">P. Unitario</th>
                    <th className="py-2 px-2 text-right w-28">Total</th>
                    <th className="py-2 px-2 text-center w-8 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {quote.items.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 text-center font-semibold text-slate-700">{item.cantidad}</td>
                      <td className="py-3 px-2 text-slate-800">{item.descripcion}</td>
                      <td className="py-3 px-2 text-right text-slate-600">${item.precioUnitario.toLocaleString('es-CL')}</td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-900">${(item.cantidad * item.precioUnitario).toLocaleString('es-CL')}</td>
                      <td className="py-3 px-2 text-center no-print">
                        <button
                          onClick={() => removeItem(index)}
                          title="Eliminar"
                          className="text-slate-300 hover:text-red-600 font-bold text-xs"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totales */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-slate-200 pt-6 gap-6">
                <div className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  <p className="font-semibold text-slate-700 mb-0.5">Observaciones</p>
                  <p>{quote.observaciones}</p>
                </div>

                <div className="w-full sm:w-56 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${quote.subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>19% IVA</span>
                    <span>${quote.iva.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-300 pt-2">
                    <span>Total CLP</span>
                    <span>${quote.total.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
              <p className="text-sm">Ingresa los productos o servicios en el panel para generar el documento.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}