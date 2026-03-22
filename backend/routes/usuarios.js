const express = require('express')
const router = express.Router()

const supabase = require('../db')
const bcrypt = require('bcryptjs')


/* LISTAR USUÁRIOS */

router.get('/', async (req,res)=>{

const {data,error} = await supabase
.from('usuarios')
.select('*')
.order('username',{ascending:true})

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* CRIAR USUÁRIO */

router.post('/', async (req,res)=>{

const {username,senha,perfil} = req.body

if(!username || !senha){
return res.status(400).json({erro:'Usuário e senha são obrigatórios'})
}

const senhaHash = bcrypt.hashSync(senha,10)

const {data,error} = await supabase
.from('usuarios')
.insert([
{
username,
senha:senhaHash,
perfil
}
])
.select()

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* EDITAR USUÁRIO */

router.put('/:id', async (req,res)=>{

const {id} = req.params
const {username,senha,perfil} = req.body

let dadosAtualizar = {
username,
perfil
}

/* só atualiza senha se vier preenchida */
if(senha && senha.trim() !== ''){
dadosAtualizar.senha = bcrypt.hashSync(senha,10)
}

const {data,error} = await supabase
.from('usuarios')
.update(dadosAtualizar)
.eq('id',id)
.select()

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* EXCLUIR USUÁRIO */

router.delete('/:id', async (req,res)=>{

const {id} = req.params

const {error} = await supabase
.from('usuarios')
.delete()
.eq('id',id)

if(error){
return res.status(500).json(error)
}

res.json({success:true})

})


module.exports = router