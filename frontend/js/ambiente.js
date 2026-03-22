const params = new URLSearchParams(window.location.search);
const ambiente_id = params.get("ambiente_id");

const api = "http://localhost:3000";

/* CARREGAR DADOS DO AMBIENTE */

async function carregarAmbiente(){

if(!ambiente_id){
alert("Ambiente não identificado");
return;
}

const res = await fetch(`${api}/ambientes`);
const ambientes = await res.json();

const ambiente = ambientes.find(a => a.id === ambiente_id);

if(ambiente){
document.getElementById("titulo-ambiente").innerText =
`${ambiente.codigo} - ${ambiente.descricao}`;
}

}

/* IR PARA CHECKLIST */

function fazerChecklist(){

window.location.href =
`checklist.html?ambiente_id=${ambiente_id}`;

}

/* IR PARA RELATÓRIOS */

function abrirRelatorios(){

window.location.href =
`relatorios.html?ambiente_id=${ambiente_id}`;

}

/* VOLTAR */

function voltar(){

window.location.href = "dashboard.html";

}

/* INICIAR */

carregarAmbiente();