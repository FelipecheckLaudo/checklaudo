/**
 * Lazy-loaded PDF export functionality
 * Only loads heavy dependencies (jsPDF, autoTable) when actually needed
 */
import type { Vistoria } from "./types";

export async function exportVistoriasToPDF(vistorias: Vistoria[]) {
  // Dynamically import heavy dependencies only when needed
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);

  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [124, 58, 237];
  const textColor: [number, number, number] = [31, 41, 55];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE VISTORIAS", 105, 20, { align: "center" });

  // Stats
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.text(`Total: ${vistorias.length}`, 14, 50);

  // Table data
  const tableData = vistorias.map((v) => [
    new Date(v.criadoEm || v.created_at || "").toLocaleDateString("pt-BR"),
    v.placa,
    v.modelo,
    v.clienteNome || v.cliente_nome,
    parseFloat(v.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    v.pagamento,
    v.situacao
  ]);

  // Create table
  autoTable(doc, {
    startY: 60,
    head: [["Data", "Placa", "Modelo", "Cliente", "Valor", "Pagamento", "Situação"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: "bold" },
    bodyStyles: { fontSize: 9, textColor }
  });

  // Save
  doc.save(`vistorias_${new Date().toISOString().split("T")[0]}.pdf`);
}
