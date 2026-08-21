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
        setPrompt(''); // Limpiar el input para el siguiente ítem
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

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      {/* Estilos para que al imprimir sólo salga la cotización limpia */}
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
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Panel Izquierdo: Controles (No se imprime) */}
        <div className="no-print md:col-span-4 bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            ⚙️ Ajustes de Cotización
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Empresa / Emisor:</label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente / Destinatario:</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Agregar Producto / Servicio (Presiona Enter):
              </label>
              <textarea
                rows={3}
                value={prompt}
                onKeyDown={handleKeyDown}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: martillo (por defecto será 1)"
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-200">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Procesando...' : '✨ Agregar a la Cotización'}
            </button>

            {quote && (
              <button
                onClick={() => window.print()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                🖨️ Descargar / Imprimir PDF
              </button>
            )}
          </div>
        </div>

        {/* Panel Derecho: Vista Previa / Documento Formal */}
        <div className="md:col-span-8">
          {quote ? (
            <div className="print-area bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-slate-800">
              
              {/* Encabezado */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{quote.empresa}</h1>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Cotización de Servicios y Productos</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-sky-700">COTIZACIÓN</span>
                  <p className="text-xs text-slate-600 font-medium">FOLIO: {quote.folio}</p>
                  <p className="text-xs text-slate-600 font-medium">FECHA: {quote.fecha}</p>
                </div>
              </div>

              {/* Datos Cliente */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Cliente / Destinatario:</span>
                <p className="text-base font-semibold text-slate-800">{quote.cliente}</p>
              </div>

              {/* Tabla de Productos */}
              <table className="w-full text-left border-collapse mb-6">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    <th className="p-3 text-center w-16">CANT.</th>
                    <th className="p-3">DESCRIPCIÓN</th>
                    <th className="p-3 text-right w-32">P. UNITARIO</th>
                    <th className="p-3 text-right w-32">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {quote.items.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-bold text-sky-700">{item.cantidad}</td>
                      <td className="p-3 text-slate-700">{item.descripcion}</td>
                      <td className="p-3 text-right">${item.precioUnitario.toLocaleString('es-CL')}</td>
                      <td className="p-3 text-right font-semibold">${(item.cantidad * item.precioUnitario).toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totales */}
              <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                <div className="text-xs text-slate-500 max-w-xs">
                  <p className="font-semibold text-slate-600">Notas:</p>
                  <p>{quote.observaciones}</p>
                </div>
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>${quote.subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>19% IVA:</span>
                    <span>${quote.iva.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-300 pt-2">
                    <span>TOTAL:</span>
                    <span className="text-sky-700">${quote.total.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-md border border-slate-200 text-center text-slate-400">
              <p className="text-base font-medium">Ingresa un producto en el panel izquierdo para generar la cotización.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}