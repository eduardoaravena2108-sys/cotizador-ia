'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
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
        body: JSON.stringify({ prompt }),
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ENCABEZADO */}
        <header className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl md:text-3xl font-extrabold text-cyan-400 tracking-wider">
            COTIUM SPA
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-semibold tracking-wide">
            SISTEMA INTELIGENTE DE VERIFICACIÓN DE PRECIOS Y AUDITORÍA EN TIENDAS
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PANEL BÚSQUEDA */}
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
            <h2 className="text-cyan-400 font-bold tracking-wide flex items-center gap-2">
              🔍 BÚSQUEDA WEB Y MATERIALES
            </h2>
            <p className="text-xs text-slate-400">
              Puedes ingresar varios materiales separados por coma o saltos de línea.
            </p>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 min-h-[140px]"
              placeholder="Ej: 2 Foco LED embutido 18W, 1 Rotomartillo, Rollo cable 2.5mm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-lg transition-all"
            >
              {loading ? '⚡ BUSCANDO EN LA WEB...' : '⚡ BUSCAR Y COMPARAR PRECIOS'}
            </button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          {/* PANEL RESULTADOS */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <h2 className="text-slate-300 font-bold tracking-wide mb-4">
                DESGLOSE TÉCNICO Y AUDITORÍA DE PRECIOS
              </h2>

              {quoteData?.items && quoteData.items.length > 0 ? (
                <div className="space-y-4">
                  {quoteData.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-100 text-base">
                            {item.cantidad}x {item.descripcion}
                          </span>
                          <p className="text-xs text-cyan-300/80 mt-0.5">
                            🔧 {item.detalleTecnico}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-cyan-400 font-bold text-lg">
                            ${item.precioTotal?.toLocaleString('es-CL')}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            (${item.precioUnitario?.toLocaleString('es-CL')} c/u)
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                        <span>📍 Tienda principal: <strong className="text-slate-300">{item.tiendaOrigen}</strong></span>
                      </div>

                      {item.ofertaSugerida && (
                        <div className="bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-md flex justify-between items-center text-xs mt-2">
                          <div>
                            <p className="text-emerald-400 font-semibold">
                              💡 Mejor opción alternativa en {item.ofertaSugerida.tienda}
                            </p>
                            <p className="text-emerald-300">
                              Precio unitario: ${item.ofertaSugerida.precio?.toLocaleString('es-CL')} 
                              (Ahorro estimado total: ${item.ofertaSugerida.ahorro?.toLocaleString('es-CL')})
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
                <div>
                  <p className="text-slate-400 text-xs">Total Neto + IVA (19%)</p>
                  <p className="text-slate-500 text-[10px]">{quoteData.observaciones}</p>
                </div>
                <span className="text-2xl font-extrabold text-cyan-400">
                  ${quoteData.total?.toLocaleString('es-CL')} CLP
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}