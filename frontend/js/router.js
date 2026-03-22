function navegar(pagina){

const container = document.getElementById("app")

fetch(pagina)
.then(res => res.text())
.then(html => {

container.innerHTML = html

window.scrollTo(0,0)

})

.catch(err => {

console.error("Erro ao carregar página:",err)

})

}