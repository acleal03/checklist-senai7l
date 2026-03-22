const express = require('express')
const router = express.Router()

const supabase = require('../db')


/* LISTAR */

router.get('/', async (req,res)=>{

const {data,error} = await supabase
.from('itens_ambiente')
.select(`
id,
ambiente_id,
local_id,
nome_item,
quantidade,
descricao,
ambientes(codigo),
locais_ambiente(nome_exibicao)
`)
.order('nome_item')

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* CRIAR */

router.post('/', async (req,res)=>{

const {ambiente_id,local_id,nome_item,quantidade,descricao} = req.body

const {data,error} = await supabase
.from('itens_ambiente')
.insert([
{
ambiente_id,
local_id,
nome_item,
quantidade,
descricao
}
])

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* ATUALIZAR */

router.put('/:id', async (req,res)=>{

const {id} = req.params
const {ambiente_id,local_id,nome_item,quantidade,descricao} = req.body

const {data,error} = await supabase
.from('itens_ambiente')
.update({
ambiente_id,
local_id,
nome_item,
quantidade,
descricao
})
.eq('id',id)

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* EXCLUIR */

router.delete('/:id', async (req,res)=>{

const {id} = req.params

const {error} = await supabase
.from('itens_ambiente')
.delete()
.eq('id',id)

if(error){
return res.status(500).json(error)
}

res.json({success:true})

})


module.exports = router