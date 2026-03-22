const API = "http://localhost:3000";

let localEditando = null;


/* CARREGAR AMBIENTES */

async function carregarAmbientes(){

const res = await fetch(`${API}/ambientes`);
const ambientes = await res.json();

const select = document.getElementById("ambiente");

select.innerHTML = "";

ambientes.forEach(a=>{
select.innerHTML += `<option value="${a.id}">${a.codigo}</option>`;
});

/* filtro quando mudar ambiente */
select.addEventListener("change", carregarLocais);

/* carregar automaticamente os locais do primeiro ambiente */
if(ambientes.length > 0){
select.value = ambientes[0].id;
carregarLocais();
}

}


/* CARREGAR LOCAIS FILTRADOS */

async function carregarLocais(){

const ambiente_id = document.getElementById("ambiente").value;

const res = await fetch(`${API}/locais`);
const locais = await res.json();

const lista = document.getElementById("lista-locais");

lista.innerHTML = "";

locais
.filter(l => l.ambiente_id === ambiente_id)
.forEach(l=>{

lista.innerHTML += `

<div class="ambiente-item">

<div class="ambiente-titulo">${l.nome_exibicao}</div>

<div class="ambiente-descricao">
${l.tipo_local} ${l.identificador}
</div>

<div class="acoes">

<button class="btn-editar"
onclick="editar('${l.id}','${l.ambiente_id}','${l.tipo_local}','${l.identificador}')">
✏ Editar
</button>

<button class="btn-excluir"
onclick="excluir('${l.id}')">
🗑 Excluir
</button>

</div>

</div>

`;

});

}


/* SALVAR OU ATUALIZAR */

async function salvarLocal(){

const ambiente_id = document.getElementById("ambiente").value;
const tipo = document.getElementById("tipo").value;
const identificador = document.getElementById("identificador").value;

if(!tipo || !identificador){
alert("Preencha os campos");
return;
}

if(localEditando){

await fetch(`${API}/locais/${localEditando}`,{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
ambiente_id,
tipo_local:tipo,
identificador
})
});

localEditando = null;

}else{

await fetch(`${API}/locais`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
ambiente_id,
tipo_local:tipo,
identificador
})
});

}

document.getElementById("tipo").value="";
document.getElementById("identificador").value="";

carregarLocais();

}


/* EDITAR */

function editar(id,ambiente_id,tipo,identificador){

localEditando = id;

document.getElementById("ambiente").value = ambiente_id;
document.getElementById("tipo").value = tipo;
document.getElementById("identificador").value = identificador;

}


/* EXCLUIR */

async function excluir(id){

if(!confirm("Excluir local?")) return;

await fetch(`${API}/locais/${id}`,{
method:"DELETE"
});

carregarLocais();

}


/* VOLTAR */

function voltar(){
window.location.href="admin.html";
}


/* INIT */

carregarAmbientes();