#!/usr/bin/env node

/**
 * Script para listar archivos en el bucket de Supabase Storage
 * 
 * Uso:
 *   node scripts/list-files.js [prefix] [limit]
 * 
 * Ejemplos:
 *   node scripts/list-files.js
 *   node scripts/list-files.js "2024/01/"
 *   node scripts/list-files.js "2024/01/" 20
 */

require('dotenv').config({ path: '.env' })

const { createClient } = require('@supabase/supabase-js')

// Validar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucketName = 'certificates'

if (!supabaseUrl) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL no está configurado')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurado')
  process.exit(1)
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2)
const prefix = args[0] || ''
const limit = args[1] ? parseInt(args[1], 10) : 100

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function listFiles() {
  try {
    console.log('📁 Listando archivos en el bucket...')
    console.log(`   Bucket: ${bucketName}`)
    if (prefix) {
      console.log(`   Prefijo: ${prefix}`)
    }
    console.log(`   Límite: ${limit}`)
    console.log('')

    // Listar archivos
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(prefix, {
        limit,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('❌ Error al listar archivos:')
      console.error(`   ${error.message}`)
      process.exit(1)
    }

    if (!data || data.length === 0) {
      console.log('📭 No se encontraron archivos')
      if (prefix) {
        console.log(`   Con el prefijo: ${prefix}`)
      }
      process.exit(0)
    }

    console.log(`✅ Se encontraron ${data.length} archivo(s):`)
    console.log('')
    console.log('─'.repeat(80))
    
    data.forEach((file, index) => {
        console.log(file)
      const fullPath = prefix ? `${prefix}${file.name}` : file.name
      const sizeKB = file.metadata?.size ? (file.metadata.size / 1024).toFixed(2) : 'N/A'
      const date = file.created_at ? new Date(file.created_at).toLocaleString() : 'N/A'
      
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${fullPath}`)
      console.log(`     Tamaño: ${sizeKB} KB`)
      console.log(`     Creado: ${date}`)
      console.log('')
    })
    
    console.log('─'.repeat(80))
    console.log('')

  } catch (error) {
    console.error('❌ Error inesperado:')
    console.error(error)
    process.exit(1)
  }
}

// Ejecutar
listFiles()

