const express = require('express')
const router = express.Router()

const supabase = require('../db')

/* LISTAR */

router.get('/', async (req,res)=>{

const {data,error} = await supabase
.from('locais_ambiente')
.select('*')
.order('ordem')

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* LISTAR POR AMBIENTE */

router.get('/:ambiente_id', async (req,res)=>{

const {ambiente_id} = req.params

const {data,error} = await supabase
.from('locais_ambiente')
.select('*')
.eq('ambiente_id',ambiente_id)
.order('ordem')

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* CRIAR */

router.post('/', async (req,res)=>{

const {ambiente_id,tipo_local,identificador} = req.body

const nome_exibicao = `${tipo_local} ${identificador}`

const {data,error} = await supabase
.from('locais_ambiente')
.insert([
{
ambiente_id,
tipo_local,
identificador,
nome_exibicao
}
])
.select()

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* EDITAR */

router.put('/:id', async (req,res)=>{

const {id} = req.params
const {ambiente_id,tipo_local,identificador} = req.body

const nome_exibicao = `${tipo_local} ${identificador}`

const {data,error} = await supabase
.from('locais_ambiente')
.update({
ambiente_id,
tipo_local,
identificador,
nome_exibicao
})
.eq('id',id)
.select()

if(error){
return res.status(500).json(error)
}

res.json(data)

})


/* EXCLUIR */

router.delete('/:id', async (req,res)=>{

const {id} = req.params

const {error} = await supabase
.from('locais_ambiente')
.delete()
.eq('id',id)

if(error){
return res.status(500).json(error)
}

res.json({success:true})

})

module.exports = router