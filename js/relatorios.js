import { supabase } from "./supabase.js";

const tabela = document.getElementById("tabelaRelatorios");
const botaoVoltar = document.getElementById("botaoVoltar");

if (botaoVoltar) {
  botaoVoltar.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}

// ===============================
// CARREGAR USUÁRIOS (ID → NOME)
// ===============================
async function carregarMapaUsuarios() {
  const { data, error } = await supabase
    .from("usuarios_sistema")
    .select("id, nome");

  if (error) {
    console.error("Erro ao carregar usuários:", error);
    return {};
  }

  const mapa = {};
  data.forEach(u => {
    mapa[u.id] = u.nome;
  });

  return mapa;
}

// ===============================
// CARREGAR RELATÓRIOS
// ===============================
async function carregarRelatorios() {

  const mapaUsuarios = await carregarMapaUsuarios();

  const { data, error } = await supabase
    .from("checklists")
    .select("id, criado_em, usuario_id")
    .order("id", { ascending: false });

  if (error) {
    alert("Erro ao carregar relatórios.");
    console.error(error);
    return;
  }

  tabela.innerHTML = "";

  data.forEach(registro => {

    // ✅ HORA CORRETA (SEM TIMEZONE MANUAL)
    const dataHora = new Date(registro.criado_em);

    const dataFormatada = dataHora.toLocaleDateString("pt-BR");
    const horaFormatada = dataHora.toLocaleTimeString("pt-BR");

    const nomeUsuario =
      mapaUsuarios[registro.usuario_id] ?? "Usuário";

    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td class="coluna-texto">
        ${dataFormatada}<br>
        <small>${horaFormatada}</small>
      </td>
      <td class="coluna-texto">
        ${nomeUsuario}
      </td>
      <td class="coluna-acoes"></td>
    `;

    const tdAcoes = linha.querySelector(".coluna-acoes");

    const botaoPdf = document.createElement("button");
    botaoPdf.className = "botao botao-pdf";
    botaoPdf.innerText = "PDF";
    botaoPdf.onclick = () => gerarPdf(registro.id, nomeUsuario);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.className = "botao botao-excluir";
    botaoExcluir.innerText = "Excluir";
    botaoExcluir.onclick = () => excluirChecklist(registro.id);

    tdAcoes.appendChild(botaoPdf);
    tdAcoes.appendChild(botaoExcluir);

    tabela.appendChild(linha);
  });
}

// ===============================
// GERAR PDF (HORA DEFINITIVA)
// ===============================
async function gerarPdf(checklistId, nomeUsuario) {

  const pdf = new window.jspdf.jsPDF();

  const { data: checklist } = await supabase
    .from("checklists")
    .select("criado_em")
    .eq("id", checklistId)
    .single();

  const { data: laboratorio } = await supabase
    .from("checklist_itens")
    .select("item, status, observacao")
    .eq("checklist_id", checklistId);

  const { data: armario01 } = await supabase
    .from("checklist_armario01")
    .select("item, status, observacao")
    .eq("checklist_id", checklistId);

  const { data: armario02 } = await supabase
    .from("checklist_armario02")
    .select("item, status, observacao")
    .eq("checklist_id", checklistId);

  // ✅ HORA CORRETA (SEM TIMEZONE MANUAL)
  const dataHora = new Date(checklist.criado_em);

  const dataFormatada = dataHora.toLocaleDateString("pt-BR");
  const horaFormatada = dataHora.toLocaleTimeString("pt-BR");

  let y = 15;

  /* ================= CABEÇALHO ================= */
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("SENAI@107A", 10, y);
  y += 10;

  pdf.setFontSize(11);
  pdf.text(`Data: ${dataFormatada}`, 10, y);
  y += 6;
  pdf.text(`Hora: ${horaFormatada}`, 10, y);
  y += 6;
  pdf.text(`Responsável: ${nomeUsuario}`, 10, y);
  y += 10;

  /* ================= FUNÇÃO DE IMPRESSÃO ================= */
  function imprimirSecao(titulo, lista) {
    if (!lista || lista.length === 0) return;

    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text(titulo, 10, y);
    y += 8;

    pdf.setFontSize(10);

    lista.forEach(item => {

      if (item.status === "divergente") {
        pdf.setTextColor(220, 38, 38);
      } else {
        pdf.setTextColor(0, 0, 0);
      }

      pdf.text(
        `• ${item.item} - ${item.status.toUpperCase()}`,
        12, y
      );
      y += 5;

      if (item.observacao) {
        pdf.text(`  Obs: ${item.observacao}`, 14, y);
        y += 5;
      }

      if (y > 270) {
        pdf.addPage();
        y = 15;
      }
    });

    y += 8;
  }

  imprimirSecao("Itens do Laboratório", laboratorio);
  imprimirSecao("Armário nº 01", armario01);
  imprimirSecao("Armário nº 02", armario02);

  pdf.save(`Checklist_${checklistId}.pdf`);
}

// ===============================
async function excluirChecklist(id) {
  if (!confirm("Deseja realmente excluir este checklist?")) return;
  await supabase.from("checklists").delete().eq("id", id);
  carregarRelatorios();
}

window.onload = carregarRelatorios;
