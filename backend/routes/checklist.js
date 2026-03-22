const express = require('express')
const router = express.Router()

const supabase = require('../db')

/*
INICIAR CHECKLIST
*/

router.post('/iniciar', async (req,res)=>{

    const {usuario_id, ambiente_id, data_br, hora_br} = req.body

    const {data,error} = await supabase
        .from('checklists')
        .insert([
            {
                usuario_id,
                ambiente_id,
                data_br,
                hora_br
            }
        ])
        .select()

    if(error){
        return res.status(500).json(error)
    }

    res.json(data)

})

/*
REGISTRAR LOCAL
*/

router.post('/local', async (req,res)=>{

    const {checklist_id, local_id, status} = req.body

    const {data,error} = await supabase
        .from('checklist_locais')
        .insert([
            {
                checklist_id,
                local_id,
                status
            }
        ])
        .select()

    if(error){
        return res.status(500).json(error)
    }

    res.json(data)

})

/*
REGISTRAR ITEM
*/

router.post('/item', async (req,res)=>{

    const {checklist_id, nome_item, quantidade, status, observacao} = req.body

    const statusPermitidos = ["OK","DIVERGENTE"]

    if(!statusPermitidos.includes(status)){
        return res.status(400).json({
            erro:"Status inválido. Use OK ou DIVERGENTE"
        })
    }

    const {data,error} = await supabase
        .from('checklist_itens')
        .insert([
            {
                checklist_id,
                nome_item,
                quantidade: quantidade ? Number(quantidade) : null,
                status,
                observacao
            }
        ])
        .select()

    if(error){
        return res.status(500).json(error)
    }

    res.json(data)

})

/*
LISTAR TODOS OS CHECKLISTS
*/

router.get('/', async (req,res)=>{

    const {data,error} = await supabase
        .from('checklists')
        .select(`
            id,
            data_br,
            hora_br,
            observacoes,
            criado_em,
            usuarios!checklists_usuario_id_fkey(username),
            ambientes!checklists_ambiente_id_fkey(codigo,descricao)
        `)
        .order('criado_em',{ascending:false})

    if(error){
        return res.status(500).json(error)
    }

    res.json(data)

})

/*
DETALHES DE UM CHECKLIST
*/

router.get('/:id', async (req,res)=>{

    const checklist_id = req.params.id

    const {data,error} = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id',checklist_id)

    if(error){
        return res.status(500).json(error)
    }

    res.json(data)

})

/* LIMPAR ITENS (USADO NA EDIÇÃO) */

router.delete('/itens/:id', async (req,res)=>{

const id = req.params.id

await supabase.from('checklist_itens')
.delete()
.eq('checklist_id', id)

await supabase.from('checklist_locais')
.delete()
.eq('checklist_id', id)

res.json({success:true})

})

/*
ESTRUTURA COMPLETA DO AMBIENTE
(ambiente → locais → itens)
*/

router.get('/estrutura/:ambiente_id', async (req,res)=>{

const ambiente_id = req.params.ambiente_id

// buscar ambiente
const {data:ambiente,error:erroAmbiente} = await supabase
.from('ambientes')
.select('*')
.eq('id',ambiente_id)
.single()

if(erroAmbiente){
return res.status(500).json(erroAmbiente)
}

// buscar locais
const {data:locais,error:erroLocais} = await supabase
.from('locais_ambiente')
.select('*')
.eq('ambiente_id',ambiente_id)
.order('ordem')

if(erroLocais){
return res.status(500).json(erroLocais)
}

// buscar itens
const {data:itens,error:erroItens} = await supabase
.from('itens_ambiente')
.select('*')
.eq('ambiente_id',ambiente_id)

if(erroItens){
return res.status(500).json(erroItens)
}

// montar estrutura
const estrutura = {
ambiente,
locais: locais.map(local => ({
...local,
itens: itens.filter(item => item.local_id === local.id)
}))
}

res.json(estrutura)

})

module.exports = router