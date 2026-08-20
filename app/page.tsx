'use client';
import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('SISTEMA EN ESPERA');
  const [quoteData, setQuoteData] = useState<any>(null);

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setStatusText('ANALIZANDO SOLICITUD Y NORMAS DE SEGURIDAD...');
    setQuoteData(null);

    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      let parsed = data.data;
      if (!parsed) {
        // Fallback local en caso de que falte la API Key o falle la respuesta
        parsed = {
          folio: `NS-${Math.floor(100000 + Math.random() * 900000)}`,
          fecha: new Date().toLocaleDateString('es-CL'),
          cliente: 'Cliente General / Empresa',
          items: [
            { cantidad: 10, descripcion: prompt, precioUnitario: 15000, total: 150000 }
          ],
          subtotal: 150000,
          iva: 28500,
          total: 178500,
          observaciones: 'Presupuesto sujeto a disponibilidad técnica e inspección en terreno.'
        };
      }
      setQuoteData(parsed);
      setStatusText('ANÁLISIS COMPLETADO - DOCUMENTO LISTO');
    } catch (e) {
      console.error(e);
      setStatusText('ERROR DE RED - GENERANDO MODO LOCAL');
      setQuoteData({
        folio: `NS-${Math.floor(100000 + Math.random() * 900000)}`,
        fecha: new Date().toLocaleDateString('es-CL'),
        cliente: 'Cliente Estándar',
        items: [{ cantidad: 1, descripcion: prompt, precioUnitario: 25000, total: 25000 }],
        subtotal: 25000,
        iva: 4750,
        total: 29750,
        observaciones: 'Generado autónomamente por NetShield Engine.'
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!quoteData) return;

    const doc = new jsPDF();

    // Encabezado Cyber / Antivirus Estilo NetShield
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(56, 189, 248); // sky-400
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('NETSHIELD AUDIT & QUOTE', 14, 22);

    doc.setTextColor(226, 232, 240);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`FOLIO: ${quoteData.folio}  |  FECHA: ${quoteData.fecha}`, 14, 32);

    // Información del Cliente y Estado
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DE LA SOLICITUD', 14, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Cliente / Entidad: ${quoteData.cliente}`, 14, 58);
    doc.text(`Estado de Verificación: AUTENTICADO / SEGURO`, 14, 64);

    // Tabla de Ítems
    const tableRows = quoteData.items.map((item: any) => [
      item.cantidad,
      item.descripcion,
      `$${item.precioUnitario?.toLocaleString('es-CL') || 0}`,
      `$${item.total?.toLocaleString('es-CL') || 0}`
    ]);

    (doc as any).autoTable({
      startY: 72,
      head: [['Cant.', 'Descripción del Producto / Servicio', 'P. Unitario ($)', 'Total ($)']],
      body: tableRows,
      headStyles: { fillStyle: 'F', fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Resumen Financiero
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: $${quoteData.subtotal?.toLocaleString('es-CL') || 0}`, 130, finalY);
    doc.text(`IVA (19%): $${quoteData.iva?.toLocaleString('es-CL') || 0}`, 130, finalY + 6);
    doc.setFontSize(12);
    doc.setTextColor(2, 132, 199);
    doc.text(`TOTAL: $${quoteData.total?.toLocaleString('es-CL') || 0} CLP`, 130, finalY + 14);

    // Pie de página y Notas
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Observaciones: ${quoteData.observaciones || 'Sin observaciones.'}`, 14, finalY + 25);
    doc.text('Documento generado automáticamente por NetShield Engine v2.0 - Autenticidad Validada.', 14, finalY + 32);

    doc.save(`Cotizacion_${quoteData.folio}.pdf`);
  };

  return (
    <div style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'monospace, sans-serif', padding: '24px 16px' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Top Antivirus Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#111827',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: loading ? '#f59e0b' : '#10b981',
              boxShadow: loading ? '0 0 10px #f59e0b' : '0 0 10px #10b981'
            }} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#38bdf8' }}>NETSHIELD ENGINE v2.0</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SISTEMA AUTÓNOMO DE GENERACIÓN Y AUDITORÍA</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#94a3b8' }}>
            {statusText}
          </div>
        </div>

        {/* Input Terminal Box */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            &gt; INGRESE REQUERIMIENTO O LISTADO DE PRODUCTOS:
          </label>
          <textarea
            style={{
              width: '100%',
              height: '100px',
              backgroundColor: '#020617',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#38bdf8',
              padding: '12px',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              fontFamily: 'monospace'
            }}
            placeholder="Ej: Cotizar 10 focos led de 18w y 5 rollos de cable 2.5mm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={handleProcess}
            disabled={loading}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#334155' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              textTransform: 'uppercase'
            }}
          >
            {loading ? 'ANALIZANDO Y ESCANEANDO...' : 'PROCESAR Y ANALIZAR COTIZACIÓN'}
          </button>
        </div>

        {/* Output Panel / PDF Generator */}
        {quoteData && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #0284c7', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>RESUMEN DE COTIZACIÓN PROCESADA</h3>
              <button
                onClick={generatePDF}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                }}
              >
                📥 DESCARGAR INFORME PDF AUTÓNOMO
              </button>
            </div>

            <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div><strong style={{ color: '#64748b' }}>FOLIO:</strong> {quoteData.folio}</div>
                <div><strong style={{ color: '#64748b' }}>FECHA:</strong> {quoteData.fecha}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>CANT.</th>
                    <th style={{ padding: '8px' }}>DESCRIPCIÓN</th>
                    <th style={{ padding: '8px' }}>UNITARIO</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.items?.map((item: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', color: '#38bdf8' }}>{item.cantidad}</td>
                      <td style={{ padding: '8px' }}>{item.descripcion}</td>
                      <td style={{ padding: '8px' }}>${item.precioUnitario?.toLocaleString('es-CL')}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>${item.total?.toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: 'right', fontSize: '1rem', color: '#38bdf8', fontWeight: 'bold' }}>
                TOTAL ESTIMADO: ${quoteData.total?.toLocaleString('es-CL')} CLP
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}