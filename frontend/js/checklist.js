const api = "http://localhost:3000";

let ambienteAtual = null;
let usuario = JSON.parse(localStorage.getItem("usuario"));
let checklist_id = null;

/* 🔥 PARAMS */
const params = new URLSearchParams(window.location.search);
const ambiente_id = params.get("ambiente_id");
const checklist_id_param = params.get("checklist_id");

/* =========================
   CARREGAR CHECKLIST
========================= */

async function carregarChecklist(){

if(!ambiente_id){
alert("Ambiente não identificado");
return;
}

/* estrutura */
const res = await fetch(`${api}/checklist/estrutura/${ambiente_id}`);
const estrutura = await res.json();

ambienteAtual = estrutura.ambiente;

/* 🔥 EDIÇÃO */
let itensSalvos = [];

if(checklist_id_param){

checklist_id = checklist_id_param;

const resItens = await fetch(`${api}/checklist/${checklist_id}`);
itensSalvos = await resItens.json();

}

/* título */
document.getElementById("tituloAmbiente").innerText =
`${estrutura.ambiente.codigo} - ${estrutura.ambiente.descricao}`;

const container = document.getElementById("estrutura");
container.innerHTML = "";

/* montar tela */
estrutura.locais.forEach(local => {

let htmlItens = "";

local.itens.forEach(item => {

/* 🔥 MATCH CORRIGIDO */
const itemSalvo = itensSalvos.find(i => 
(i.nome_item || "").trim().toUpperCase() === 
(item.nome_item || "").trim().toUpperCase()
);

const statusSalvo = (itemSalvo?.status || "").trim().toUpperCase();

const checked = itemSalvo
? statusSalvo === "OK"
: true;

const obs = itemSalvo?.observacao || "";

htmlItens += `

<div class="item-check">

<label style="display:inline-flex; align-items:center;">

<input type="checkbox"
${checked ? "checked" : ""}
data-item="${item.nome_item}"
data-qtd="${item.quantidade}"
onchange="toggleObs(this)">

<span style="margin-left:12px;"> - </span>

<span style="margin-left:12px;">${item.nome_item}</span>

<span style="margin-left:12px;"> - ${item.quantidade}</span>

</label>

<textarea placeholder="Justificativa obrigatória"
style="${statusSalvo === "OK" ? "display:none" : "block"}">${obs}</textarea>

</div>

`;

});

container.innerHTML += `

<div class="card-local">

<label class="local-titulo">

<input type="checkbox"
checked
data-local="${local.id}"
onchange="toggleLocal(this)">

${local.nome_exibicao}

</label>

<div class="itens-local">

${htmlItens}

</div>

</div>

`;

});

/* 🔥 GARANTIR VISUAL CORRETO */
setTimeout(() => {

const itens = document.querySelectorAll(".item-check");

itens.forEach(div => {

const checkbox = div.querySelector("input");
const textarea = div.querySelector("textarea");

if(!checkbox.checked){
textarea.style.display = "block";
}

});

}, 50);

}

/* =========================
   CONTROLES
========================= */

function toggleLocal(el){

const itens = el.parentElement.parentElement
.querySelectorAll(".item-check input");

itens.forEach(i=>{
i.checked = el.checked;
toggleObs(i);
});

}

function toggleObs(el){

const obs = el.parentElement.parentElement.querySelector("textarea");

if(!el.checked){
obs.style.display="block";
}else{
obs.style.display="none";
obs.value="";
}

}

/* =========================
   SALVAR (UPDATE REAL)
========================= */

async function finalizarChecklist(){

/* 🔥 NOVO */
if(!checklist_id){

const agora = new Date();

const data_br = agora.toLocaleDateString("pt-BR");
const hora_br = agora.toLocaleTimeString("pt-BR");

const resChecklist = await fetch(`${api}/checklist/iniciar`,{

method:"POST",
headers:{ "Content-Type":"application/json" },

body:JSON.stringify({
usuario_id:usuario.id,
ambiente_id:ambienteAtual.id,
data_br,
hora_br
})

});

const checklist = await resChecklist.json();
checklist_id = checklist[0].id;

}else{

/* 🔥 EDIÇÃO */
await fetch(`${api}/checklist/itens/${checklist_id}`,{
method:"DELETE"
});

}

/* ===== LOCAIS ===== */

const locais = document.querySelectorAll(".card-local");

for(const local of locais){

const checkboxLocal = local.querySelector(".local-titulo input");

let statusLocal = checkboxLocal.checked ? "OK" : "DIVERGENTE";

await fetch(`${api}/checklist/local`,{

method:"POST",
headers:{ "Content-Type":"application/json" },

body:JSON.stringify({
checklist_id,
local_id:checkboxLocal.dataset.local,
status:statusLocal
})

});

}

/* ===== ITENS ===== */

const itens = document.querySelectorAll(".item-check");

for(const div of itens){

const checkbox = div.querySelector("input");
const obs = div.querySelector("textarea");

let status = checkbox.checked ? "OK" : "DIVERGENTE";

if(status==="DIVERGENTE" && obs.value.trim()===""){
alert("Preencha a justificativa");
return;
}

await fetch(`${api}/checklist/item`,{

method:"POST",
headers:{ "Content-Type":"application/json" },

body:JSON.stringify({
checklist_id,
nome_item:checkbox.dataset.item,
quantidade:checkbox.dataset.qtd,
status,
observacao:obs.value
})

});

}

alert("Checklist atualizado com sucesso");

history.back();

}

/* INIT */
carregarChecklist();