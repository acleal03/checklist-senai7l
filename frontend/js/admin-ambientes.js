const API = "http://localhost:3000";

let ambienteEditando = null;


/* SALVAR OU ATUALIZAR */

async function salvarAmbiente(){

const codigo = document.getElementById("codigo").value;
const descricao = document.getElementById("descricao").value;

if(!codigo || !descricao){
alert("Preencha ambiente e descrição");
return;
}

if(ambienteEditando){

await fetch(`${API}/ambientes/${ambienteEditando}`,{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
codigo:codigo,
descricao:descricao
})
});

ambienteEditando = null;

}else{

await fetch(`${API}/ambientes`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
codigo:codigo,
descricao:descricao
})
});

}

document.getElementById("codigo").value="";
document.getElementById("descricao").value="";

carregarAmbientes();

}


/* CARREGAR LISTA */

async function carregarAmbientes(){

const res = await fetch(`${API}/ambientes`);
const ambientes = await res.json();

const lista = document.getElementById("lista-ambientes");

lista.innerHTML="";

ambientes.forEach(a=>{

lista.innerHTML+=`

<div class="ambiente-item">

<div class="ambiente-titulo">${a.codigo}</div>

<div class="ambiente-descricao">${a.descricao}</div>

<div class="acoes">

<button class="btn-editar" onclick="editar('${a.id}','${a.codigo}','${a.descricao}')">
✏ Editar
</button>

<button class="btn-excluir" onclick="excluir('${a.id}')">
🗑 Excluir
</button>

</div>

</div>

`;

});

}


/* EDITAR */

function editar(id,codigo,descricao){

ambienteEditando = id;

document.getElementById("codigo").value = codigo;
document.getElementById("descricao").value = descricao;

}


/* EXCLUIR */

async function excluir(id){

if(!confirm("Excluir ambiente?")) return;

await fetch(`${API}/ambientes/${id}`,{
method:"DELETE"
});

carregarAmbientes();

}


/* VOLTAR */

function voltar(){
window.location.href="admin.html";
}


carregarAmbientes();