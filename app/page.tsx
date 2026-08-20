'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-slate-50 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Generador de Cotizaciones IA</h1>
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <textarea
          className="w-full p-4 border border-slate-300 rounded-lg mb-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Ej: Cotizar 3 focos LED a $5.000 c/u..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Generando...' : 'Generar Cotizaci¢n'}
        </button>
      </div>
      {result && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Resultado</h2>
          <pre className="bg-slate-100 p-4 rounded-lg text-slate-800 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
