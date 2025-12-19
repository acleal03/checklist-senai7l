import { supabase } from "./supabase.js";

// ===============================
// LISTAS DE ITENS
// ===============================
const itensLaboratorio = [
  { nome: "Mesas", quantidade: 12 },
  { nome: "Cadeiras", quantidade: 34 },
  { nome: "Computadores", quantidade: 33 },
  { nome: "Mouses", quantidade: 33 },
  { nome: "Teclados", quantidade: 33 },
  { nome: "Monitores", quantidade: 34 },
  { nome: "Datashow", quantidade: 1 },
  { nome: "Controle Datashow", quantidade: 1 },
  { nome: "Quadro Branco", quantidade: 1 },
  { nome: "Tela retrátil", quantidade: 1 },
  { nome: "Ar condicionado", quantidade: 2 },
  { nome: "Controle Ar condicionado", quantidade: 1 }
];

const armario01 = [
  "Certificador de FO (02)",
  "Switch Dlink (01)",
  "Switch HP 1920 (01)",
  "Switch Cisco 1024 (01)"
];

const armario02 = [
  "Testador de cabos de rede FLUKE (01)",
  "Testadores de cabos de rede genéricos (10)",
  "Roteador Ubiquiti (02)",
  "Roteador Unifi (01)",
  "Caixas de cabo de rede UTP (02)",
  "Alicates crimpador para cabos de rede",
  "Alicates de corte diagonal"
];

// ===============================
// FUNÇÃO PARA CRIAR CARD
// ===============================
function criarCardItem(texto, indice, prefixo) {
  const card = document.createElement("div");
  card.className = "card-item";

  card.innerHTML = `
    <div>
      <div class="item-titulo">${texto}</div>
    </div>

    <div>
      <div class="item-status">
        <label>
          <input type="radio" name="${prefixo}_${indice}" value="ok" required>
          OK
        </label>
        <label>
          <input type="radio" name="${prefixo}_${indice}" value="divergente">
          Divergente
        </label>
      </div>

      <div class="item-observacao">
        <textarea rows="2"
          placeholder="Informe a divergência encontrada..."></textarea>
      </div>
    </div>
  `;

  const radios = card.querySelectorAll(`input[name="${prefixo}_${indice}"]`);
  const observacao = card.querySelector("textarea");

  radios.forEach(radio => {
    radio.addEventListener("change", e => {
      if (e.target.value === "divergente") {
        observacao.style.display = "block";
        card.classList.add("divergente");
      } else {
        observacao.style.display = "none";
        card.classList.remove("divergente");
      }
    });
  });

  return card;
}

// ===============================
// RENDERIZAÇÃO
// ===============================
const divLaboratorio = document.getElementById("itensLaboratorio");
const divArmario01 = document.getElementById("armario01");
const divArmario02 = document.getElementById("armario02");

itensLaboratorio.forEach((item, i) => {
  divLaboratorio.appendChild(
    criarCardItem(`${item.nome} (${item.quantidade})`, i, "lab")
  );
});

armario01.forEach((item, i) => {
  divArmario01.appendChild(
    criarCardItem(item, i, "arm1")
  );
});

armario02.forEach((item, i) => {
  divArmario02.appendChild(
    criarCardItem(item, i, "arm2")
  );
});

// ===============================
// SALVAR CHECKLIST NO BANCO
// ===============================
async function salvarChecklist() {

  const { data: sessao } = await supabase.auth.getSession();
  if (!sessao.session) {
    alert("Usuário não autenticado.");
    return;
  }

  const usuarioId = sessao.session.user.id;
  const dataHoje = new Date().toISOString().split("T")[0];

  // ===============================
  // CRIAR CHECKLIST
  // ===============================
  const { data: checklist, error } = await supabase
    .from("checklists")
    .insert({
      data_checklist: dataHoje,
      usuario_id: usuarioId,
      observacoes_gerais:
        document.getElementById("observacoesGerais").value
    })
    .select()
    .single();

  if (error) {
    alert("Erro ao salvar checklist.");
    console.error(error);
    return;
  }

  const checklistId = checklist.id;

  // ===============================
  // SALVAR ITENS DO LABORATÓRIO
  // ===============================
  const itensLaboratorioRegistros = [];

  for (let i = 0; i < itensLaboratorio.length; i++) {

    const radios = document.querySelectorAll(`input[name="lab_${i}"]`);
    const selecionado = [...radios].find(r => r.checked);
    if (!selecionado) continue;

    const observacao =
      radios[0]
        .closest(".card-item")
        .querySelector("textarea").value;

    itensLaboratorioRegistros.push({
      checklist_id: checklistId,
      item: itensLaboratorio[i].nome,
      quantidade_esperada: itensLaboratorio[i].quantidade,
      status: selecionado.value,
      observacao: observacao || null
    });
  }

  if (itensLaboratorioRegistros.length > 0) {
    const { error } = await supabase
      .from("checklist_itens")
      .insert(itensLaboratorioRegistros);

    if (error) {
      console.error(error);
      alert("Erro ao salvar itens do laboratório.");
      return;
    }
  }

  // ===============================
  // FUNÇÃO GENÉRICA PARA ARMÁRIOS
  // ===============================
  async function salvarItensArmario(lista, prefixo, tabela) {

    const registros = [];

    for (let i = 0; i < lista.length; i++) {

      const radios = document.querySelectorAll(
        `input[name="${prefixo}_${i}"]`
      );

      const selecionado = [...radios].find(r => r.checked);
      if (!selecionado) continue;

      const observacao =
        radios[0]
          .closest(".card-item")
          .querySelector("textarea").value;

      registros.push({
        checklist_id: checklistId,
        item: lista[i],
        status: selecionado.value,
        observacao: observacao || null
      });
    }

    if (registros.length > 0) {
      const { error } = await supabase
        .from(tabela)
        .insert(registros);

      if (error) {
        console.error(error);
        alert(`Erro ao salvar ${tabela}`);
      }
    }
  }

  // ===============================
  // SALVAR ARMÁRIOS
  // ===============================
  await salvarItensArmario(armario01, "arm1", "checklist_armario01");
  await salvarItensArmario(armario02, "arm2", "checklist_armario02");

  alert("Checklist salvo com sucesso!");
  window.location.href = "dashboard.html";
}



window.salvarChecklist = salvarChecklist;
