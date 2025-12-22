// js/pdf.js
async function gerarPDFChecklist(checklistId) {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const { data: checklist, error } = await window.supabaseClient
        .from("checklists")
        .select(`
            data_br,
            hora_br,
            observacoes,
            usuarios!fk_checklists_usuario ( username ),
            ambientes!fk_checklists_ambiente ( codigo, descricao )
        `)
        .eq("id", checklistId)
        .single();

    if (error) {
        alert("Erro ao gerar PDF.");
        console.error(error);
        return;
    }

    const { data: itens } = await window.supabaseClient
        .from("checklist_itens")
        .select("nome_item, status, observacao")
        .eq("checklist_id", checklistId)
        .order("nome_item");

    let y = 15;

    // 🔷 CABEÇALHO
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SENAI SETE LAGOAS", 105, y, { align: "center" });
    y += 7;

    doc.setFontSize(11);
    doc.text("FUNDAÇÃO ZERRENNER", 105, y, { align: "center" });
    y += 10;

    doc.setFontSize(12);
    doc.text("Checklist de Ambiente", 105, y, { align: "center" });
    y += 12;

    // 🔷 INFO
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    doc.text(`Ambiente: ${checklist.ambientes.codigo} - ${checklist.ambientes.descricao}`, 10, y); y+=6;
    doc.text(`Usuário: ${checklist.usuarios.username}`, 10, y); y+=6;
    doc.text(`Data: ${checklist.data_br}    Hora: ${checklist.hora_br}`, 10, y); y+=8;

    // 🔷 OBS
    doc.setFont("helvetica", "bold");
    doc.text("Observações Gerais:", 10, y); y+=6;
    doc.setFont("helvetica", "normal");

    const obs = checklist.observacoes || "—";
    doc.text(doc.splitTextToSize(obs, 190), 10, y);
    y += 12;

    // 🔷 ITENS
    doc.setFont("helvetica", "bold");
    doc.text("Itens do Laboratório:", 10, y); y+=6;
    doc.setFont("helvetica", "normal");

    itens.forEach(item => {

        const isDivergente = item.status === "DIVERGENTE";

        if (isDivergente) {
            doc.setTextColor(220, 38, 38); // vermelho
        } else {
            doc.setTextColor(0, 0, 0);
        }

        let linha = `• ${item.nome_item} – ${item.status}`;

        if (isDivergente && item.observacao) {
            linha += ` (${item.observacao})`;
        }

        const linhas = doc.splitTextToSize(linha, 185);

        if (y > 270) {
            doc.addPage();
            y = 15;
        }

        doc.text(linhas, 10, y);
        y += linhas.length * 5;
    });

    // 🔷 RODAPÉ
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(
        "Checklist gerado pelo sistema SENAI 7L",
        105,
        290,
        { align: "center" }
    );

    const nomeArquivo =
        `Checklist_${checklist.ambientes.codigo}_${checklist.data_br.replace(/\//g, "-")}.pdf`;

    doc.save(nomeArquivo);
}
