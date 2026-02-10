import { useState } from 'react';
import { Payment } from '../lib/types';

interface GeneratePdfOptions {
  payments: Payment[];
  generationId: string;
  generationMonth: number;
  generationYear: number;
}

export const usePaymentTicketPdf = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = async (options: GeneratePdfOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = {
        payments: options.payments.map(p => ({
          id: p.id,
          amount: p.amount,
          paidAmount: p.paidAmount || 0,
          type: p.type,
          status: p.status,
          description: p.description || '',
          member: {
            id: p.member?.id || 0,
            name: p.member?.name || '',
            second_name: p.member?.second_name || ''
          }
        })),
        generation: {
          id: options.generationId,
          month: options.generationMonth,
          year: options.generationYear
        },
        output: 'tickets.pdf'
      };

      // Create a temporary JSON file
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);

      // In a real implementation, you would call your backend API here
      // For now, we'll create a client-side PDF using jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const getMonthName = (month: number): string => {
        const months = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[month - 1];
      };

      const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0
        }).format(amount);
      };

      const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
          'societary-only': 'Solo Societaria',
          'principal-sport': 'Deporte Principal',
          'secondary-sport': 'Deporte Secundario'
        };
        return labels[type] || type;
      };

      const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
          'pending': 'PENDIENTE',
          'partial': 'PARCIAL',
          'paid': 'PAGADO',
          'cancelled': 'CANCELADO'
        };
        return labels[status] || status;
      };

      // Generate summary page
      let yPos = 20;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DE GENERACIÓN DE CUOTAS', 105, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('CLUB DEPORTIVO', 105, yPos, { align: 'center' });
      
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const period = `${getMonthName(options.generationMonth)} ${options.generationYear}`;
      doc.text(`Período: ${period}`, 20, yPos);
      yPos += 6;
      doc.text(`ID de Generación: ${options.generationId}`, 20, yPos);
      yPos += 6;
      doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`, 20, yPos);
      yPos += 6;
      doc.text(`Total de Cuotas: ${options.payments.length}`, 20, yPos);
      
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN FINANCIERO', 20, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      
      const totalAmount = options.payments.reduce((sum, p) => sum + p.amount, 0);
      const totalPaid = options.payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
      const totalPending = totalAmount - totalPaid;
      
      doc.text(`Monto Total Generado:`, 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(totalAmount), 190, yPos, { align: 'right' });
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      
      doc.text(`Monto Total Pagado:`, 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(totalPaid), 190, yPos, { align: 'right' });
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      
      doc.text(`Saldo Pendiente Total:`, 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(totalPending), 190, yPos, { align: 'right' });
      
      // Count by type
      const countByType = options.payments.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRIBUCIÓN POR TIPO', 20, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      
      doc.text('Solo Societaria:', 20, yPos);
      doc.text(`${countByType['societary-only'] || 0} cuotas`, 190, yPos, { align: 'right' });
      yPos += 6;
      
      doc.text('Deporte Principal:', 20, yPos);
      doc.text(`${countByType['principal-sport'] || 0} cuotas`, 190, yPos, { align: 'right' });
      yPos += 6;
      
      doc.text('Deporte Secundario:', 20, yPos);
      doc.text(`${countByType['secondary-sport'] || 0} cuotas`, 190, yPos, { align: 'right' });
      
      const countByStatus = options.payments.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRIBUCIÓN POR ESTADO', 20, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      
      doc.text('Pendientes:', 20, yPos);
      doc.text(`${countByStatus['pending'] || 0} cuotas`, 190, yPos, { align: 'right' });
      yPos += 6;
      
      doc.text('Parciales:', 20, yPos);
      doc.text(`${countByStatus['partial'] || 0} cuotas`, 190, yPos, { align: 'right' });
      yPos += 6;
      
      doc.text('Pagadas:', 20, yPos);
      doc.text(`${countByStatus['paid'] || 0} cuotas`, 190, yPos, { align: 'right' });
      yPos += 6;
      
      doc.text('Canceladas:', 20, yPos);
      doc.text(`${countByStatus['cancelled'] || 0} cuotas`, 190, yPos, { align: 'right' });

      for (const payment of options.payments) {
        doc.addPage();
        yPos = 20;

        const memberName = payment.member 
          ? `${payment.member.name} ${payment.member.second_name}`.trim() 
          : `Socio #${payment.member?.id || 'N/A'}`;
        
        const pendingAmount = payment.amount - (payment.paidAmount || 0);

        // Draw border
        doc.setDrawColor(255, 215, 0); // Gold color
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);
        
        doc.setDrawColor(229, 231, 235); // Gray color
        doc.setLineWidth(0.5);
        doc.rect(12, 12, 186, 273);

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('TICKET DE CUOTA', 105, yPos, { align: 'center' });
        
        yPos += 8;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('CLUB DEPORTIVO', 105, yPos, { align: 'center' });
        
        yPos += 15;
        
        // Member information
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(243, 244, 246);
        doc.rect(20, yPos - 4, 170, 8, 'F');
        doc.setTextColor(31, 41, 55);
        doc.text('INFORMACIÓN DEL SOCIO', 20, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Socio:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(memberName, 70, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Nro. de Socio:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(payment.member?.id || 'N/A'), 70, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'bold');
        doc.text('ID de Cuota:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`#${payment.id}`, 70, yPos);
        
        yPos += 12;
        
        // Payment details
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(243, 244, 246);
        doc.rect(20, yPos - 4, 170, 8, 'F');
        doc.setTextColor(31, 41, 55);
        doc.text('DETALLE DE LA CUOTA', 20, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Período:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(period, 70, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Tipo:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(getTypeLabel(payment.type), 70, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Descripción:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(payment.description || 'Cuota mensual', 70, yPos);
        
        yPos += 12;
        
        // Amounts
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(243, 244, 246);
        doc.rect(20, yPos - 4, 170, 8, 'F');
        doc.setTextColor(31, 41, 55);
        doc.text('MONTOS', 20, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += 10;
        doc.setFontSize(10);
        
        doc.text('Monto Total:', 25, yPos);
        doc.text(formatCurrency(payment.amount), 185, yPos, { align: 'right' });
        yPos += 6;
        
        doc.text('Monto Pagado:', 25, yPos);
        doc.text(formatCurrency(payment.paidAmount || 0), 185, yPos, { align: 'right' });
        yPos += 6;
        
        doc.text('Saldo Pendiente:', 25, yPos);
        doc.text(formatCurrency(pendingAmount), 185, yPos, { align: 'right' });
        
        yPos += 12;
        
        // Status
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(243, 244, 246);
        doc.rect(20, yPos - 4, 170, 8, 'F');
        doc.setTextColor(31, 41, 55);
        doc.text('ESTADO DEL PAGO', 20, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += 10;
        doc.setFontSize(11);
        doc.text(getStatusLabel(payment.status), 25, yPos);
        
        yPos += 12;
        
        // Additional info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(243, 244, 246);
        doc.rect(20, yPos - 4, 170, 8, 'F');
        doc.setTextColor(31, 41, 55);
        doc.text('INFORMACIÓN ADICIONAL', 20, yPos);
        doc.setTextColor(0, 0, 0);
        
        yPos += 10;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        
        doc.setFont('helvetica', 'bold');
        doc.text('ID de Generación:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(options.generationId, 70, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Fecha de Emisión:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`, 70, yPos);
        
        yPos += 15;
        
        // Footer note
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.rect(20, yPos, 170, 20);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128);
        
        const noteLines = [
          'IMPORTANTE: Este ticket es un comprobante informativo',
          'Para realizar el pago, acérquese a la secretaría del club'
        ];
        
        yPos += 6;
        noteLines.forEach(line => {
          doc.text(line, 105, yPos, { align: 'center' });
          yPos += 5;
        });
        
        doc.setTextColor(0, 0, 0);
      }

      // Save the PDF
      const fileName = `tickets-cuotas-${getMonthName(options.generationMonth)}-${options.generationYear}.pdf`;
      doc.save(fileName);

      URL.revokeObjectURL(jsonUrl);

    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el PDF');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePdf,
    isGenerating,
    error
  };
};