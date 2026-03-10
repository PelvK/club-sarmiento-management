import React, { useState, useMemo } from "react";
import { X, FileText, Download, Calendar } from "lucide-react";
import { Member } from "../../../../lib/types/member";
import { Sport } from "../../../../lib/types/sport";
import { AppButton } from "../../../common/AppButton/component";
import { useAuth } from "../../../../hooks/useAuth";
import { paymentsApi } from "../../../../lib/api/payments";
import { Payment } from "../../../../lib/types/payment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CONSOLE_LOG } from "../../../../lib/utils/consts";
import "./styles.css";

interface MemberReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  sports: Sport[];
}

interface PropertyToggle {
  dni: boolean;
  name: boolean;
  second_name: boolean;
  birthdate: boolean;
  phone_number: boolean;
  email: boolean;
  address: boolean;
  familyStatus: boolean;
}

interface MonthYear {
  month: number;
  year: number;
}

const PROPERTY_LABELS: { key: keyof PropertyToggle; label: string }[] = [
  { key: "dni",          label: "DNI" },
  { key: "name",         label: "Nombre" },
  { key: "second_name",  label: "Apellido" },
  { key: "birthdate",    label: "F. Nacimiento" },
  { key: "phone_number", label: "Teléfono" },
  { key: "email",        label: "Email" },
  { key: "address",      label: "Dirección" },
  { key: "familyStatus", label: "Estado Familiar" },
];

const PDF_PROPERTY_LABELS: Record<keyof PropertyToggle, string> = {
  dni:          "DNI",
  name:         "Nombre",
  second_name:  "Apellido",
  birthdate:    "Fecha Nac.",
  phone_number: "Teléfono",
  email:        "Email",
  address:      "Dirección",
  familyStatus: "Estado Familiar",
};

const STATUS_COLORS = {
  paid:      [198, 239, 206] as [number, number, number],
  pending:   [255, 217, 170] as [number, number, number],
  cancelled: [255, 199, 199] as [number, number, number],
};

