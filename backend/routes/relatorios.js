const express = require("express")
const router = express.Router()

const supabase = require("../db")
const PDFDocument = require("pdfkit")

/* RELATÓRIO POR USUÁRIO */

router.get("/usuario/:usuario_id/:ambiente_id", async (req,res)=>{

const usuario_id = req.params.usuario_id
const ambiente_id = req.params.ambiente_id

try{

/* ===== BUSCAR CHECKLISTS ===== */
const {data:checklists,error} = await supabase
.from("checklists")
.select("id, data_br, hora_br, usuario_id")

.eq("usuario_id",usuario_id)
.eq("ambiente_id",ambiente_id)
.order("criado_em",{ascending:false})

if(error){
console.error("ERRO CHECKLIST:", error)
return res.status(500).json(error)
}

if(!checklists || checklists.length === 0){
return res.json([])
}

/* ===== BUSCAR USUÁRIO ===== */
const {data:usuario} = await supabase
.from("usuarios")
.select("username")
.eq("id",usuario_id)
.single()

/* ===== PROCESSAR ===== */
const resultado = []

for(const c of checklists){

/* ITENS DO CHECKLIST */
const {data:itens,error:erroItens} = await supabase
.from("checklist_itens")
.select("status")
.eq("checklist_id", c.id)

if(erroItens){
console.error("ERRO ITENS:", erroItens)
continue
}

/* CONTAR DIVERGÊNCIAS */
let total = 0

if(itens){
for(const item of itens){

const status = (item.status || "").trim().toUpperCase()

if(status !== "OK"){
total++
}

}
}

/* MONTAR OBJETO */
resultado.push({
id: c.id,
data_br: c.data_br,
hora_br: c.hora_br,
usuarios: {
username: usuario?.username || "-"
},
divergencias: total
})

}

res.json(resultado)

}catch(err){

console.error("ERRO GERAL:", err)
res.status(500).json({erro:"Erro ao buscar relatório"})

}

})

/* ===== FUNÇÃO SESSÃO ===== */

function desenharSessao(doc, local, itensLocal){

const startY = doc.y

doc.roundedRect(40, startY, 520, 20, 6).stroke("#cccccc")

doc.fontSize(10)
.text(local.nome_exibicao,50,startY+5)

doc.moveDown(2)

const yHeader = doc.y

doc.font("Helvetica-Bold").fontSize(9)
doc.text("ITEM",50,yHeader)
doc.text("QTD",250,yHeader)
doc.text("STATUS",350,yHeader)

doc.font("Helvetica")
doc.moveDown(0.5)

let zebra = true

itensLocal.forEach(item=>{

const y = doc.y

if(zebra){
doc.rect(40,y-2,520,15).fill("#f2f2f2")
doc.fillColor("black")
}

doc.fillColor(item.status && item.status !== "OK" ? "red" : "black")

doc.text(item.nome_item,50,y)
doc.text(item.quantidade.toString(),250,y)

doc.text(
item.status && item.status !== "OK"
? item.observacao || item.status
: "OK",
350,
y
)

doc.moveDown()
zebra = !zebra

})

doc.fillColor("black")
doc.moveDown(2)

}

/* ===== PDF GERAL TODOS ===== */

