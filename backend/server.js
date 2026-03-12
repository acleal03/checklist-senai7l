require('dotenv').config()

const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const usuariosRoutes = require('./routes/usuarios')
const ambientesRoutes = require('./routes/ambientes')
const checklistRoutes = require('./routes/checklist')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/usuarios', usuariosRoutes)
app.use('/ambientes', ambientesRoutes)
app.use('/checklist', checklistRoutes)

app.get('/', (req,res)=>{
    res.json({status:"API CHECKLIST SENAI 7L ONLINE"})
})

const PORT = 3000

app.listen(PORT, ()=>{
    console.log("Servidor rodando na porta "+PORT)
})