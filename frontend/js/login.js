async function login(){

    const re = document.getElementById("re").value
    const senha = document.getElementById("senha").value

    const resposta = await fetch(API_URL+"/auth/login",{

        method:'POST',

        headers:{
            'Content-Type':'application/json'
        },

        body:JSON.stringify({re,senha})
    })

    const dados = await resposta.json()

    if(dados.token){

        localStorage.setItem("token",dados.token)

        window.location="dashboard.html"

    }else{

        alert("Erro no login")

    }

}