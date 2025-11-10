#!/usr/bin/env node

/**
 * Script para generar URLs firmadas de Supabase Storage
 * 
 * Uso:
 *   node scripts/generate-signed-url.js <file-path> [expires-in]
 * 
 * Ejemplos:
 *   node scripts/generate-signed-url.js "2024/01/15/CERT-20240115-0001.pdf"
 *   node scripts/generate-signed-url.js "2024/01/15/CERT-20240115-0001.pdf" 7200
 */

require('dotenv').config({ path: '.env' })

const { createClient } = require('@supabase/supabase-js')

// Validar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucketName = 'certificates'

if (!supabaseUrl) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL no está configurado')
  console.error('   Asegúrate de tener un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurado')
  console.error('   Asegúrate de tener un archivo .env.local con SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('❌ Error: Se requiere la ruta del archivo')
  console.error('')
  console.error('Uso:')
  console.error('  node scripts/generate-signed-url.js <file-path> [expires-in]')
  console.error('')
  console.error('Ejemplos:')
  console.error('  node scripts/generate-signed-url.js "2024/01/15/CERT-20240115-0001.pdf"')
  console.error('  node scripts/generate-signed-url.js "2024/01/15/CERT-20240115-0001.pdf" 7200')
  console.error('')
  console.error('Parámetros:')
  console.error('  file-path:   Ruta del archivo en el bucket (sin el nombre del bucket)')
  console.error('  expires-in:  Tiempo de expiración en segundos (por defecto: 3600 = 1 hora)')
  process.exit(1)
}

const filePath = args[0]
const expiresIn = args[1] ? parseInt(args[1], 10) : 3600

if (isNaN(expiresIn) || expiresIn <= 0) {
  console.error('❌ Error: expires-in debe ser un número positivo')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Limpiar el path (remover prefijo del bucket si existe)
let cleanPath = filePath

async function generateSignedUrl() {
  try {
    console.log('🔐 Generando URL firmada...')
    console.log(`   Bucket: ${bucketName}`)
    console.log(`   Archivo: ${cleanPath}`)
    console.log(`   Expira en: ${expiresIn} segundos (${Math.round(expiresIn / 60)} minutos)`)
    console.log('')

    // Generar URL firmada
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(cleanPath, expiresIn)

    if (error) {
      console.error('❌ Error al generar URL firmada:')
      console.error(`   ${error.message}`)
      
      if (error.message.includes('not found')) {
        console.error('')
        console.error('💡 Sugerencia: Verifica que el archivo existe en el bucket')
        console.error(`   Puedes listar archivos con: node scripts/list-files.js`)
      }
      
      process.exit(1)
    }

    console.log('✅ URL firmada generada exitosamente!')
    console.log('')
    console.log('📋 URL Firmada:')
    console.log('─'.repeat(80))
    console.log(data.signedUrl)
    console.log('─'.repeat(80))
    console.log('')
    console.log('💡 Puedes usar esta URL para descargar el archivo')
    console.log(`   La URL expirará en ${Math.round(expiresIn / 60)} minutos`)
    console.log('')

  } catch (error) {
    console.error('❌ Error inesperado:')
    console.error(error)
    process.exit(1)
  }
}

// Ejecutar
generateSignedUrl()