router.get("/pdf-geral-todos", async (req,res)=>{

const { inicio, fim } = req.query

try{

let query = supabase
.from("checklists")
.select(`
id,
data_br,
hora_br,
criado_em,
ambiente_id,
usuarios!checklists_usuario_id_fkey(username),
ambientes!checklists_ambiente_id_fkey(codigo,descricao)
`)

/* FILTRO CORRETO */
if(inicio && fim){

const [d1,m1,a1] = inicio.split("/")
const [d2,m2,a2] = fim.split("/")

const inicioISO = `${a1}-${m1}-${d1} 00:00:00`
const fimISO = `${a2}-${m2}-${d2} 23:59:59`

query = query
.gte("criado_em", inicioISO)
.lte("criado_em", fimISO)

}

const {data:checklists,error} = await query
.order("criado_em",{ascending:false})

if(error) return res.status(500).json(error)

/* ===== AGRUPAR ===== */

const grupos = {}
const ambientesComDivergencia = new Set()
const divergenciasPorAmbiente = {}

for(const checklist of checklists){

const codigo = checklist.ambientes.codigo

if(!grupos[codigo]){
grupos[codigo] = []
}

grupos[codigo].push(checklist)

/* buscar itens */
const {data:itens} = await supabase
.from("checklist_itens")
.select("status")
.eq("checklist_id",checklist.id)

if(!divergenciasPorAmbiente[codigo]){
divergenciasPorAmbiente[codigo] = 0
}

if(itens){

let temDivergencia = false

for(const item of itens){

const status = (item.status || "").trim().toUpperCase()

if(status !== "OK"){
divergenciasPorAmbiente[codigo]++
temDivergencia = true
}

}

if(temDivergencia){
ambientesComDivergencia.add(codigo)
}

}

}

/* ===== PDF ===== */

const ambientesOrdenados = Object.keys(grupos).sort()

const doc = new PDFDocument({margin:40})

res.setHeader("Content-Type","application/pdf")
res.setHeader("Content-Disposition","inline; filename=relatorio-geral.pdf")

doc.pipe(res)

/* ===== ÍNDICE ===== */

doc.fontSize(35).text("SENAI Sete Lagoas",{align:"center"})
doc.moveDown(1)

doc.fontSize(25).text("Fundação Zerrenner",{align:"center"})
doc.moveDown(1)

doc.fontSize(30).text("Relatório geral - Checklist",{align:"center"})
doc.moveDown(2)

ambientesOrdenados.forEach((codigo,index)=>{

const y = doc.y

let texto = `${index+1}. Sala   ${codigo}`

if(ambientesComDivergencia.has(codigo)){
doc.fillColor("red")
texto = `x - ${texto}`
}else{
doc.fillColor("green")
texto = `     ${texto}`
}

doc.text(texto,50,y,{goTo: codigo})

})

doc.fillColor("black")
doc.addPage()

/* ===== LOOP ===== */

for(const codigo of ambientesOrdenados){

const lista = grupos[codigo]

doc.addNamedDestination(codigo)

/* CAPA */

doc.fontSize(32).text(`RESUMO DO CHECKLIST`,{align:"center"})
doc.moveDown(2)

doc.fontSize(22).text(`SALA  -  ${codigo}`,{align:"center"})
doc.moveDown(2)

doc.fontSize(15)
.text(`>> Total de checklists realizados: ${lista.length}`,{align:"left"})

doc.moveDown(1)

const totalDiv = divergenciasPorAmbiente[codigo] || 0

doc.fillColor(totalDiv > 0 ? "red" : "green")

doc.text(`>> Total de divergências encontradas: ${totalDiv}`,{align:"left"})

doc.fillColor("black")

doc.addPage()

/* CHECKLISTS */

for(const checklist of lista){

doc.fontSize(14)
.text("SENAI Sete Lagoas - Fundação Zerrenner",{align:"center"})

doc.moveDown(0.5)

doc.fontSize(13)
.text("Relatório de Checklist",{align:"center"})

doc.moveDown()

doc.fontSize(12)
.text(`${checklist.ambientes.codigo} - ${checklist.ambientes.descricao}`,{align:"center"})

doc.moveDown()

doc.fontSize(10).font("Helvetica-Bold")
doc.text(`Checklist realizado por: ${checklist.usuarios.username}`)
doc.text(`Data: ${checklist.data_br} às ${checklist.hora_br}`)

doc.moveDown(2)
doc.font("Helvetica")

const {data:locais} = await supabase
.from("locais_ambiente")
.select("*")
.eq("ambiente_id",checklist.ambiente_id)
.order("ordem")

const {data:itens} = await supabase
.from("checklist_itens")
.select("*")
.eq("checklist_id",checklist.id)

const {data:itensAmbiente} = await supabase
.from("itens_ambiente")
.select("id, local_id, nome_item")
.eq("ambiente_id", checklist.ambiente_id)

for(const local of locais){

const itensLocal = itens.filter(item => {
return itensAmbiente.some(i =>
i.local_id === local.id &&
i.nome_item === item.nome_item
)
})

desenharSessao(doc, local, itensLocal)

}

doc.addPage()

}

}

doc.end()

}catch(err){

console.error(err)
res.status(500).json({erro:"Erro ao gerar PDF geral"})

}

})

/* ===== PDF INDIVIDUAL ===== */