const LEGEND_ITEMS = [
  { label: "Pago",      color: "rgb(198,239,206)" },
  { label: "Pendiente", color: "rgb(255,217,170)" },
  { label: "Cancelado", color: "rgb(255,199,199)" },
];

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export const MemberReportModal: React.FC<MemberReportModalProps> = ({
  isOpen,
  onClose,
  members,
  sports,
}) => {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [properties, setProperties] = useState<PropertyToggle>({
    dni: true,
    name: true,
    second_name: true,
    birthdate: false,
    phone_number: false,
    email: false,
    address: false,
    familyStatus: false,
  });
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [startYear,  setStartYear]  = useState(new Date().getFullYear());
  const [endMonth,   setEndMonth]   = useState(new Date().getMonth() + 1);
  const [endYear,    setEndYear]    = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const availableSports = useMemo(() => {
    if (user?.is_admin) return sports;
    return sports.filter((sport) =>
      user?.sport_supported?.some((s) => Number(s.id) === Number(sport.id))
    );
  }, [sports, user]);

  const filteredMembers = useMemo(() => {
    if (!selectedSport) return [];
    return members.filter((member) =>
      member.sports?.some((sport) => Number(sport.id) === Number(selectedSport))
    );
  }, [members, selectedSport]);

  const monthsInRange = useMemo(() => {
    const months: MonthYear[] = [];
    const cur = new Date(startYear, startMonth - 1, 1);
    const end = new Date(endYear,   endMonth   - 1, 1);
    while (cur <= end) {
      months.push({ month: cur.getMonth() + 1, year: cur.getFullYear() });
      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }, [startMonth, startYear, endMonth, endYear]);

  const toggleProperty = (prop: keyof PropertyToggle) =>
    setProperties((prev) => ({ ...prev, [prop]: !prev[prop] }));

  const getMonthName = (month: number) => MONTH_NAMES[month - 1];

  const getFamilyStatusText = (member: Member) =>
    member.familyHeadId ? "Adherente" : "Titular";

  const generatePDF = async () => {
    if (!selectedSport || filteredMembers.length === 0) return;
    setIsGenerating(true);

    try {
      const allPayments: Payment[] = await paymentsApi.getAll();
      const sportName = sports.find((s) => Number(s.id) === Number(selectedSport))?.name ?? "Disciplina";

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Reporte de Miembros - ${sportName}`, 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Periodo: ${getMonthName(startMonth)} ${startYear} - ${getMonthName(endMonth)} ${endYear}`, 14, 22);
      doc.text(`Generado: ${new Date().toLocaleDateString("es-AR")}`, 14, 27);

      const personalColCount = Object.values(properties).filter(Boolean).length;

      const headers: string[] = [];
      Object.entries(properties).forEach(([key, value]) => {
        if (value) headers.push(PDF_PROPERTY_LABELS[key as keyof PropertyToggle]);
      });
      monthsInRange.forEach(({ month, year }) => {
        headers.push(`${getMonthName(month).substring(0, 3)}\n${year}`);
      });

      const cellFills: Record<number, Record<number, [number, number, number]>> = {};

      const rows = filteredMembers.map((member, memberIndex) => {
        const row: string[] = [];

        if (properties.dni)          row.push(member.dni);
        if (properties.name)         row.push(member.name);
        if (properties.second_name)  row.push(member.second_name);
        if (properties.birthdate)    row.push(member.birthdate ? new Date(member.birthdate).toLocaleDateString("es-AR") : "-");
        if (properties.phone_number) row.push(member.phone_number || "-");
        if (properties.email)        row.push(member.email || "-");
        if (properties.address)      row.push(member.address || "-");
        if (properties.familyStatus) row.push(getFamilyStatusText(member));

        if (CONSOLE_LOG) {
          console.log(`Processing member ${member.name} ${member.second_name}:`, member);
          console.log("Payments:", allPayments.filter(p => Number(p.member.id) === Number(member.id)));
        }

        monthsInRange.forEach(({ month, year }, monthIndex) => {
          const payment = allPayments.find(
            (p) => Number(p.member.id) === Number(member.id) && p.month === month && p.year === year
          );
          const colIndex = personalColCount + monthIndex;

          if (!payment) {
            row.push("No Gen.");
          } else if (payment.status === "paid") {
            row.push("Pago");
            if (!cellFills[memberIndex]) cellFills[memberIndex] = {};
            cellFills[memberIndex][colIndex] = STATUS_COLORS.paid;
          } else if (payment.status === "pending") {
            row.push("Pend.");
            if (!cellFills[memberIndex]) cellFills[memberIndex] = {};
            cellFills[memberIndex][colIndex] = STATUS_COLORS.pending;
          } else if (payment.status === "cancelled") {
            row.push("Cancel.");
            if (!cellFills[memberIndex]) cellFills[memberIndex] = {};
            cellFills[memberIndex][colIndex] = STATUS_COLORS.cancelled;
          } else {
            row.push("-");
          }
        });

        return row;
      });

      const MONTH_COL_WIDTH = 14;
      const columnStyles: Record<number, object> = {};
      for (let i = 0; i < personalColCount; i++)       columnStyles[i] = { cellWidth: "auto" };
      for (let i = personalColCount; i < headers.length; i++) columnStyles[i] = { cellWidth: MONTH_COL_WIDTH, halign: "center" };

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 32,
        styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
        headStyles: {
          fillColor: [26, 26, 26],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
          minCellHeight: 10,
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
        tableWidth: "auto",
        columnStyles,
        didParseCell: (data) => {
          if (data.section !== "body") return;
          const fill = cellFills[data.row.index]?.[data.column.index];
          if (fill) {
            data.cell.styles.fillColor = fill;
            data.cell.styles.textColor = [30, 30, 30];
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      doc.save(`reporte-miembros-${sportName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el reporte. Por favor intenta nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const canGenerate = selectedSport !== null && filteredMembers.length > 0 && monthsInRange.length > 0;

  return (
    <div className="report-modal-overlay">
      <div className="report-modal-content">

        {/* ── Header ── */}
        <div className="report-modal-header">
          <div className="report-modal-header-left">
            <FileText className="report-modal-header-icon" />
            <h2 className="report-modal-title">Generar Reporte de Miembros</h2>
          </div>
          <button onClick={onClose} className="report-modal-close-btn" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="report-modal-body">

          {/* Disciplina */}
          <div className="section-card">
            <div className="section-header">
              <FileText className="section-icon" />
              <h3 className="section-title">Seleccionar Disciplina</h3>
            </div>
            <select
              value={selectedSport ?? ""}
              onChange={(e) => setSelectedSport(Number(e.target.value))}
              className="report-form-select"
            >
              <option value="">Seleccione una disciplina</option>
              {availableSports.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.name}</option>
              ))}
            </select>
            {selectedSport && (
              <p className="report-helper-text">
                Miembros encontrados: <strong>{filteredMembers.length}</strong>
              </p>
            )}
          </div>

          {/* Propiedades */}
          <div className="section-card">
            <div className="section-header">
              <FileText className="section-icon" />
              <h3 className="section-title">Propiedades a Mostrar</h3>
            </div>

            <div className="properties-grid">
              {PROPERTY_LABELS.map(({ key, label }) => (
                <div key={key} className="toggle-item">
                  <div className="toggle-label">
                    <span className="toggle-label-text">{label}</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={properties[key]}
                      onChange={() => toggleProperty(key)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>

            {/* Leyenda PDF */}
            <div className="report-legend">
              <span className="report-legend-label">Estados en PDF:</span>
              {LEGEND_ITEMS.map(({ label, color }) => (
                <span key={label} className="report-legend-item">
                  <span className="report-legend-dot" style={{ backgroundColor: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Rango de meses */}
          <div className="section-card">
            <div className="section-header">
              <Calendar className="section-icon" />
              <h3 className="section-title">Rango de Meses</h3>
            </div>

            <div className="report-date-grid">
              {/* Desde */}
              <div>
                <label className="report-form-label">Desde</label>
                <div className="report-date-row">
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(Number(e.target.value))}
                    className="report-form-select"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </select>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="report-form-select-sm"
                  >
                    {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Hasta */}
              <div>
                <label className="report-form-label">Hasta</label>
                <div className="report-date-row">
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(Number(e.target.value))}
                    className="report-form-select"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </select>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="report-form-select-sm"
                  >
                    {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {monthsInRange.length > 0 && (
              <p className="report-helper-text">
                Meses seleccionados: <strong>{monthsInRange.length}</strong>
              </p>
            )}
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="report-modal-footer">
          <AppButton onClick={onClose} label="Cancelar" variant="secondary" />
          <AppButton
            onClick={generatePDF}
            label={isGenerating ? "Generando..." : "Generar PDF"}
            startIcon={<Download className="w-5 h-5" />}
            disabled={!canGenerate || isGenerating}
          />
        </div>

      </div>
    </div>
  );
};