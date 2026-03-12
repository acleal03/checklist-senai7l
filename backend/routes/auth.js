const express = require('express')
const router = express.Router()

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const supabase = require('../db')

router.post('/login', async (req,res)=>{

    const {re,senha} = req.body

    const {data,error} = await supabase
        .from('usuarios')
        .select('*')
        .eq('re',re)
        .single()

    if(error){
        return res.status(401).json({erro:"Usuário não encontrado"})
    }

    const usuario = data

    const senhaValida = bcrypt.compareSync(senha, usuario.senha)

    if(!senhaValida){
        return res.status(401).json({erro:"Senha inválida"})
    }

    const token = jwt.sign(
        {id:usuario.id,re:usuario.re},
        process.env.JWT_SECRET,
        {expiresIn:'8h'}
    )

    res.json({
        token,
        usuario
    })

})

module.exports = router