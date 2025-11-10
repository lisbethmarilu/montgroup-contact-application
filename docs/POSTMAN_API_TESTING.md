# Guía para Probar el API con Postman

## 📋 Endpoint: Generar Certificado

### Configuración en Postman

#### 1. **Método y URL**
- **Método**: `POST`
- **URL**: `http://localhost:3000/api/certificates/generate`
  - Para producción: `https://tu-dominio.com/api/certificates/generate`

#### 2. **Headers**
Agrega los siguientes headers:

```
Content-Type: application/json
```

**Nota**: Si quieres asociar el certificado con un usuario autenticado, también necesitas agregar:
```
Cookie: next-auth.session-token=TU_TOKEN_DE_SESION
```

#### 3. **Body (JSON)**
Selecciona `raw` y `JSON` en el body, y usa este ejemplo:

```json
{
  "petName": "Max",
  "species": "Canino",
  "breed": "Labrador Retriever",
  "age": "3 años",
  "sex": "Macho",
  "testType": "Parvovirus",
  "testBrand": "BioVet",
  "testDate": "2024-01-15",
  "result": "NEGATIVO",
  "vetName": "Dr. Juan Pérez",
  "clinicName": "Clínica Veterinaria San Miguel",
  "district": "Lima, San Miguel"
}
```

#### 4. **Valores Válidos**

**species**: `Canino`, `Felino`, `Ave`, `Roedor`, `Reptil`, `Otro`

**sex**: `Macho`, `Hembra`

**result**: `NEGATIVO`, `POSITIVO`, `INDETERMINADO`

**testDate**: Formato `YYYY-MM-DD` (ejemplo: `2024-01-15`)

#### 5. **Respuesta Exitosa (200 OK)**

```json
{
  "success": true,
  "certificateNumber": "CERT-20240115-0001",
  "downloadUrl": "https://tu-proyecto.supabase.co/storage/v1/object/sign/certificates/2024/01/15/CERT-20240115-0001.pdf?..."
}
```

#### 6. **Respuesta de Error (400 Bad Request)**

```json
{
  "success": false,
  "message": "El nombre de la mascota es requerido"
}
```

---

## 📋 Endpoint: Obtener URL Firmada

### Configuración en Postman

#### 1. **Método y URL**
- **Método**: `GET`
- **URL**: `http://localhost:3000/api/certificates/signed-url?path=CERTIFICATE_PATH`

**Ejemplo**:
```
http://localhost:3000/api/certificates/signed-url?path=2024/01/15/CERT-20240115-0001.pdf
```

#### 2. **Headers**
Este endpoint **requiere autenticación**. Necesitas agregar:

```
Cookie: next-auth.session-token=TU_TOKEN_DE_SESION
```

**O** puedes usar el header de autorización si está configurado.

#### 3. **Query Parameters**
- **path** (requerido): Ruta del archivo PDF en el bucket
  - Ejemplo: `2024/01/15/CERT-20240115-0001.pdf`
  - O la URL completa del PDF (el endpoint extraerá el path automáticamente)

#### 4. **Respuesta Exitosa (200 OK)**

```json
{
  "signedUrl": "https://tu-proyecto.supabase.co/storage/v1/object/sign/certificates/2024/01/15/CERT-20240115-0001.pdf?..."
}
```

#### 5. **Respuesta de Error (401 Unauthorized)**

```json
{
  "error": "Unauthorized"
}
```

---

## 🔐 Cómo Obtener el Token de Sesión

### Opción 1: Desde el Navegador (Recomendado)

1. Abre tu aplicación en el navegador: `http://localhost:3000`
2. Inicia sesión con Google
3. Abre las **DevTools** (F12)
4. Ve a la pestaña **Application** (Chrome) o **Storage** (Firefox)
5. Busca **Cookies** → `http://localhost:3000`
6. Copia el valor de la cookie `next-auth.session-token`

### Opción 2: Usar el Network Tab

1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Network**
3. Inicia sesión en la aplicación
4. Busca la petición a `/api/auth/session`
5. En **Headers** → **Request Headers**, copia el valor de `Cookie`

---

## 📝 Colección de Postman

Puedes crear una colección en Postman con estos endpoints:

### Variables de Entorno

Crea variables en Postman:
- `base_url`: `http://localhost:3000`
- `session_token`: (tu token de sesión)

### Ejemplo de Pre-request Script

Para automatizar el uso del token:

```javascript
// En la configuración de la colección, agrega esto en "Pre-request Script"
pm.request.headers.add({
    key: 'Cookie',
    value: `next-auth.session-token=${pm.environment.get('session_token')}`
});
```

---

## 🧪 Ejemplos de Pruebas

### Test 1: Generar Certificado Básico

```json
{
  "petName": "Luna",
  "species": "Felino",
  "breed": "Persa",
  "age": "2 años",
  "sex": "Hembra",
  "testType": "Rabia",
  "testBrand": "VetTest",
  "testDate": "2024-01-20",
  "result": "NEGATIVO",
  "vetName": "Dra. María González",
  "clinicName": "Clínica Felina",
  "district": "Lima, Miraflores"
}
```

### Test 2: Validar Campos Requeridos

Intenta enviar un body vacío o con campos faltantes para ver los mensajes de error:

```json
{
  "petName": ""
}
```

Deberías recibir:
```json
{
  "success": false,
  "message": "El nombre de la mascota es requerido"
}
```

### Test 3: Validar Valores Enum

Intenta enviar valores inválidos:

```json
{
  "petName": "Max",
  "species": "InvalidSpecies",
  "sex": "InvalidSex",
  "result": "INVALID"
}
```

---

## ⚠️ Notas Importantes

1. **El endpoint de generación es público**: No requiere autenticación, pero si estás autenticado, asociará el certificado con tu usuario.

2. **El endpoint de signed-url requiere autenticación**: Debes estar logueado para obtener URLs firmadas.

3. **Las URLs firmadas expiran**: Tienen una validez de 1 hora (3600 segundos).

4. **Formato de fecha**: Usa formato `YYYY-MM-DD` para `testDate`.

5. **El servidor debe estar corriendo**: Asegúrate de que tu aplicación Next.js esté ejecutándose (`npm run dev`).

---

## 🐛 Troubleshooting

### Error: "Failed to upload PDF to storage"
- Verifica que el bucket `certificates` existe en Supabase
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` está configurado correctamente
- Verifica los permisos del bucket

### Error: "Failed to create signed URL"
- Verifica que el archivo se subió correctamente
- Verifica que el path es correcto

### Error: "Unauthorized" en signed-url
- Verifica que tienes una sesión activa
- Verifica que el token de sesión es válido
- Asegúrate de estar logueado en la aplicación

