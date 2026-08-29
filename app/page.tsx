'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [cliente, setCliente] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cliente, empresa }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setQuoteData(json.data);
      } else {
        setError(json.error || 'No se pudieron obtener los precios.');
      }
    } catch (err: any) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel de Búsqueda */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
          <h2 className="text-cyan-400 font-bold tracking-wide flex items-center gap-2">
            🔍 BÚSQUEDA DE PRECIOS Y MATERIALES
          </h2>
          <textarea
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 min-h-[120px]"
            placeholder="Ej: Foco LED embutido 18W, 5 metros cable 2.5mm, rotomartillo..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-lg transition-all"
          >
            {loading ? '⚡ CONSULTANDO...' : '⚡ CONSULTAR Y COMPARAR PRECIOS'}
          </button>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Resultados */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-slate-300 font-bold tracking-wide mb-4">
              DESGLOSE DE MATERIALES Y AUDITORÍA DE TIENDAS
            </h2>

            {quoteData?.items?.length > 0 ? (
              <div className="space-y-4">
                {quoteData.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-200">
                        {item.cantidad}x {item.descripcion}
                      </span>
                      <span className="text-cyan-400 font-bold">
                        ${item.precioUnitario?.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      📍 Fuente/Verificación: {item.tiendaOrigen}
                    </p>

                    {item.ofertaSugerida && (
                      <div className="bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-md flex justify-between items-center text-xs">
                        <div>
                          <p className="text-emerald-400 font-semibold">
                            💡 Oferta alternativa encontrada en {item.ofertaSugerida.tienda}
                          </p>
                          <p className="text-emerald-300">
                            Precio: ${item.ofertaSugerida.precio?.toLocaleString('es-CL')} (Ahorras ${item.ofertaSugerida.ahorro?.toLocaleString('es-CL')})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-12 text-center">
                Ingresa los materiales o herramientas a cotizar a la izquierda.
              </div>
            )}
          </div>

          {quoteData && (
            <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center">
              <span className="text-slate-400 text-sm">Total Neto + IVA (19%)</span>
              <span className="text-2xl font-extrabold text-cyan-400">
                ${quoteData.total?.toLocaleString('es-CL')} CLP
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}