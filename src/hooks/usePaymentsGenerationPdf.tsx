import { useState } from "react";
import { Payment } from "../lib/types";
import { CustomAddition } from "../lib/types/quote";
import { CONSOLE_LOG } from "../lib/utils/consts";

interface GeneratePdfOptions {
  payments: Payment[];
  generationId: string;
  generationMonth: number;
  generationYear: number;
  customAdditions?: CustomAddition[]; // <-- NUEVO
}

// ========== CONSTANTES DE CONFIGURACIÓN ==========
const PDF_CONFIG = {
  FONT_FAMILY: "helvetica",

  FONT_SIZE_HEADER_TITLE: 10,
  FONT_SIZE_HEADER_SUBTITLE: 8,
  FONT_SIZE_SECTION_LABEL: 8,
  FONT_SIZE_SECTION_DATA: 8,
  FONT_SIZE_CONCEPT_LABEL: 6,
  FONT_SIZE_CONCEPT_ITEM: 6,
  FONT_SIZE_TOTAL_LABEL: 8,

  COLOR_HEADER_BG: [255, 215, 0] as [number, number, number],
  COLOR_BORDER: [200, 200, 200] as [number, number, number],
  COLOR_SEPARATOR: [230, 230, 230] as [number, number, number],
  COLOR_TEXT_DARK: [0, 0, 0] as [number, number, number],
  COLOR_TEXT_LIGHT: [60, 60, 60] as [number, number, number],
  COLOR_ORANGE: [220, 100, 0] as [number, number, number], // para vencimiento

  TICKET_WIDTH: 95,
  TICKET_HEIGHT: 70, // un poco más alto para acomodar Total 1 / Total 2
  MARGIN_LEFT: 5,
  MARGIN_TOP: 10,
  SPACING_Y: 0,
  BOTTOM_MARGIN: 10,

  CONTENT_PADDING: 3,
  LINE_HEIGHT: 4,
};

