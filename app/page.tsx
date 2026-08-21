'use client';
import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<any>({
    folio: 'NS-2026-8841',
    fecha: new Date().toLocaleDateString('es-CL'),
    cliente: 'Empresa / Solicitante',
    items: [
      { cantidad: 10, descripcion: 'Foco LED Panel 18W Empotrable', precioUnitario: 14900, total: 149000 },
      { cantidad: 1, descripcion: 'Servicio de Inspección y Montaje Técnico', precioUnitario: 45000, total: 45000 }
    ],
    subtotal: 194000,
    iva: 36860,
    total: 230860,
    observaciones: 'Documento preliminar generado automáticamente por NetShield Engine v2.0.'
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.data) {
        setQuoteData(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!quoteData) return;
    const doc = new jsPDF();

    // Encabezado Corporativo Dark
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(56, 189, 248);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NETSHIELD', 14, 20);

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SOLUCIONES DE CIBERSEGURIDAD Y PROYECTOS TÉCNICOS', 14, 28);

    // Metadatos
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`COTIZACIÓN N°: ${quoteData.folio}`, 140, 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${quoteData.fecha}`, 140, 27);

    // Cliente
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE:', 14, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`Entidad: ${quoteData.cliente}`, 14, 55);

    // Tabla de Productos
    const tableRows = quoteData.items.map((item: any) => [
      item.cantidad,
      item.descripcion,
      `$${(item.precioUnitario || 0).toLocaleString('es-CL')}`,
      `$${(item.total || 0).toLocaleString('es-CL')}`
    ]);

    (doc as any).autoTable({
      startY: 62,
      head: [['Cant.', 'Descripción / Detalle Técnico', 'P. Unitario', 'Total']],
      body: tableRows,
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5 },
      theme: 'striped'
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    // Totales
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, 135, finalY);
    doc.text(`$${(quoteData.subtotal || 0).toLocaleString('es-CL')}`, 170, finalY, { align: 'right' });

    doc.text(`19% IVA:`, 135, finalY + 6);
    doc.text(`$${(quoteData.iva || 0).toLocaleString('es-CL')}`, 170, finalY + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(2, 132, 199);
    doc.text(`TOTAL CLP:`, 135, finalY + 14);
    doc.text(`$${(quoteData.total || 0).toLocaleString('es-CL')}`, 170, finalY + 14, { align: 'right' });

    // Pie de página
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Notas: ${quoteData.observaciones || 'Documento oficial con validez técnica.'}`, 14, finalY + 30);

    doc.save(`Cotizacion_${quoteData.folio}.pdf`);
  };

  return (
    <div style={{ backgroundColor: '#0B0F17', minHeight: '100vh', padding: '32px 16px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Panel Superior de Control */}
      <div style={{ maxWidth: '850px', margin: '0 auto 24px', backgroundColor: '#161F2E', padding: '20px', borderRadius: '12px', border: '1px solid #233146' }}>
        <h1 style={{ color: '#38BDF8', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 12px 0' }}>
          🛡️ GENERADOR DE DOCUMENTOS Y COTIZACIONES
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            style={{
              flex: 1,
              backgroundColor: '#0B0F17',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#F8FAFC',
              padding: '12px 16px',
              fontSize: '0.95rem',
              outline: 'none'
            }}
            placeholder="Ej: Cotizar 20 focos LED de 18W y mano de obra..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              backgroundColor: '#0284C7',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0 24px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Procesando...' : 'Actualizar Hoja'}
          </button>
        </div>
      </div>

      {/* VISTA HOJA DOCUMENTO PDF (A4 PREVIEW) */}
      <div style={{
        maxWidth: '850px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Header Membrete */}
        <div style={{ backgroundColor: '#0F172A', color: '#FFF', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38BDF8', letterSpacing: '1px' }}>NETSHIELD</div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px' }}>SOLUCIONES DE CIBERSEGURIDAD Y PROYECTOS TÉCNICOS</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38BDF8' }}>COTIZACIÓN OFICIAL</div>
            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '4px' }}>FOLIO: {quoteData.folio}</div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>FECHA: {quoteData.fecha}</div>
          </div>
        </div>

        {/* Cuerpos e Información */}
        <div style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>DIRIGIDO A:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1E293B' }}>{quoteData.cliente}</div>
          </div>

          {/* Tabla Estilizada */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left', fontSize: '0.85rem', color: '#475569' }}>
                <th style={{ padding: '12px' }}>CANT.</th>
                <th style={{ padding: '12px' }}>DESCRIPCIÓN</th>
                <th style={{ padding: '12px' }}>P. UNITARIO</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {quoteData.items?.map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#0284C7' }}>{item.cantidad}</td>
                  <td style={{ padding: '12px', color: '#334155' }}>{item.descripcion}</td>
                  <td style={{ padding: '12px', color: '#475569' }}>${(item.precioUnitario || 0).toLocaleString('es-CL')}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#0F172A' }}>${(item.total || 0).toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bloque Inferior Totales & Sello */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '2px solid #E2E8F0', paddingTop: '20px' }}>
            <div style={{ maxWidth: '350px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748B', marginBottom: '4px' }}>OBSERVACIONES TÉCNICAS:</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>{quoteData.observaciones}</div>
              <div style={{ marginTop: '16px', display: 'inline-block', padding: '6px 12px', border: '1px solid #10B981', color: '#059669', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                ✓ FIRMA Y DOCUMENTO VERIFICADO
              </div>
            </div>

            <div style={{ width: '220px', textAlign: 'right', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
                <span>Subtotal:</span>
                <span>${(quoteData.subtotal || 0).toLocaleString('es-CL')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
                <span>19% IVA:</span>
                <span>${(quoteData.iva || 0).toLocaleString('es-CL')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #CBD5E1', marginTop: '8px', fontSize: '1.1rem', fontWeight: 'bold', color: '#0284C7' }}>
                <span>TOTAL:</span>
                <span>${(quoteData.total || 0).toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
          </div>

          {/* Botón de Descarga PDF Directa */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button
              onClick={generatePDF}
              style={{
                backgroundColor: '#10B981',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              📄 DESCARGAR PDF OFICIAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}