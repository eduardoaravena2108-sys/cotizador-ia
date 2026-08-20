'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);
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
      setResult({ error: 'Error al conectar con la API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#f8fafc' }}>
      <main style={{ maxWidth: '650px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center', color: '#38bdf8' }}>
          Cotizador Inteligente IA
        </h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '32px' }}>
          Ingresa los productos que necesitas y la IA procesará la cotización al instante.
        </p>

        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px' }}>
          <textarea
            style={{
              width: '100%',
              height: '110px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #475569',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              fontSize: '1rem',
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'vertical'
            }}
            placeholder="Ej: Cotizar 20 focos LED de 18W..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#64748b' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Consultando IA...' : 'Generar Cotización Reales'}
          </button>
        </div>

        {result && (
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #38bdf8' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>
              Respuesta del Sistema:
            </h2>
            <pre style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.9rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {result.resultado || JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}