const API = "http://localhost:3000";

let usuarioEditando = null;

/* LISTAR USUÁRIOS */

async function carregarUsuarios(){

const res = await fetch(`${API}/usuarios`);
const usuarios = await res.json();

const lista = document.getElementById("lista-usuarios");

lista.innerHTML = "";

usuarios.forEach(u => {

lista.innerHTML += `

<div class="ambiente-item">

<div class="ambiente-titulo">
${u.username}
</div>

<div class="ambiente-descricao">
Perfil: ${u.perfil}
</div>

<div class="acoes">

<button class="btn-editar"
onclick="editar('${u.id}','${u.username}','${u.senha}','${u.perfil}')">
✏ Editar </button>

<button class="btn-excluir"
onclick="excluir('${u.id}')">
🗑 Excluir </button>

</div>

</div>

`;

});

}

/* SALVAR OU ATUALIZAR */

async function salvarUsuario(){

const username = document.getElementById("username").value;
const senha = document.getElementById("senha").value;
const perfil = document.getElementById("perfil").value;

if(!username || !senha){
alert("Preencha usuário e senha");
return;
}

if(usuarioEditando){

await fetch(`${API}/usuarios/${usuarioEditando}`,{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
senha,
perfil
})
});

usuarioEditando = null;

}else{

await fetch(`${API}/usuarios`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
senha,
perfil
})
});

}

document.getElementById("username").value="";
document.getElementById("senha").value="";
document.getElementById("perfil").value="user";

carregarUsuarios();

}

/* EDITAR */

function editar(id,username,senha,perfil){

usuarioEditando = id;

document.getElementById("username").value = username;
document.getElementById("senha").value = senha;
document.getElementById("perfil").value = perfil;

}

/* EXCLUIR */

async function excluir(id){

if(!confirm("Excluir usuário?")) return;

await fetch(`${API}/usuarios/${id}`,{
method:"DELETE"
});

carregarUsuarios();

}

/* VOLTAR */

function voltar(){
window.location.href = "admin.html";
}

/* INIT */

carregarUsuarios();
