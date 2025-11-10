# Guía: Usar Supabase API Directamente desde Postman

Esta guía explica cómo usar la API de Supabase Storage directamente desde Postman, sin pasar por el endpoint de Next.js.

## 📋 Requisitos Previos

Necesitas tener estas variables de entorno:
- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (para operaciones administrativas)

**⚠️ IMPORTANTE**: El `SUPABASE_SERVICE_ROLE_KEY` tiene permisos completos. **NUNCA** lo expongas en el cliente. Solo úsalo en el servidor o para pruebas.

---

## 🔐 Autenticación

Supabase usa **Bearer Token** para autenticación. Necesitas agregar el header:

```
Authorization: Bearer TU_SERVICE_ROLE_KEY
```

O también puedes usar:

```
apikey: TU_SERVICE_ROLE_KEY
```

---

## 📤 1. Subir un Archivo PDF al Storage

### Endpoint
```
POST {SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{FILE_PATH}
```

### Ejemplo
```
POST https://tu-proyecto.supabase.co/storage/v1/object/certificates/2024/01/15/CERT-20240115-0001.pdf
```

### Headers
```
Authorization: Bearer TU_SERVICE_ROLE_KEY
apikey: TU_SERVICE_ROLE_KEY
Content-Type: application/pdf
x-upsert: true  (opcional: sobrescribe si existe)
```

### Body
- Selecciona **binary** en Postman
- Selecciona un archivo PDF desde tu computadora

### Ejemplo Completo en Postman

**URL:**
```
https://tu-proyecto.supabase.co/storage/v1/object/certificates/test/certificado-test.pdf
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/pdf
```

**Body:**
- Selecciona `binary`
- Click en `Select File` y elige un PDF

### Respuesta Exitosa (200 OK)
```json
{
  "Key": "certificates/test/certificado-test.pdf"
}
```

### Respuesta de Error (400 Bad Request)
```json
{
  "message": "The resource already exists",
  "statusCode": "409"
}
```

---

## 🔗 2. Generar URL Firmada (Signed URL)

### Endpoint
```
POST {SUPABASE_URL}/storage/v1/object/sign/{BUCKET_NAME}/{FILE_PATH}
```

### Ejemplo
```
POST https://tu-proyecto.supabase.co/storage/v1/object/sign/certificates/2024/01/15/CERT-20240115-0001.pdf
```

### Headers
```
Authorization: Bearer TU_SERVICE_ROLE_KEY
apikey: TU_SERVICE_ROLE_KEY
Content-Type: application/json
```

### Body (JSON)
```json
{
  "expiresIn": 3600
}
```

- `expiresIn`: Tiempo de expiración en segundos (3600 = 1 hora)

### Ejemplo Completo en Postman

**URL:**
```
POST https://tu-proyecto.supabase.co/storage/v1/object/sign/certificates/test/certificado-test.pdf
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "expiresIn": 3600
}
```

### Respuesta Exitosa (200 OK)
```json
{
  "signedURL": "https://tu-proyecto.supabase.co/storage/v1/object/sign/certificates/test/certificado-test.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📥 3. Descargar un Archivo (usando URL Firmada)

Una vez que tengas la URL firmada, puedes descargar el archivo directamente:

### Método
```
GET {SIGNED_URL}
```

### Ejemplo
```
GET https://tu-proyecto.supabase.co/storage/v1/object/sign/certificates/test/certificado-test.pdf?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**No requiere headers adicionales** - la URL firmada ya contiene el token de autenticación.

---

## 📋 4. Listar Archivos en un Bucket

### Endpoint
```
GET {SUPABASE_URL}/storage/v1/object/list/{BUCKET_NAME}
```

### Query Parameters
- `prefix`: Prefijo para filtrar (ej: `2024/01/`)
- `limit`: Número máximo de resultados
- `offset`: Offset para paginación
- `sortBy`: Ordenar por (`name`, `created_at`, `updated_at`, `last_accessed_at`, `metadata`)
- `order`: Orden (`asc` o `desc`)

### Ejemplo
```
GET https://tu-proyecto.supabase.co/storage/v1/object/list/certificates?prefix=2024/01/&limit=10
```

### Headers
```
Authorization: Bearer TU_SERVICE_ROLE_KEY
apikey: TU_SERVICE_ROLE_KEY
```

### Respuesta Exitosa (200 OK)
```json
{
  "name": "certificates",
  "id": "bucket-id",
  "updated_at": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-15T10:00:00Z",
  "last_accessed_at": "2024-01-15T10:00:00Z",
  "metadata": {},
  "objects": [
    {
      "name": "2024/01/15/CERT-20240115-0001.pdf",
      "id": "file-id",
      "updated_at": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-15T10:00:00Z",
      "last_accessed_at": "2024-01-15T10:00:00Z",
      "metadata": {
        "mimetype": "application/pdf",
        "size": 123456
      }
    }
  ]
}
```

