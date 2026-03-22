const params = new URLSearchParams(window.location.search)

const checklist_id = params.get("checklist")

async function carregarChecklist(){

const resp = await fetch("http://localhost:3000/checklist/"+checklist_id)

const itens = await resp.json()

const div = document.getElementById("listaItens")

div.innerHTML=""

itens.forEach(i=>{

const linha = document.createElement("div")

linha.className="item-checklist"

linha.innerHTML=`

<div class="item-nome">

<b>${i.nome_item}</b>

</div>

<div class="item-status">

Status: ${i.status}

</div>

<div class="item-obs">

Observação: ${i.observacao || "-"}

</div>

<hr>

`

div.appendChild(linha)

})

}

function voltar(){

window.history.back()

}

carregarChecklist()