router.get("/pdf/:id", async (req,res)=>{

const checklist_id = req.params.id

try{

const {data:checklist} = await supabase
.from("checklists")
.select(`
id,
data_br,
hora_br,
ambiente_id,
usuarios!checklists_usuario_id_fkey(username),
ambientes!checklists_ambiente_id_fkey(codigo,descricao)
`)
.eq("id",checklist_id)
.single()

if(!checklist){
return res.status(404).json({erro:"Checklist não encontrado"})
}

const {data:locais} = await supabase
.from("locais_ambiente")
.select("*")
.eq("ambiente_id",checklist.ambiente_id)
.order("ordem")

const {data:itens} = await supabase
.from("checklist_itens")
.select("*")
.eq("checklist_id",checklist_id)

const {data:itensAmbiente} = await supabase
.from("itens_ambiente")
.select("id, local_id, nome_item")
.eq("ambiente_id", checklist.ambiente_id)

const doc = new PDFDocument({margin:40})

res.setHeader("Content-Type","application/pdf")
res.setHeader("Content-Disposition","inline; filename=relatorio.pdf")

doc.pipe(res)

/* TÍTULO */

doc.fontSize(14)
.text("SENAI Sete Lagoas - Fundação Zerrenner",{align:"center"})

doc.moveDown(0.5)

doc.fontSize(13)
.text("Relatório de Checklist",{align:"center"})

doc.moveDown()

doc.fontSize(12)
.text(`${checklist.ambientes.codigo} - ${checklist.ambientes.descricao}`,{align:"center"})

doc.moveDown()

doc.fontSize(10).font("Helvetica-Bold")
.text(`Checklist realizado por: ${checklist.usuarios.username}`)
doc.text(`Data: ${checklist.data_br} às ${checklist.hora_br}`)

doc.moveDown(2)
doc.font("Helvetica")

for(const local of locais){

const itensLocal = itens.filter(item => {
return itensAmbiente.some(i =>
i.local_id === local.id &&
i.nome_item === item.nome_item
)
})

desenharSessao(doc, local, itensLocal)

}

doc.end()

}catch(err){
console.error(err)
res.status(500).json({erro:"Erro ao gerar PDF"})
}

})

/* ===== PDF GERAL POR AMBIENTE ===== */

router.get("/pdf-geral/:ambiente_id", async (req,res)=>{

const ambiente_id = req.params.ambiente_id

try{

const {data:checklists,error} = await supabase
.from("checklists")
.select(`
id,
data_br,
hora_br,
ambiente_id,
usuarios!checklists_usuario_id_fkey(username),
ambientes!checklists_ambiente_id_fkey(codigo,descricao)
`)
.eq("ambiente_id", ambiente_id)
.order("criado_em",{ascending:false})

if(error) return res.status(500).json(error)

const doc = new PDFDocument({margin:40})

res.setHeader("Content-Type","application/pdf")
res.setHeader("Content-Disposition","inline; filename=relatorio-ambiente.pdf")

doc.pipe(res)

/* TÍTULO */

doc.fontSize(14)
.text("SENAI Sete Lagoas - Fundação Zerrenner",{align:"center"})

doc.moveDown(0.5)

doc.fontSize(13)
.text("Relatório Geral do Ambiente",{align:"center"})

doc.moveDown()

doc.fontSize(12)
.text(`${checklists[0]?.ambientes.codigo} - ${checklists[0]?.ambientes.descricao}`,{align:"center"})

doc.moveDown(2)

/* LOOP */

for(const checklist of checklists){

doc.fontSize(10).font("Helvetica-Bold")
doc.text(`Usuário: ${checklist.usuarios.username}`)
doc.text(`Data: ${checklist.data_br} às ${checklist.hora_br}`)

doc.moveDown()

const {data:locais} = await supabase
.from("locais_ambiente")
.select("*")
.eq("ambiente_id",checklist.ambiente_id)
.order("ordem")

const {data:itens} = await supabase
.from("checklist_itens")
.select("*")
.eq("checklist_id",checklist.id)

const {data:itensAmbiente} = await supabase
.from("itens_ambiente")
.select("id, local_id, nome_item")
.eq("ambiente_id", checklist.ambiente_id)

for(const local of locais){

const itensLocal = itens.filter(item => {
return itensAmbiente.some(i =>
i.local_id === local.id &&
i.nome_item === item.nome_item
)
})

desenharSessao(doc, local, itensLocal)

}

doc.addPage()

}

doc.end()

}catch(err){
console.error(err)
res.status(500).json({erro:"Erro ao gerar PDF do ambiente"})
}

})

/* EXCLUIR */
/* ===== EXCLUIR CHECKLIST ===== */

router.delete("/excluir/:id", async (req,res)=>{

const id = req.params.id

try{

const {error} = await supabase
.from("checklists")
.delete()
.eq("id",id)

if(error){
return res.status(500).json(error)
}

res.json({success:true})

}catch(err){

console.error(err)
res.status(500).json({erro:"Erro ao excluir checklist"})

}

})

module.exports = router
