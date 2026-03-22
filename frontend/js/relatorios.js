const api = "http://localhost:3000";

/* ===== CARREGAR USUÁRIOS ===== */

async function carregarUsuarios(){

const select = document.getElementById("usuarioSelect");
const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))

try{

/* 🔒 USER só vê ele mesmo */
if(usuarioLogado.perfil !== "admin"){

select.innerHTML = ""

const option = document.createElement("option")
option.value = usuarioLogado.id
option.textContent = usuarioLogado.username

select.appendChild(option)

return
}

/* 👨‍💼 ADMIN vê todos */
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

const ambiente_id = new URLSearchParams(window.location.search)
.get("ambiente_id")

try{

const res = await fetch(
`${api}/relatorios/usuario/${usuario_id}/${ambiente_id}`
);

if(!res.ok){
throw new Error("Erro ao buscar dados")
}

const dados = await res.json();

const lista = document.getElementById("listaRelatorios");

lista.innerHTML = "";

dados.forEach(c=>{

lista.innerHTML += `

<div class="linha-relatorio">

<div class="col-data">
${c.data_br}<br>
${c.hora_br}
</div>

<div class="col-usuario">
${c.usuarios?.username || "-"}
</div>

<div class="col-acoes">

<button class="btn-pdf"
onclick="gerarPDF('${c.id}')">
PDF
</button>

<button class="btn-editar"
onclick="editarChecklist('${c.id}')">
Editar
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

}catch(err){

console.error(err)
alert("Erro ao buscar relatórios")

}

}

/* ===== EDITAR CHECKLIST ===== */

function editarChecklist(id){

const ambiente_id = new URLSearchParams(window.location.search)
.get("ambiente_id")

window.location.href =
`checklist.html?ambiente_id=${ambiente_id}&checklist_id=${id}&modo=editar`

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

/* ===== PDF GERAL (SÓ ADMIN) ===== */

function gerarPDFGeral(){

const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))

if(usuarioLogado.perfil !== "admin"){
alert("Acesso negado")
return
}

const ambiente_id = new URLSearchParams(window.location.search)
.get("ambiente_id")

if(!ambiente_id){
alert("Ambiente não identificado")
return
}

window.open(`${api}/relatorios/pdf-geral/${ambiente_id}`,"_blank")

}

/* ===== CONTROLE DE PERMISSÃO ===== */

function aplicarPermissoes(){

const usuario = JSON.parse(localStorage.getItem("usuario"))

if(usuario.perfil !== "admin"){

/* esconder botão PDF Geral */
const botoes = document.querySelectorAll("button")

botoes.forEach(btn=>{
if(btn.innerText.includes("PDF Geral")){
btn.style.display = "none"
}
})

}

}

/* ===== INIT ===== */

document.addEventListener("DOMContentLoaded", ()=>{

carregarUsuarios()
aplicarPermissoes()

})