import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Vistoria } from "./database";

export const exportVistoriasToPDF = (vistorias: Vistoria[]) => {
  const doc = new jsPDF();
  
  // Configurar cores do tema
  const primaryColor: [number, number, number] = [124, 58, 237]; // roxo
  const secondaryColor: [number, number, number] = [251, 146, 60]; // laranja
  const textColor: [number, number, number] = [31, 41, 55];
  
  // Cabeçalho do documento
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE VISTORIAS", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Gerado em: ${dataAtual}`, 105, 30, { align: "center" });
  
  // Informações gerais
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.text(`Total de Vistorias: ${vistorias.length}`, 14, 50);
  
  const aprovadas = vistorias.filter(v => v.situacao === "APROVADO").length;
  const reprovadas = vistorias.filter(v => v.situacao === "REPROVADO").length;
  const conforme = vistorias.filter(v => v.situacao === "CONFORME").length;
  const naoConforme = vistorias.filter(v => v.situacao === "NÃO CONFORME").length;
  const aprovadoComApontamentos = vistorias.filter(v => v.situacao === "APROVADO COM APONTAMENTOS").length;
  const suspeitoAdulteracao = vistorias.filter(v => v.situacao === "SUSPEITO ADULTERAÇÃO").length;
  const pendentes = vistorias.filter(v => v.situacao === "PENDENTE").length;
  
  doc.setFontSize(10);
  doc.text(`Aprovadas: ${aprovadas} | Reprovadas: ${reprovadas} | Conforme: ${conforme} | Não Conforme: ${naoConforme}`, 14, 56);
  doc.text(`Aprovado c/ Apontamentos: ${aprovadoComApontamentos} | Suspeito Adulteração: ${suspeitoAdulteracao} | Pendentes: ${pendentes}`, 14, 62);
  
  // Preparar dados da tabela
  const tableData = vistorias.map((vistoria) => {
    const data = new Date(vistoria.criadoEm || vistoria.created_at || "").toLocaleDateString("pt-BR");
    const valor = parseFloat(vistoria.valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    
    return [
      data,
      vistoria.placa,
      vistoria.modelo,
      vistoria.clienteNome || vistoria.cliente_nome,
      valor,
      vistoria.pagamento,
      vistoria.situacao,
    ];
  });
  
  // Criar tabela com autoTable
  autoTable(doc, {
    startY: 70,
    head: [["Data", "Placa", "Modelo", "Cliente", "Valor", "Pagamento", "Situação"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 22, halign: "center" },
      1: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 25, halign: "center" },
      6: { cellWidth: 35, halign: "center" },
    },
    didDrawCell: (data) => {
      // Colorir a célula de situação de acordo com o status
      if (data.column.index === 6 && data.section === "body") {
        const situacao = data.cell.raw as string;
        let bgColor: [number, number, number] = [156, 163, 175]; // cinza padrão
        
        switch (situacao) {
          case "APROVADO":
          case "CONFORME":
            bgColor = [34, 197, 94]; // verde
            break;
          case "REPROVADO":
          case "NÃO CONFORME":
            bgColor = [239, 68, 68]; // vermelho
            break;
          case "APROVADO COM APONTAMENTOS":
            bgColor = [234, 179, 8]; // amarelo
            break;
          case "SUSPEITO ADULTERAÇÃO":
            bgColor = [168, 85, 247]; // roxo
            break;
          case "PENDENTE":
            bgColor = [156, 163, 175]; // cinza
            break;
        }
        
        doc.setFillColor(...bgColor);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(situacao, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
          align: "center",
          baseline: "middle",
        });
      }
    },
    margin: { top: 70, left: 14, right: 14 },
  });
  
  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }
  
  // Salvar PDF
  const nomeArquivo = `vistorias_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
};
