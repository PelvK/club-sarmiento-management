import { useState } from "react";
import { Payment } from "../lib/types";
import { CONSOLE_LOG } from "../lib/utils/consts";

interface GeneratePdfOptions {
  payments: Payment[];
  generationId: string;
  generationMonth: number;
  generationYear: number;
}

// ========== CONSTANTES DE CONFIGURACIÓN ==========
const PDF_CONFIG = {
  // Fuentes
  FONT_FAMILY: "helvetica",

  // Tamaños de fuente
  FONT_SIZE_HEADER_TITLE: 10,
  FONT_SIZE_HEADER_SUBTITLE: 8,
  FONT_SIZE_SECTION_LABEL: 8,
  FONT_SIZE_SECTION_DATA: 8,
  FONT_SIZE_CONCEPT_LABEL: 6,
  FONT_SIZE_CONCEPT_ITEM: 6,
  FONT_SIZE_TOTAL_LABEL: 8,

  // Colores RGB
  COLOR_HEADER_BG: [255, 215, 0] as [number, number, number],
  COLOR_BORDER: [200, 200, 200] as [number, number, number],
  COLOR_SEPARATOR: [230, 230, 230] as [number, number, number],
  COLOR_TEXT_DARK: [0, 0, 0] as [number, number, number],
  COLOR_TEXT_LIGHT: [60, 60, 60] as [number, number, number],

  // Dimensiones del ticket
  TICKET_WIDTH: 95,
  TICKET_HEIGHT: 62,
  MARGIN_LEFT: 5,
  MARGIN_TOP: 10,
  SPACING_Y: 0,
  BOTTOM_MARGIN: 10, // Margen inferior para no cortar

  // Espacios internos
  CONTENT_PADDING: 3,
  LINE_HEIGHT: 4,
};

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

        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        doc.setFontSize(PDF_CONFIG.FONT_SIZE_CONCEPT_ITEM);

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

        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text(priceText, x + maxWidth, y, { align: "right" });
      };

      const monthName = getMonthName(options.generationMonth);
      const year = options.generationYear;

      // ========== TICKETS DUPLICADOS (1 columna x 2 copias por renglon) ==========
      const ticketsPerPage = 5; // 5 renglones de 2 tickets cada uno

      const drawTicket = (payment: Payment, x: number, y: number) => {
        const memberId = payment.member?.id || "N/A";
        const memberName = payment.member?.id
          ? `${payment.member.name} ${payment.member.second_name}`.trim()
          : "";
        const memberAddress = payment.member?.address || "";

        const isSocietary = payment.type === "societary-only";
        const sportName = payment.sport?.name;

        // ====== CONTENEDOR ======
        doc.setDrawColor(...PDF_CONFIG.COLOR_BORDER);
        doc.setLineWidth(0.3);
        doc.rect(x, y, PDF_CONFIG.TICKET_WIDTH, PDF_CONFIG.TICKET_HEIGHT);

        // ====== HEADER ======
        doc.setFillColor(...PDF_CONFIG.COLOR_HEADER_BG);
        doc.rect(x, y, PDF_CONFIG.TICKET_WIDTH, 8, "F");

        doc.setFontSize(PDF_CONFIG.FONT_SIZE_HEADER_TITLE);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);
        doc.text(
          "Club Atlético Sarmiento",
          x + PDF_CONFIG.TICKET_WIDTH / 2,
          y + 3.5,
          {
            align: "center",
          },
        );

        doc.setFontSize(PDF_CONFIG.FONT_SIZE_HEADER_SUBTITLE);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);
        doc.text(
          "25 de mayo 1585 - Humboldt - Santa Fé",
          x + PDF_CONFIG.TICKET_WIDTH / 2,
          y + 6.5,
          {
            align: "center",
          },
        );

        let ticketY = y + 12;

        // ====== SOCIO & NOMBRE (en la misma línea) ======
        doc.setFontSize(PDF_CONFIG.FONT_SIZE_SECTION_LABEL);
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);

        // Nombre Label (negrita) + valor (normal)
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Nombre:", x + PDF_CONFIG.CONTENT_PADDING, ticketY);

        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const nombreLabelWidth = doc.getTextWidth("Nombre:  ");
        const truncatedName =
          memberName.length > 20
            ? memberName.substring(0, 20) + "..."
            : memberName;
        doc.text(truncatedName, x + PDF_CONFIG.CONTENT_PADDING + nombreLabelWidth, ticketY);

        // Socio Label (negrita) + ID (normal)
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Socio: #", x + PDF_CONFIG.CONTENT_PADDING + 70, ticketY);

        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const socioIdWidth = doc.getTextWidth("Socio: # ");
        doc.text(
          String(memberId),
          x + PDF_CONFIG.CONTENT_PADDING + 70 + socioIdWidth,
          ticketY,
        );

        ticketY += PDF_CONFIG.LINE_HEIGHT + 1;

        // ====== DIRECCIÓN ======
        doc.setFontSize(PDF_CONFIG.FONT_SIZE_SECTION_LABEL);
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);

        // Dirección Label (negrita) + valor (normal)
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Dirección: ", x + PDF_CONFIG.CONTENT_PADDING, ticketY);

        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const dirLabelWidth = doc.getTextWidth("Dirección:  ");
        const truncatedAddress =
          memberAddress.length > 35
            ? memberAddress.substring(0, 35) + "..."
            : memberAddress;
        doc.text(
          truncatedAddress,
          x + PDF_CONFIG.CONTENT_PADDING + dirLabelWidth,
          ticketY,
        );

        ticketY += PDF_CONFIG.LINE_HEIGHT + 1;

        // ====== TIPO DE CUOTA ======
        doc.setFontSize(PDF_CONFIG.FONT_SIZE_SECTION_LABEL);
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);

        // Tipo Label (negrita) + valor (normal)
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Tipo: ", x + PDF_CONFIG.CONTENT_PADDING, ticketY);

        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const tipoLabelWidth = doc.getTextWidth("Tipo:  ");
        const tipoText = isSocietary
          ? "Societaria"
          : `Deportiva${sportName ? ` - ${sportName}` : ""}`;
        doc.text(
          tipoText,
          x + PDF_CONFIG.CONTENT_PADDING + tipoLabelWidth,
          ticketY,
        );

        ticketY += 4;

        // Línea separadora
        doc.setDrawColor(...PDF_CONFIG.COLOR_SEPARATOR);
        doc.line(
          x + PDF_CONFIG.CONTENT_PADDING,
          ticketY,
          x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING,
          ticketY,
        );
        ticketY += 4;

        // ====== DESGLOSE ======
        doc.setFontSize(PDF_CONFIG.FONT_SIZE_CONCEPT_LABEL);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);
        doc.text("CONCEPTOS:", x + PDF_CONFIG.CONTENT_PADDING, ticketY);
        ticketY += PDF_CONFIG.LINE_HEIGHT;

        const maxContentY = y + PDF_CONFIG.TICKET_HEIGHT - 12; // espacio reservado para total

        if (payment.breakdown && payment.breakdown.length > 0) {
          for (const item of payment.breakdown) {
            if (ticketY > maxContentY) break;

            doc.setFontSize(PDF_CONFIG.FONT_SIZE_CONCEPT_ITEM);
            doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_LIGHT);

            const concept = item.description
              ? item.description.length > 25
                ? item.description.substring(0, 25) + "..."
                : item.description
              : item.concept?.length > 25
                ? item.concept.substring(0, 25) + "..."
                : item.concept;

            const conceptSecondPart = item.memberId != payment.member?.id ? ` (de ${item.memberName})` : "";

            drawDottedLineText(
              `• ${concept}${conceptSecondPart}`,
              item.amount,
              x + 5,
              ticketY,
              PDF_CONFIG.TICKET_WIDTH - 10,
            );

            ticketY += PDF_CONFIG.LINE_HEIGHT;
          }
        }

        // ====== TOTAL CON MES Y AÑO ======
        ticketY = y + PDF_CONFIG.TICKET_HEIGHT - 5;

        doc.setDrawColor(...PDF_CONFIG.COLOR_BORDER);
        doc.line(
          x + PDF_CONFIG.CONTENT_PADDING,
          ticketY - 4,
          x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING,
          ticketY - 4,
        );

        doc.setFontSize(PDF_CONFIG.FONT_SIZE_TOTAL_LABEL);
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);

        // Izquierda: Mes (label negrita + valor normal)
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Mes: ", x + PDF_CONFIG.CONTENT_PADDING, ticketY);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const mesLabelWidth = doc.getTextWidth("Mes:  ");
        doc.text(
          monthName,
          x + PDF_CONFIG.CONTENT_PADDING + mesLabelWidth,
          ticketY,
        );

        // Centro: Año (label negrita + valor normal)
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Año: ", x + 40, ticketY);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const anoLabelWidth = doc.getTextWidth("Año:  ");
        doc.text(String(year), x + 40 + anoLabelWidth, ticketY);

        // Derecha: Total (label negrita + monto negrita)
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        const totalLabel = "Total: ";
        const totalAmount = formatCurrency(payment.amount);
        const totalText = totalLabel + totalAmount;
        doc.text(
          totalText,
          x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING,
          ticketY,
          { align: "right" },
        );
      };

      // Dibujar todos los tickets - 2 copias por renglon (se tocan en el borde)
      let ticketIndex = 0;
      const pageHeight = doc.internal.pageSize.getHeight();

      for (const payment of options.payments) {
        const indexInPage = ticketIndex % ticketsPerPage;

        // Calcular la posición Y donde se dibujaría este ticket
        const row = indexInPage;
        const ticketY =
          PDF_CONFIG.MARGIN_TOP +
          row * (PDF_CONFIG.TICKET_HEIGHT + PDF_CONFIG.SPACING_Y);

        // Verificar si el ticket cabe en la página actual
        // Necesitamos espacio para: ticket completo + margen inferior
        const ticketBottomEdge = ticketY + PDF_CONFIG.TICKET_HEIGHT + PDF_CONFIG.BOTTOM_MARGIN;

        const needsNewPage = ticketIndex > 0 && ticketBottomEdge > pageHeight;

        // Agregar nueva página si es necesario
        if (needsNewPage) {
          doc.addPage();
          // Reiniciar para que el ticket se dibuje en la primera posición de la nueva página
          const newRow = 0;
          const newTicketY =
            PDF_CONFIG.MARGIN_TOP +
            newRow * (PDF_CONFIG.TICKET_HEIGHT + PDF_CONFIG.SPACING_Y);

          // Primera copia (izquierda)
          const x1 = PDF_CONFIG.MARGIN_LEFT;
          drawTicket(payment, x1, newTicketY);

          // Segunda copia (derecha, tocando el borde izquierdo)
          const x2 = PDF_CONFIG.MARGIN_LEFT + PDF_CONFIG.TICKET_WIDTH;
          drawTicket(payment, x2, newTicketY);

          // Actualizar el índice como si hubiéramos avanzado una página completa
          ticketIndex = (Math.floor(ticketIndex / ticketsPerPage) + 1) * ticketsPerPage;
        } else {
          // Primera copia (izquierda)
          const x1 = PDF_CONFIG.MARGIN_LEFT;
          drawTicket(payment, x1, ticketY);

          // Segunda copia (derecha, tocando el borde izquierdo)
          const x2 = PDF_CONFIG.MARGIN_LEFT + PDF_CONFIG.TICKET_WIDTH;
          drawTicket(payment, x2, ticketY);

          ticketIndex++;
        }
      }

      // Guardar el PDF
      const fileName = `cuotas-${monthName}-${year}.pdf`;
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