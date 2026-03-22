require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if(!supabaseUrl || !supabaseKey){
    console.error("ERRO: Variáveis do Supabase não carregadas.")
    process.exit(1)
}

console.log("Conectando ao Supabase:", supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase