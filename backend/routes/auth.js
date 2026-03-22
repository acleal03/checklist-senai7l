const express = require("express");
const router = express.Router();
const supabase = require("../db");

router.post("/login", async (req, res) => {

const username = req.body.username;
const senha = req.body.senha;

console.log("LOGIN RECEBIDO:", username, senha);

const { data, error } = await supabase
.from("usuarios")
.select("*")
.eq("username", username)
.eq("senha", senha)
.limit(1);

if(error){
console.log("ERRO SUPABASE:", error);
return res.status(500).json({erro:"Erro no banco"});
}

if(!data || data.length === 0){
console.log("USUARIO NAO ENCONTRADO");
return res.status(401).json({erro:"Usuário ou senha inválidos"});
}

const user = data[0];

res.json({
id:user.id,
username:user.username,
perfil:user.perfil
});

});

module.exports = router;