---

## 🗑️ 5. Eliminar un Archivo

### Endpoint
```
DELETE {SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{FILE_PATH}
```

### Ejemplo
```
DELETE https://tu-proyecto.supabase.co/storage/v1/object/certificates/2024/01/15/CERT-20240115-0001.pdf
```

### Headers
```
Authorization: Bearer TU_SERVICE_ROLE_KEY
apikey: TU_SERVICE_ROLE_KEY
```

### Respuesta Exitosa (200 OK)
```json
{
  "message": "Successfully deleted"
}
```

---

## 🔄 Flujo Completo: Subir y Obtener URL Firmada

### Paso 1: Subir PDF
```
POST https://tu-proyecto.supabase.co/storage/v1/object/certificates/test/mi-certificado.pdf

Headers:
  Authorization: Bearer TU_SERVICE_ROLE_KEY
  apikey: TU_SERVICE_ROLE_KEY
  Content-Type: application/pdf

Body: binary (selecciona tu archivo PDF)
```

### Paso 2: Generar URL Firmada
```
POST https://tu-proyecto.supabase.co/storage/v1/object/sign/certificates/test/mi-certificado.pdf

Headers:
  Authorization: Bearer TU_SERVICE_ROLE_KEY
  apikey: TU_SERVICE_ROLE_KEY
  Content-Type: application/json

Body:
{
  "expiresIn": 3600
}
```

### Paso 3: Usar la URL Firmada
Copia el `signedURL` de la respuesta y úsalo para descargar el archivo.

---

## 📝 Variables de Entorno en Postman

Para facilitar las pruebas, crea variables en Postman:

### Variables
- `supabase_url`: `https://tu-proyecto.supabase.co`
- `supabase_service_key`: `tu-service-role-key`
- `bucket_name`: `certificates`

### Uso en URLs
```
{{supabase_url}}/storage/v1/object/{{bucket_name}}/test.pdf
```

### Uso en Headers
```
Authorization: Bearer {{supabase_service_key}}
apikey: {{supabase_service_key}}
```

---

## 🧪 Ejemplo de Colección Postman

### Request 1: Subir PDF
```
POST {{supabase_url}}/storage/v1/object/{{bucket_name}}/test/certificado.pdf

Headers:
  Authorization: Bearer {{supabase_service_key}}
  apikey: {{supabase_service_key}}
  Content-Type: application/pdf

Body: binary
```

### Request 2: Generar URL Firmada
```
POST {{supabase_url}}/storage/v1/object/sign/{{bucket_name}}/test/certificado.pdf

Headers:
  Authorization: Bearer {{supabase_service_key}}
  apikey: {{supabase_service_key}}
  Content-Type: application/json

Body:
{
  "expiresIn": 3600
}
```

### Request 3: Descargar PDF
```
GET {{signed_url}}

(No requiere headers - la URL ya tiene el token)
```

---

## ⚠️ Notas Importantes

1. **Service Role Key**: Tiene permisos completos. **NUNCA** lo expongas en el cliente.

2. **URLs Firmadas**: Expiran después del tiempo especificado en `expiresIn`.

3. **Bucket Público vs Privado**:
   - **Público**: Puedes usar `getPublicUrl()` pero cualquiera puede acceder
   - **Privado**: Debes usar `createSignedUrl()` para acceso controlado

4. **Content-Type**: Asegúrate de usar `application/pdf` al subir PDFs.

5. **Rutas**: Las rutas en Supabase Storage son relativas al bucket. No incluyas el nombre del bucket en la ruta del archivo.

---

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"
- Verifica que estás usando el `SERVICE_ROLE_KEY` (bypasea RLS)
- O verifica las políticas RLS del bucket

### Error: "The resource already exists"
- El archivo ya existe. Usa `x-upsert: true` en headers para sobrescribir
- O elimina el archivo primero

### Error: "Invalid API key"
- Verifica que estás usando el `SERVICE_ROLE_KEY` correcto
- Verifica que el header `apikey` está presente

### Error: "Bucket not found"
- Verifica que el bucket `certificates` existe en Supabase
- Verifica que el nombre del bucket es correcto

---

## 📚 Referencias

- [Supabase Storage API Docs](https://supabase.com/docs/reference/javascript/storage)
- [Supabase Storage REST API](https://supabase.com/docs/reference/rest/storage-api)

