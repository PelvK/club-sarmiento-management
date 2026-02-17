import { useState } from "react";
import { Payment } from "../lib/types";
import { CONSOLE_LOG } from "../lib/utils/consts";

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
    if (CONSOLE_LOG) {
      console.log("Generating PDF with options:", options);
    }

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

      const drawDottedLineText = (
        concept: string,
        amount: number,
        x: number,
        y: number,
        maxWidth: number,
      ) => {
        const priceText = formatCurrency(amount);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);

        const conceptWidth = doc.getTextWidth(concept);
        const priceWidth = doc.getTextWidth(priceText);

        const availableWidth = maxWidth - conceptWidth - priceWidth - 4;

        let dots = "";
        let dotsWidth = 0;

        while (dotsWidth < availableWidth) {
          dots += ".";
          dotsWidth = doc.getTextWidth(dots);
        }

        const finalText = `${concept} ${dots}`;

        doc.text(finalText, x, y);

        doc.setFont("helvetica", "bold");
        doc.text(priceText, x + maxWidth, y, { align: "right" });
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

            const period = `${getMonthName(options.generationMonth)} ${options.generationYear}`;

      // ========== TICKETS COMPACTOS (2 columnas x 5 filas = 10 por página) ==========

      // Configuración del layout
      const ticketWidth = 95;
      const ticketHeight = 56;
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

        const isSocietary = payment.type === "societary-only";
        const sportName = payment.sport?.name;

        // ====== CONTENEDOR ======
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(x, y, ticketWidth, ticketHeight);

        // ====== HEADER ======
        doc.setFillColor(255, 215, 0);
        doc.rect(x, y, ticketWidth, 8, "F");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("CUOTA MENSUAL" + " - " + period, x + ticketWidth / 2, y + 5.5, {
          align: "center",
        });

        let ticketY = y + 12;

        // ====== SOCIO ======
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(90, 90, 90);
        doc.text("SOCIO:", x + 3, ticketY);

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const truncatedName =
          memberName.length > 30
            ? memberName.substring(0, 30) + "..."
            : memberName;

        doc.text(truncatedName, x + 15, ticketY);

        ticketY += 5;

        // ====== TIPO DE CUOTA ======
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);

        if (isSocietary) {
          doc.text("Tipo: Societaria", x + 3, ticketY);
        } else {
          doc.text(
            `Tipo: Deportiva${sportName ? ` - ${sportName}` : ""}`,
            x + 3,
            ticketY,
          );
        }

        ticketY += 6;

        // Línea separadora
        doc.setDrawColor(230, 230, 230);
        doc.line(x + 3, ticketY, x + ticketWidth - 3, ticketY);
        ticketY += 4;

        // ====== DESGLOSE ======
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("CONCEPTOS:", x + 3, ticketY);
        ticketY += 4;

        const maxContentY = y + ticketHeight - 10; // espacio reservado para total

        if (payment.breakdown && payment.breakdown.length > 0) {
          for (const item of payment.breakdown) {
            if (ticketY > maxContentY) break; // evitar solapamiento

            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60);

            const concept =
              item.description ? 
              item.description.length > 25
                ? item.description.substring(0, 25) + "..."
                : item.description
              :  item.concept?.length > 25
                ? item.concept.substring(0, 25) + "..."
                : item.concept;

            drawDottedLineText(
              `• ${concept}`,
              item.amount,
              x + 5,
              ticketY,
              ticketWidth - 10,
            );

            ticketY += 4;
          }
        }

        // ====== TOTAL ======
        ticketY = y + ticketHeight - 5;

        doc.setDrawColor(200, 200, 200);
        doc.line(x + 3, ticketY - 4, x + ticketWidth - 3, ticketY - 4);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("TOTAL:", x + 3, ticketY);

        doc.setFontSize(10);
        doc.text(formatCurrency(payment.amount), x + ticketWidth - 3, ticketY, {
          align: "right",
        });
      };

      // Dibujar todos los tickets - empezando desde la primera página
      let ticketIndex = 0;

      for (const payment of options.payments) {
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
