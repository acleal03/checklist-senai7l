const api = "http://localhost:3000";

/* ===== CARREGAR AMBIENTES ===== */

async function carregarAmbientes(){

const res = await fetch(`${api}/ambientes`);
const ambientes = await res.json();

const container = document.getElementById("ambientes");

container.innerHTML="";

ambientes.forEach(a=>{

container.innerHTML += `

<div class="card-ambiente" onclick="abrirAmbiente('${a.id}')">

<h3>${a.codigo}</h3>
<p>${a.descricao}</p>

</div>

`;

});

}

/* ===== ABRIR AMBIENTE ===== */

function abrirAmbiente(id){

window.location.href = `ambiente.html?ambiente_id=${id}`;

}

/* ===== LOGOUT ===== */

function logout(){

localStorage.removeItem("usuario");
window.location.href = "login.html";

}

/* ===== PDF GERAL DASHBOARD ===== */

function gerarPDFGeralDashboard(){

const dataInicio = document.getElementById("dataInicio")?.value
const dataFim = document.getElementById("dataFim")?.value

if(!dataInicio || !dataFim){
alert("Selecione o período")
return
}

/* converter yyyy-mm-dd -> dd/mm/yyyy */
function formatarDataBR(data){
const [ano,mes,dia] = data.split("-")
return `${dia}/${mes}/${ano}`
}

const inicioBR = formatarDataBR(dataInicio)
const fimBR = formatarDataBR(dataFim)

/* CHAMAR BACKEND */
window.open(
`${api}/relatorios/pdf-geral-todos?inicio=${inicioBR}&fim=${fimBR}`,
"_blank"
)

}

/* ===== CONTROLE DE PERMISSÃO ===== */

function aplicarPermissoes(){

const usuario = JSON.parse(localStorage.getItem("usuario"))

if(!usuario){
window.location.href = "login.html"
return
}

/* se NÃO for admin */
if(usuario.perfil !== "admin"){

/* esconder botão admin */
const btnAdmin = document.querySelector(".btn-admin")
if(btnAdmin) btnAdmin.style.display = "none"

/* esconder inputs de data */
const dataInicio = document.getElementById("dataInicio")
const dataFim = document.getElementById("dataFim")

if(dataInicio) dataInicio.style.display = "none"
if(dataFim) dataFim.style.display = "none"

/* esconder textos "Data início" e "Data fim" */
document.querySelectorAll("label").forEach(label=>{
if(label.innerText.toLowerCase().includes("data")){
label.style.display = "none"
}
})

/* esconder botão relatório geral */
const botoes = document.querySelectorAll("button")

botoes.forEach(btn=>{
if(btn.innerText.includes("Relatório Geral")){
btn.style.display = "none"
}
})

}

}

/* ===== INIT ===== */

document.addEventListener("DOMContentLoaded", ()=>{

carregarAmbientes()
aplicarPermissoes()

})