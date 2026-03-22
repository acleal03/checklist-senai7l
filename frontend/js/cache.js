let CACHE = {
ambientes:null,
estrutura:{}
}

async function obterAmbientes(){

if(CACHE.ambientes){
return CACHE.ambientes
}

const resp = await fetch("http://localhost:3000/ambientes",{cache:"no-store"})

CACHE.ambientes = await resp.json()

return CACHE.ambientes

}

async function obterEstrutura(ambiente_id){

if(CACHE.estrutura[ambiente_id]){
return CACHE.estrutura[ambiente_id]
}

const resp = await fetch(
"http://localhost:3000/checklist/estrutura/"+ambiente_id,
{cache:"no-store"}
)

const dados = await resp.json()

CACHE.estrutura[ambiente_id] = dados

return dados

}