export const usePaymentTicketPdf = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const writeMemberId = false; // Cambiar a true para mostrar ID de socio en el ticket

  const generatePdf = async (options: GeneratePdfOptions) => {
    setIsGenerating(true);
    setError(null);
    if (CONSOLE_LOG) {
      console.log("Generating PDF with options:", options);
    }

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const customAdditions = options.customAdditions ?? [];
      const normalAdditions = customAdditions.filter((a) => a.type === "NORMAL");
      const vencimientoAdditions = customAdditions.filter(
        (a) => a.type === "VENCIMIENTO"
      );
      const hasVencimiento = vencimientoAdditions.length > 0;
      const vencimientoTotal = vencimientoAdditions.reduce(
        (sum, a) => sum + a.amount,
        0
      );
      const normalAdditionsTotal = normalAdditions.reduce(
        (sum, a) => sum + a.amount,
        0
      );

      const getMonthName = (month: number): string => {
        const months = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
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
        bold = false,
        color?: [number, number, number]
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

        if (color) {
          doc.setTextColor(...color);
        } else {
          doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_LIGHT);
        }

        doc.text(`${concept} ${dots}`, x, y);

        doc.setFont(PDF_CONFIG.FONT_FAMILY, bold ? "bold" : "normal");
        if (color) {
          doc.setTextColor(...color);
        } else {
          doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);
        }
        doc.text(priceText, x + maxWidth, y, { align: "right" });

        // Reset
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);
      };

      const monthName = getMonthName(options.generationMonth);
      const year = options.generationYear;

      const drawTicket = (payment: Payment, x: number, y: number) => {
        const memberId = payment.member?.id || "N/A";
        const memberName = payment.member?.id
          ? `${payment.member.name} ${payment.member.second_name}`.trim()
          : "";
        const memberAddress = payment.member?.address || "";

        const isSocietary = payment.type === "societary-only";
        const sportName = payment.sport?.name;

        // Monto base de la cuota + agregados normales
        const baseTotal = payment.amount + normalAdditionsTotal;
        // Monto con vencimiento
        const totalWithVencimiento = baseTotal + vencimientoTotal;

        // Calcular altura dinámica del ticket
        const ticketH = hasVencimiento
          ? PDF_CONFIG.TICKET_HEIGHT + 6
          : PDF_CONFIG.TICKET_HEIGHT;

        // ====== CONTENEDOR ======
        doc.setDrawColor(...PDF_CONFIG.COLOR_BORDER);
        doc.setLineWidth(0.3);
        doc.rect(x, y, PDF_CONFIG.TICKET_WIDTH, ticketH);

        // ====== HEADER ======
        doc.setFillColor(...PDF_CONFIG.COLOR_HEADER_BG);
        doc.rect(x, y, PDF_CONFIG.TICKET_WIDTH, 8, "F");

        doc.setFontSize(PDF_CONFIG.FONT_SIZE_HEADER_TITLE);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);
        doc.text("Club Atlético Sarmiento", x + PDF_CONFIG.TICKET_WIDTH / 2, y + 3.5, { align: "center" });

        doc.setFontSize(PDF_CONFIG.FONT_SIZE_HEADER_SUBTITLE);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        doc.text("25 de mayo 1585 - Humboldt - Santa Fe", x + PDF_CONFIG.TICKET_WIDTH / 2, y + 6.5, { align: "center" });

        let ticketY = y + 12;

        // ====== NOMBRE ======
        doc.setFontSize(PDF_CONFIG.FONT_SIZE_SECTION_LABEL);
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);

        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Nombre:", x + PDF_CONFIG.CONTENT_PADDING, ticketY);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const nombreLabelWidth = doc.getTextWidth("Nombre:  ");
        const truncatedName =
          memberName.length > 40
            ? memberName.substring(0, 40) + "..."
            : memberName;
        doc.text(
          truncatedName,
          x + PDF_CONFIG.CONTENT_PADDING + nombreLabelWidth,
          ticketY,
        );

        if (writeMemberId) {
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
        }

        ticketY += PDF_CONFIG.LINE_HEIGHT + 1;

        // ====== DIRECCIÓN ======
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Dirección: ", x + PDF_CONFIG.CONTENT_PADDING, ticketY);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const dirLabelWidth = doc.getTextWidth("Dirección:  ");
        const truncatedAddress =
          memberAddress.length > 40
            ? memberAddress.substring(0, 40) + "..."
            : memberAddress;
        doc.text(
          truncatedAddress,
          x + PDF_CONFIG.CONTENT_PADDING + dirLabelWidth,
          ticketY,
        );

        ticketY += PDF_CONFIG.LINE_HEIGHT + 1;

        // ====== TIPO ======
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.text("Tipo: ", x + PDF_CONFIG.CONTENT_PADDING, ticketY);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
        const tipoLabelWidth = doc.getTextWidth("Tipo:  ");
        const tipoText = isSocietary ? "Societaria" : `Deportiva${sportName ? ` - ${sportName}` : ""}`;
        doc.text(tipoText, x + PDF_CONFIG.CONTENT_PADDING + tipoLabelWidth, ticketY);

        ticketY += 4;

        // Línea separadora
        doc.setDrawColor(...PDF_CONFIG.COLOR_SEPARATOR);
        doc.line(x + PDF_CONFIG.CONTENT_PADDING, ticketY, x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING, ticketY);
        ticketY += 4;

        // ====== DESGLOSE ======
        doc.setFontSize(PDF_CONFIG.FONT_SIZE_CONCEPT_LABEL);
        doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);
        doc.text("CONCEPTOS:", x + PDF_CONFIG.CONTENT_PADDING, ticketY);
        ticketY += PDF_CONFIG.LINE_HEIGHT;

        // Reservar espacio para totales al pie
        const footerHeight = hasVencimiento ? 18 : 10;
        const maxContentY = y + ticketH - footerHeight;

        // Conceptos de la cuota
        if (payment.breakdown && payment.breakdown.length > 0) {
          for (const item of payment.breakdown) {
            if (ticketY > maxContentY) break;

            const concept = item.description
              ? item.description.length > 35 ? item.description.substring(0, 35) + "..." : item.description
              : item.concept?.length > 35 ? item.concept.substring(0, 35) + "..." : item.concept;

            const conceptSecondPart =
              item.memberId != payment.member?.id
                ? ` (de ${item.memberName})`
                : "";

            drawDottedLineText(
              `• ${concept}${conceptSecondPart}`,
              item.amount,
              x + 5,
              ticketY,
              PDF_CONFIG.TICKET_WIDTH - 10
            );

            ticketY += PDF_CONFIG.LINE_HEIGHT;
          }
        }

        // Agregados NORMAL
        for (const addition of normalAdditions) {
          if (ticketY > maxContentY) break;
          const label = addition.description.length > 22 ? addition.description.substring(0, 22) + "..." : addition.description;
          drawDottedLineText(`• ${label}`, addition.amount, x + 5, ticketY, PDF_CONFIG.TICKET_WIDTH - 10);
          ticketY += PDF_CONFIG.LINE_HEIGHT;
        }

        // Agregados VENCIMIENTO (en naranja, como referencia)
        for (const addition of vencimientoAdditions) {
          if (ticketY > maxContentY) break;
          const label = addition.description.length > 18 ? addition.description.substring(0, 18) + "..." : addition.description;
          drawDottedLineText(
            `• ${label} (venc.)`,
            addition.amount,
            x + 5,
            ticketY,
            PDF_CONFIG.TICKET_WIDTH - 10,
            false,
            PDF_CONFIG.COLOR_ORANGE
          );
          ticketY += PDF_CONFIG.LINE_HEIGHT;
        }

        // ====== FOOTER ======
        const footerStartY = y + ticketH - footerHeight + 2;

        doc.setDrawColor(...PDF_CONFIG.COLOR_BORDER);
        doc.line(
          x + PDF_CONFIG.CONTENT_PADDING,
          footerStartY,
          x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING,
          footerStartY
        );

        doc.setFontSize(PDF_CONFIG.FONT_SIZE_TOTAL_LABEL);
        doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);

        if (hasVencimiento) {
          // Línea 1: Mes | Año | Total 1 (sin vencimiento)
          const line1Y = footerStartY + 4;
          doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
          doc.text("Mes: ", x + PDF_CONFIG.CONTENT_PADDING, line1Y);
          doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
          doc.text(monthName, x + PDF_CONFIG.CONTENT_PADDING + doc.getTextWidth("Mes:  "), line1Y);

          doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
          doc.text("Año: ", x + 35, line1Y);
          doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
          doc.text(String(year), x + 35 + doc.getTextWidth("Año:  "), line1Y);

          doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
          const t1Label = "T1: ";
          const t1Amount = formatCurrency(baseTotal);
          doc.text(t1Label + t1Amount, x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING, line1Y, { align: "right" });

          // Separador fino
          const sep2Y = line1Y + 3;
          doc.setDrawColor(...PDF_CONFIG.COLOR_SEPARATOR);
          doc.line(x + PDF_CONFIG.CONTENT_PADDING, sep2Y, x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING, sep2Y);

          // Línea 2: Total 2 (con vencimiento) — en naranja
          const line2Y = sep2Y + 4;
          doc.setTextColor(...PDF_CONFIG.COLOR_ORANGE);
          doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
          doc.text(
            `Total c/venc: ${formatCurrency(totalWithVencimiento)}`,
            x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING,
            line2Y,
            { align: "right" }
          );
          doc.setTextColor(...PDF_CONFIG.COLOR_TEXT_DARK);
        } else {
          // Footer original: Mes | Año | Total
          const lineY = footerStartY + 4;
          doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
          doc.text("Mes: ", x + PDF_CONFIG.CONTENT_PADDING, lineY);
          doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
          doc.text(monthName, x + PDF_CONFIG.CONTENT_PADDING + doc.getTextWidth("Mes:  "), lineY);

          doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
          doc.text("Año: ", x + 40, lineY);
          doc.setFont(PDF_CONFIG.FONT_FAMILY, "normal");
          doc.text(String(year), x + 40 + doc.getTextWidth("Año:  "), lineY);

          doc.setFont(PDF_CONFIG.FONT_FAMILY, "bold");
          const totalLabel = "Total: ";
          const totalAmount = formatCurrency(baseTotal);
          doc.text(totalLabel + totalAmount, x + PDF_CONFIG.TICKET_WIDTH - PDF_CONFIG.CONTENT_PADDING, lineY, { align: "right" });
        }
      };

      // ========== LOOP PRINCIPAL ==========
      const pageHeight = doc.internal.pageSize.getHeight();
      const effectiveTicketHeight = hasVencimiento
        ? PDF_CONFIG.TICKET_HEIGHT + 6
        : PDF_CONFIG.TICKET_HEIGHT;

      let currentRow = 0;
      let isFirstTicket = true;

      for (const payment of options.payments) {
        const tentativeY =
          PDF_CONFIG.MARGIN_TOP +
          currentRow * (effectiveTicketHeight + PDF_CONFIG.SPACING_Y);

        const ticketBottomEdge =
          tentativeY + effectiveTicketHeight + PDF_CONFIG.BOTTOM_MARGIN;

        const needsNewPage = !isFirstTicket && ticketBottomEdge > pageHeight;

        if (needsNewPage) {
          doc.addPage();
          currentRow = 0;
        }

        const finalY =
          PDF_CONFIG.MARGIN_TOP +
          currentRow * (effectiveTicketHeight + PDF_CONFIG.SPACING_Y);

        const x1 = PDF_CONFIG.MARGIN_LEFT;
        const x2 = PDF_CONFIG.MARGIN_LEFT + PDF_CONFIG.TICKET_WIDTH;

        drawTicket(payment, x1, finalY);
        drawTicket(payment, x2, finalY);

        currentRow++;
        isFirstTicket = false;
      }

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
