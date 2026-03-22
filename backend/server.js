require('dotenv').config()

const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const usuariosRoutes = require('./routes/usuarios')
const ambientesRoutes = require('./routes/ambientes')
const checklistRoutes = require('./routes/checklist')

const app = express()

const locaisRoutes = require('./routes/locais')
const itensRoutes = require('./routes/itens')

const relatoriosRoutes = require('./routes/relatorios')

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/usuarios', usuariosRoutes)
app.use('/ambientes', ambientesRoutes)
app.use('/checklist', checklistRoutes)

app.use('/locais', locaisRoutes)
app.use('/itens', itensRoutes)

app.use('/relatorios', relatoriosRoutes)

app.get('/', (req,res)=>{
    res.json({
        sistema:"Checklist SENAI 7L",
        status:"online"
    })
})

const PORT = 3000

app.listen(PORT, ()=>{
    console.log("Servidor rodando na porta "+PORT)
})