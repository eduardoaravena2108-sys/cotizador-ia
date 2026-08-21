'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [companyName, setCompanyName] = useState('COTIUM SPA');
  const [clientName, setClientName] = useState('Cliente General / Empresa');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quoteData, setQuoteData] = useState<any>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cliente: clientName, empresa: companyName }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      if (data.data) {
        setQuoteData(data.data);
      } else {
        setErrorMessage('La respuesta no contiene datos válidos.');
      }
    } catch (e: any) {
      console.error('Error al generar:', e);
      setErrorMessage(e.message || 'Ocurrió un error al conectar con la IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Navbar Superior Cotium */}
      <header className="no-print" style={{ backgroundColor: '#0F172A', color: '#FFF', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', color: '#FFF' }}>C</div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '1px', color: '#38BDF8' }}>COTIUM</span>
            <span style={{ fontSize: '0.75rem', display: 'block', color: '#94A3B8' }}>Motor de Cotizaciones Inteligente</span>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Panel SaaS Profesional</div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px' }}>
        
        {/* Panel Izquierdo: Formularios */}
        <form onSubmit={handleGenerate} className="no-print" style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', marginBottom: '16px' }}>⚙️ Ajustes de Cotización</h2>
          
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nombre de tu Emisor / Empresa:</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '16px', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />

          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nombre del Cliente:</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '16px', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />

          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Detalle o lista de productos:</label>
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="Ej: 5 focos led 18w (Presiona Enter para procesar)"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '16px', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }}
          />

          {errorMessage && (
            <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '0.8rem', marginBottom: '16px' }}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            style={{
              width: '100%',
              backgroundColor: loading ? '#94A3B8' : '#0284C7',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '12px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              marginBottom: '12px'
            }}
          >
            {loading ? 'Procesando con Cotium IA...' : '✨ Cotizar con Cotium'}
          </button>

          {quoteData && (
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                width: '100%',
                backgroundColor: '#10B981',
                color: '#FFF',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              📥 Guardar / Imprimir PDF Oficial
            </button>
          )}
        </form>

        {/* Panel Derecho: Visor A4 */}
        <div>
          {quoteData ? (
            <div style={{ backgroundColor: '#FFFFFF', padding: '48px', borderRadius: '8px', border: '1px solid #CBD5E1', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #0F172A', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{companyName}</h1>
                  <p style={{ fontSize: '0.85rem', color: '#0284C7', margin: '4px 0 0 0', fontWeight: '600' }}>PLATAFORMA COTIUM - DOCUMENTO OFICIAL</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0284C7' }}>COTIZACIÓN</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}><b>FOLIO:</b> {quoteData.folio}</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}><b>FECHA:</b> {quoteData.fecha}</div>
                </div>
              </div>

              <div style={{ marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>CLIENTE / DESTINATARIO:</span>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B', marginTop: '2px' }}>{quoteData.cliente}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0F172A', color: '#FFFFFF', textAlign: 'left', fontSize: '0.85rem' }}>
                    <th style={{ padding: '10px 12px' }}>CANT.</th>
                    <th style={{ padding: '10px 12px' }}>DESCRIPCIÓN</th>
                    <th style={{ padding: '10px 12px' }}>P. UNITARIO</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.items?.map((item: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#0284C7' }}>{item.cantidad}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{item.descripcion}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>${(item.precioUnitario || 0).toLocaleString('es-CL')}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>${(item.total || 0).toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #E2E8F0', paddingTop: '16px' }}>
                <div style={{ maxWidth: '300px', fontSize: '0.8rem', color: '#64748B' }}>
                  <b>Notas Técnicas:</b> {quoteData.observaciones}
                </div>
                <div style={{ width: '220px', textAlign: 'right', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                    <span>Subtotal:</span>
                    <span>${(quoteData.subtotal || 0).toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                    <span>19% IVA:</span>
                    <span>${(quoteData.iva || 0).toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #CBD5E1', marginTop: '6px', fontSize: '1.15rem', fontWeight: '800', color: '#0284C7' }}>
                    <span>TOTAL:</span>
                    <span>${(quoteData.total || 0).toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ backgroundColor: '#FFFFFF', padding: '64px', borderRadius: '8px', border: '1px dashed #CBD5E1', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡</div>
              <h3 style={{ fontSize: '1.2rem', color: '#475569', margin: '0 0 8px 0', fontWeight: '700' }}>Visor de Documentos Cotium</h3>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>Ingresa la lista de productos y presiona **Enter** para generar la cotización.</p>
            </div>
          )}
        </div>

      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; }
        }
      `}</style>
    </div>
  );
}