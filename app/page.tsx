'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <main style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px', textAlign: 'center' }}>
          Generador de Cotizaciones IA
        </h1>
        
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
            Ingresa tu requerimiento:
          </label>
          <textarea
            style={{
              width: '100%',
              height: '110px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '1rem',
              color: '#1e293b',
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
              padding: '12px',
              backgroundColor: loading ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Generando cotización...' : 'Generar Cotización'}
          </button>
        </div>

        {result && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>
              Resultado:
            </h2>
            <pre style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', color: '#0f172a', fontSize: '0.9rem', overflowX: 'auto' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}