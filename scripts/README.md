# Scripts de Utilidad

Scripts para interactuar con Supabase Storage directamente desde la línea de comandos.

## 📋 Requisitos

- Node.js instalado
- Variables de entorno configuradas en `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 🔗 Generar URL Firmada

Genera una URL firmada para descargar un archivo del bucket de Supabase Storage.

### Uso

```bash
npm run generate-url <file-path> [expires-in]
```

O directamente:

```bash
node scripts/generate-signed-url.js <file-path> [expires-in]
```

### Parámetros

- `file-path`: Ruta del archivo en el bucket (sin el nombre del bucket)
- `expires-in`: Tiempo de expiración en segundos (opcional, por defecto: 3600 = 1 hora)

### Ejemplos

```bash
# Generar URL firmada con expiración por defecto (1 hora)
npm run generate-url "2024/01/15/CERT-20240115-0001.pdf"

# Generar URL firmada con expiración de 2 horas (7200 segundos)
npm run generate-url "2024/01/15/CERT-20240115-0001.pdf" 7200

# Generar URL firmada con expiración de 30 minutos (1800 segundos)
npm run generate-url "2024/01/15/CERT-20240115-0001.pdf" 1800
```

### Salida

```
🔐 Generando URL firmada...
   Bucket: certificates
   Archivo: 2024/01/15/CERT-20240115-0001.pdf
   Expira en: 3600 segundos (60 minutos)

✅ URL firmada generada exitosamente!

📋 URL Firmada:
────────────────────────────────────────────────────────────────────────────────
https://tu-proyecto.supabase.co/storage/v1/object/sign/certificates/2024/01/15/CERT-20240115-0001.pdf?token=...
────────────────────────────────────────────────────────────────────────────────

💡 Puedes usar esta URL para descargar el archivo
   La URL expirará en 60 minutos
```

---

## 📁 Listar Archivos

Lista los archivos en el bucket de Supabase Storage.

### Uso

```bash
npm run list-files [prefix] [limit]
```

O directamente:

```bash
node scripts/list-files.js [prefix] [limit]
```

### Parámetros

- `prefix`: Prefijo para filtrar archivos (opcional)
- `limit`: Número máximo de archivos a mostrar (opcional, por defecto: 100)

### Ejemplos

```bash
# Listar todos los archivos (hasta 100)
npm run list-files

# Listar archivos de enero 2024
npm run list-files "2024/01/"

# Listar archivos de una fecha específica
npm run list-files "2024/01/15/"

# Listar archivos con límite personalizado
npm run list-files "2024/01/" 50
```

### Salida

```
📁 Listando archivos en el bucket...
   Bucket: certificates
   Prefijo: 2024/01/
   Límite: 100

✅ Se encontraron 5 archivo(s):

────────────────────────────────────────────────────────────────────────────────
  1. 2024/01/15/CERT-20240115-0001.pdf
     Tamaño: 245.67 KB
     Creado: 15/1/2024, 10:30:00

  2. 2024/01/15/CERT-20240115-0002.pdf
     Tamaño: 238.12 KB
     Creado: 15/1/2024, 11:45:00

...
────────────────────────────────────────────────────────────────────────────────
```

---

## 🔧 Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL no está configurado"

Asegúrate de tener un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Error: "SUPABASE_SERVICE_ROLE_KEY no está configurado"

Verifica que la variable `SUPABASE_SERVICE_ROLE_KEY` esté en tu archivo `.env.local`.

### Error: "not found" al generar URL

El archivo no existe en el bucket. Usa `npm run list-files` para ver los archivos disponibles.

### Error: "Bucket not found"

Verifica que el bucket `certificates` existe en tu proyecto de Supabase.

---

## 💡 Tips

1. **Copiar URL rápidamente**: Puedes redirigir la salida a un archivo:
   ```bash
   npm run generate-url "2024/01/15/CERT-20240115-0001.pdf" > url.txt
   ```

2. **Usar en scripts**: Puedes usar estos scripts en otros scripts de automatización.

3. **Verificar archivos antes de generar URL**: Usa `list-files` para encontrar el path correcto del archivo.

