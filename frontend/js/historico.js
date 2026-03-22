const api = "http://localhost:3000";

/* ===== CARREGAR USUÁRIOS ===== */

async function carregarUsuarios(){

const select = document.getElementById("usuarioSelect");

try{

const res = await fetch(`${api}/usuarios`);
const usuarios = await res.json();

select.innerHTML = "";

usuarios.forEach(u=>{

const option = document.createElement("option");
option.value = u.id;
option.textContent = u.username;

select.appendChild(option);

});

}catch(e){

select.innerHTML = "<option>Erro</option>";

}

}

/* ===== BUSCAR RELATÓRIOS ===== */

async function buscarRelatorioUsuario(){

const usuario_id = document.getElementById("usuarioSelect").value;

const res = await fetch(`${api}/relatorios/usuario/${usuario_id}`);
const dados = await res.json();

const lista = document.getElementById("listaRelatorios");

lista.innerHTML="";

dados.forEach(c=>{

lista.innerHTML += `

<div class="linha-relatorio">

<div class="col-data">
${c.data_br}<br>
${c.hora_br}
</div>

<div class="col-usuario">
${c.usuarios ? c.usuarios.username : "-"}
</div>

<div class="col-acoes">

<button class="btn-pdf"
onclick="gerarPDF('${c.id}')">
PDF
</button>

<button class="btn-excluir"
onclick="excluirChecklist('${c.id}')">
Excluir
</button>

</div>

<div class="col-divergencias">
${
c.divergencias > 0
? `<span style="color:red;font-weight:bold">${c.divergencias}</span>`
: `<span style="color:#3498db;font-weight:bold">0</span>`
}
</div>

</div>

`;

});

}

/* ===== PDF INDIVIDUAL ===== */

function gerarPDF(id){

window.open(`${api}/relatorios/pdf/${id}`,"_blank");

}

/* ===== EXCLUIR ===== */

async function excluirChecklist(id){

if(!confirm("Excluir checklist?")) return;

await fetch(`${api}/relatorios/excluir/${id}`,{
method:"DELETE"
});

buscarRelatorioUsuario();

}

/* ===== PDF GERAL ===== */

function gerarPDFGeral(){

const ambiente_id = new URLSearchParams(window.location.search)
.get("ambiente_id")

if(!ambiente_id){
alert("Ambiente não identificado")
return
}

window.open(`${api}/relatorios/pdf-geral/${ambiente_id}`,"_blank")

}

/* ===== INIT ===== */

document.addEventListener("DOMContentLoaded", carregarUsuarios);