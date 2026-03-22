const API = "http://localhost:3000";

let itemEditando = null;


/* CARREGAR AMBIENTES */

async function carregarAmbientes(){

const res = await fetch(`${API}/ambientes`);
const ambientes = await res.json();

const select = document.getElementById("ambiente");

select.innerHTML="";

ambientes.forEach(a=>{
select.innerHTML += `<option value="${a.id}">${a.codigo}</option>`;
});

select.addEventListener("change", async ()=>{
await carregarLocais();
await carregarItens();
});

if(ambientes.length>0){
select.value = ambientes[0].id;
await carregarLocais();
await carregarItens();
}

}


/* CARREGAR LOCAIS */

async function carregarLocais(){

const ambiente_id = document.getElementById("ambiente").value;

const res = await fetch(`${API}/locais`);
const locais = await res.json();

const select = document.getElementById("local");

select.innerHTML="";

locais
.filter(l => l.ambiente_id === ambiente_id)
.forEach(l=>{
select.innerHTML += `<option value="${l.id}">${l.nome_exibicao}</option>`;
});

}


/* CARREGAR ITENS AGRUPADOS POR LOCAL */

async function carregarItens(){

const ambiente_id = document.getElementById("ambiente").value;

const resItens = await fetch(`${API}/itens`);
const itens = await resItens.json();

const resLocais = await fetch(`${API}/locais/${ambiente_id}`);
const locais = await resLocais.json();

const lista = document.getElementById("lista-itens");

lista.innerHTML="";


locais.forEach(local => {

const itensLocal = itens.filter(i =>
i.ambiente_id === ambiente_id && i.local_id === local.id
);

if(itensLocal.length === 0) return;

let htmlItens="";

itensLocal.forEach(i=>{

htmlItens += `

<div class="ambiente-item">

<div class="ambiente-titulo">${i.nome_item}</div>

<div class="ambiente-descricao">
Quantidade: ${i.quantidade}${i.descricao ? " - Descrição: " + i.descricao : ""}
</div>

<div class="acoes">

<button class="btn-editar"
onclick="editar('${i.id}','${i.ambiente_id}','${i.local_id}','${i.nome_item}','${i.quantidade}','${i.descricao || ""}')">
✏ Editar
</button>

<button class="btn-excluir"
onclick="excluir('${i.id}')">
🗑 Excluir
</button>

</div>

</div>

`;

});


lista.innerHTML += `

<div class="card-local">

<h3>${local.nome_exibicao}</h3>

${htmlItens}

</div>

`;

});

}


/* SALVAR ITEM */

async function salvarItem(){

const ambiente_id = document.getElementById("ambiente").value;
const local_id = document.getElementById("local").value;

const nome = document.getElementById("nome").value;
const quantidade = document.getElementById("quantidade").value;
const descricao = document.getElementById("descricao").value;

if(!nome || !quantidade){
alert("Preencha nome e quantidade");
return;
}

if(itemEditando){

await fetch(`${API}/itens/${itemEditando}`,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
ambiente_id,
local_id,
nome_item:nome,
quantidade,
descricao
})
});

itemEditando=null;

}else{

await fetch(`${API}/itens`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
ambiente_id,
local_id,
nome_item:nome,
quantidade,
descricao
})
});

}

document.getElementById("nome").value="";
document.getElementById("quantidade").value="";
document.getElementById("descricao").value="";

carregarItens();

}


/* EDITAR */

async function editar(id,ambiente_id,local_id,nome,quantidade,descricao){

itemEditando=id;

document.getElementById("ambiente").value=ambiente_id;

await carregarLocais();

document.getElementById("local").value=local_id;

document.getElementById("nome").value=nome;
document.getElementById("quantidade").value=quantidade;
document.getElementById("descricao").value=descricao;

}


/* EXCLUIR */

async function excluir(id){

if(!confirm("Excluir item?")) return;

await fetch(`${API}/itens/${id}`,{
method:"DELETE"
});

carregarItens();

}


/* VOLTAR */

function voltar(){
window.location.href="admin.html";
}


/* INIT */

carregarAmbientes();