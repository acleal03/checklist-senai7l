function mostrarLoader(){
document.getElementById("loader").style.visibility="visible"
}

function esconderLoader(){
document.getElementById("loader").style.visibility="hidden"
}

function iniciarProgresso(){

const bar = document.getElementById("progressBar")

bar.style.width="30%"

setTimeout(()=>{bar.style.width="70%"},200)

}

function finalizarProgresso(){

const bar = document.getElementById("progressBar")

bar.style.width="100%"

setTimeout(()=>{
bar.style.width="0%"
},300)

}

function aplicarTransicao(){

const app = document.querySelector(".container")

if(app){
app.classList.add("fade")
}

}