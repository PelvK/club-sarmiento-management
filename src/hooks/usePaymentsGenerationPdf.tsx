import { useState } from "react";
import { Payment } from "../lib/types";

interface GeneratePdfOptions {
  payments: Payment[];
  generationId: string;
  generationMonth: number;
  generationYear: number;
}
/**
 * @todo NWD-011
 */
export const usePaymentTicketPdf = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = async (options: GeneratePdfOptions) => {
    setIsGenerating(true);
    setError(null);
    console.log("Generating PDF with options:", options);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const getMonthName = (month: number): string => {
        const months = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];
        return months[month - 1];
      };

      const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 0,
        }).format(amount);
      };

      const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
          "societary-only": "Societaria",
          "principal-sport": "Deporte Principal",
          "secondary-sport": "Deporte Secundario",
        };
        return labels[type] || type;
      };

      const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
          pending: "PENDIENTE",
          partial: "PARCIAL",
          paid: "PAGADO",
          cancelled: "CANCELADO",
        };
        return labels[status] || status;
      };

      // ========== PÁGINA DE RESUMEN ==========
      let yPos = 20;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("RESUMEN DE GENERACIÓN DE CUOTAS", 105, yPos, {
        align: "center",
      });

      yPos += 8;
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("CLUB DEPORTIVO", 105, yPos, { align: "center" });

      yPos += 15;
      doc.setFontSize(10);

      const period = `${getMonthName(options.generationMonth)} ${options.generationYear}`;
      doc.text(`Período: ${period}`, 20, yPos);
      yPos += 6;
      doc.text(`ID de Generación: ${options.generationId}`, 20, yPos);
      yPos += 6;
      doc.text(
        `Fecha de Generación: ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR")}`,
        20,
        yPos,
      );
      yPos += 6;
      doc.text(`Total de Cuotas: ${options.payments.length}`, 20, yPos);

      yPos += 15;
      doc.setFont("helvetica", "bold");
      doc.text("RESUMEN FINANCIERO", 20, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");

      const totalAmount = options.payments.reduce(
        (sum, p) => sum + p.amount,
        0,
      );
      const totalPaid = options.payments.reduce(
        (sum, p) => sum + (p.paidAmount || 0),
        0,
      );
      const totalPending = totalAmount - totalPaid;

      doc.text(`Monto Total Generado:`, 20, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(totalAmount), 190, yPos, { align: "right" });
      yPos += 6;
      doc.setFont("helvetica", "normal");

      doc.text(`Monto Total Pagado:`, 20, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(totalPaid), 190, yPos, { align: "right" });
      yPos += 6;
      doc.setFont("helvetica", "normal");

      doc.text(`Saldo Pendiente Total:`, 20, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(totalPending), 190, yPos, { align: "right" });

      // Count by type
      const countByType = options.payments.reduce(
        (acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      yPos += 15;
      doc.setFont("helvetica", "bold");
      doc.text("DISTRIBUCIÓN POR TIPO", 20, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");

      doc.text("Solo Societaria:", 20, yPos);
      doc.text(`${countByType["societary-only"] || 0} cuotas`, 190, yPos, {
        align: "right",
      });
      yPos += 6;

      doc.text("Deporte Principal:", 20, yPos);
      doc.text(`${countByType["principal-sport"] || 0} cuotas`, 190, yPos, {
        align: "right",
      });
      yPos += 6;

      doc.text("Deporte Secundario:", 20, yPos);
      doc.text(`${countByType["secondary-sport"] || 0} cuotas`, 190, yPos, {
        align: "right",
      });

      const countByStatus = options.payments.reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      yPos += 15;
      doc.setFont("helvetica", "bold");
      doc.text("DISTRIBUCIÓN POR ESTADO", 20, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");

      doc.text("Pendientes:", 20, yPos);
      doc.text(`${countByStatus["pending"] || 0} cuotas`, 190, yPos, {
        align: "right",
      });
      yPos += 6;

      doc.text("Parciales:", 20, yPos);
      doc.text(`${countByStatus["partial"] || 0} cuotas`, 190, yPos, {
        align: "right",
      });
      yPos += 6;

      doc.text("Pagadas:", 20, yPos);
      doc.text(`${countByStatus["paid"] || 0} cuotas`, 190, yPos, {
        align: "right",
      });
      yPos += 6;

      doc.text("Canceladas:", 20, yPos);
      doc.text(`${countByStatus["cancelled"] || 0} cuotas`, 190, yPos, {
        align: "right",
      });

      // ========== TICKETS COMPACTOS (2 columnas x 5 filas = 10 por página) ==========

      // Configuración del layout
      const ticketWidth = 95; // Mitad de la página (210mm / 2 = 105mm, menos margen)
      const ticketHeight = 56; // Para que quepan 5 por página (297mm / 5 ≈ 59mm, menos margen)
      const marginLeft = 10;
      const marginTop = 10;
      const spacingX = 5;
      const spacingY = 2;
      const ticketsPerRow = 2;
      const ticketsPerColumn = 5;
      const ticketsPerPage = ticketsPerRow * ticketsPerColumn;

      const drawTicket = (payment: Payment, x: number, y: number) => {
        const memberName = payment.member?.id
          ? `${payment.member.name} ${payment.member.second_name}`.trim()
          : `Socio #${payment.member?.id || "N/A"}`;

        const pendingAmount = payment.amount - (payment.paidAmount || 0);

        // Border principal con línea de corte punteada
        doc.setDrawColor(200, 200, 200);
        doc.setLineCap(2);
        doc.setLineWidth(0.3);
        doc.rect(x, y, ticketWidth, ticketHeight);
        doc.setLineCap(0);

        // Header del ticket
        doc.setFillColor(255, 215, 0); // Dorado
        doc.rect(x, y, ticketWidth, 8, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("CUOTA MENSUAL", x + ticketWidth / 2, y + 5.5, {
          align: "center",
        });

        // Línea separadora
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(x, y + 8, x + ticketWidth, y + 8);

        let ticketY = y + 13;

        // Información del socio (compacta)
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text("SOCIO:", x + 3, ticketY);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        // const maxNameWidth = ticketWidth - 25;
        const truncatedName =
          memberName.length > 30
            ? memberName.substring(0, 30) + "..."
            : memberName;
        doc.text(truncatedName, x + 15, ticketY);

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(
          `#${payment.member?.id || "N/A"}`,
          x + ticketWidth - 3,
          ticketY,
          { align: "right" },
        );

        ticketY += 6;

        // Período y tipo en la misma línea
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`${period}`, x + 3, ticketY);

        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text(getTypeLabel(payment.type), x + ticketWidth - 3, ticketY, {
          align: "right",
        });

        ticketY += 5;

        // Línea separadora
        doc.setDrawColor(240, 240, 240);
        doc.line(x + 3, ticketY, x + ticketWidth - 3, ticketY);

        ticketY += 5;

        // Montos principales (más prominentes)
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("Total:", x + 3, ticketY);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(formatCurrency(payment.amount), x + ticketWidth - 3, ticketY, {
          align: "right",
        });

        ticketY += 6;

        // Monto pagado (si existe)
        if (payment.paidAmount && payment.paidAmount > 0) {
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text("Pagado:", x + 3, ticketY);

          doc.setFontSize(8);
          doc.setTextColor(34, 197, 94); // Verde
          doc.text(
            formatCurrency(payment.paidAmount),
            x + ticketWidth - 3,
            ticketY,
            { align: "right" },
          );
          ticketY += 5;
        }

        // Saldo pendiente (destacado si hay)
        if (pendingAmount > 0) {
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(80, 80, 80);
          doc.text("Saldo:", x + 3, ticketY);

          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(239, 68, 68); // Rojo
          doc.text(
            formatCurrency(pendingAmount),
            x + ticketWidth - 3,
            ticketY,
            { align: "right" },
          );
          ticketY += 6;
        } else {
          ticketY += 1;
        }

        // Línea separadora
        doc.setDrawColor(240, 240, 240);
        doc.line(x + 3, ticketY, x + ticketWidth - 3, ticketY);

        ticketY += 4;

        // Estado del pago (badge)
        const statusColors: Record<string, [number, number, number]> = {
          pending: [254, 243, 199], // Amarillo claro
          partial: [219, 234, 254], // Azul claro
          paid: [220, 252, 231], // Verde claro
          cancelled: [254, 226, 226], // Rojo claro
        };

        const statusTextColors: Record<string, [number, number, number]> = {
          pending: [146, 64, 14], // Amarillo oscuro
          partial: [30, 64, 175], // Azul oscuro
          paid: [21, 128, 61], // Verde oscuro
          cancelled: [153, 27, 27], // Rojo oscuro
        };

        const statusColor = statusColors[payment.status] || [243, 244, 246];
        const statusTextColor = statusTextColors[payment.status] || [
          75, 85, 99,
        ];

        doc.setFillColor(...statusColor);
        const badgeWidth = 35;
        const badgeHeight = 5;
        doc.roundedRect(x + 3, ticketY - 3, badgeWidth, badgeHeight, 1, 1, "F");

        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...statusTextColor);
        doc.text(
          getStatusLabel(payment.status),
          x + 3 + badgeWidth / 2,
          ticketY + 0.5,
          { align: "center" },
        );

        // ID de cuota (pequeño)
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(`ID: ${payment.id}`, x + ticketWidth - 3, ticketY + 0.5, {
          align: "right",
        });

        ticketY += 6;

        // Footer con nota
        doc.setFontSize(5.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(120, 120, 120);
        const footerText = "Presentar en secretaría para realizar el pago";
        doc.text(footerText, x + ticketWidth / 2, ticketY, { align: "center" });

        // Marca de agua diagonal opcional
        doc.setTextColor(240, 240, 240);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        const watermarkText = "CLUB";
        doc.text(watermarkText, x + ticketWidth / 2, y + ticketHeight / 2 + 5, {
          align: "center",
          angle: 45,
        });

        doc.setTextColor(0, 0, 0);
      };

      // Dibujar todos los tickets
      let ticketIndex = 0;

      for (const payment of options.payments) {
        // const pageIndex = Math.floor(ticketIndex / ticketsPerPage);
        const indexInPage = ticketIndex % ticketsPerPage;

        // Agregar nueva página si es necesario (excepto para el primer ticket)
        if (ticketIndex > 0 && indexInPage === 0) {
          doc.addPage();
        }

        const row = Math.floor(indexInPage / ticketsPerRow);
        const col = indexInPage % ticketsPerRow;

        const x = marginLeft + col * (ticketWidth + spacingX);
        const y = marginTop + row * (ticketHeight + spacingY);

        drawTicket(payment, x, y);
        ticketIndex++;
      }

      // Guardar el PDF
      const fileName = `cuotas-${getMonthName(options.generationMonth)}-${options.generationYear}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError(err instanceof Error ? err.message : "Error al generar el PDF");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePdf,
    isGenerating,
    error,
  };
};
