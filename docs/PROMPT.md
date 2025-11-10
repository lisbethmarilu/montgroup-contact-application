# 🚀 Prompt: “Veterinary Certificate App” (Next.js + Chakra + NextAuth + Supabase)

Quiero que construyas una aplicación web en **Next.js (App Router)** que permita **generar y descargar certificados veterinarios en PDF** desde un formulario público, y un **dashboard privado** (con Google Sign-In) para ver/filtrar/descargar los PDFs generados y administrar un listado de contactos. Usa **Chakra UI** como design system y **Supabase** como base de datos + storage.

## 1) Stack & paquetes

* **Next.js 14+** con App Router, TypeScript, ESLint, Prettier.
* **Chakra UI** (+ @chakra-ui/next-js, @emotion/react, @emotion/styled).
* **react-hook-form + Zod** para formularios/validación.
* **NextAuth** con **GoogleProvider** y **@auth/supabase-adapter** (o el adapter oficial equivalente) para persistir usuarios en Supabase.
* **Supabase** (Postgres) para tablas de certificados y contactos; **Supabase Storage** para guardar PDFs.
* **PDF**: generar desde HTML con **playwright-aws-lambda**/**puppeteer** (server actions/route handler) **o** con **@react-pdf/renderer**. Preferencia: **HTML → PDF con Playwright** para que el certificado se vea igual al diseño Chakra.
* **CSV export**: `json2csv` o util simple para descargar contactos y registros.
* **date-fns** (es-ES) para fechas, **uuid** para ids.

## 2) Rutas y flujo

* **Pública**

  * `GET /` → Formulario “Generar Certificado Veterinario”.
  * `POST /api/certificates/generate` → genera PDF en el servidor, sube a Supabase Storage y responde con URL de descarga + guarda metadatos en DB.
  * Tras generar: muestra **botón Descargar PDF** y **toast** de éxito.
* **Privada (requiere login con Google)**

  * `GET /dashboard` → lista paginada/filtrable de certificados (tabla con búsqueda por nombre, especie, rango de fechas, resultado).

    * Acciones por fila: **ver/descargar PDF**, **copiar Nº de Certificado**, **ver detalle**.
  * `GET /contacts` → CRUD mínimo de contactos (nombre, email, teléfono, distrito, notas).

    * Acciones: **crear/editar/eliminar**, **exportar CSV**.
* **Auth**

  * `GET /login` → botón “Continuar con Google”.
  * `GET /api/auth/*` → NextAuth routes.
* **Error/Loading** states con Chakra (Skeleton/Spinner/Alerts).

## 3) UI (Chakra) — Formulario público

Replica el layout de los screenshots (adjunto referencia visual), con secciones:

* **Datos del Paciente**

  * `petName` (Input)
  * `species` (Select: Canino, Felino, Ave, Roedor, Reptil, Otro)
  * `breed` (Input)
  * `age` (Input o NumberInput con placeholder “Ej: 2 años”)
  * `sex` (Select: Macho, Hembra)
* **Datos de la Prueba**

  * `testType` (Select: Parvovirus, Moquillo, Rabia, Leishmania, etc.)
  * `testBrand` (Input, ej: BioVet)
  * `testDate` (DatePicker)
  * `result` (Select: NEGATIVO, POSITIVO, INDETERMINADO)
* **Veterinaria Responsable**

  * `vetName` (Input, ej: “Dr./Dra. Nombre Completo”)
  * `clinicName` (Input)
  * `district` (Input, ej: “Lima, Miraflores”)
* **CTA** grande centrado: “Generar Certificado PDF”.

Estilo: usa contenedores `Card`/`Box` con `Heading`, `Divider`, `SimpleGrid` (2 cols en desktop, 1 en mobile), `FormControl`/`FormLabel`/`Select`/`Input` y un botón `Button` grande (colorScheme="blue").

## 4) Plantilla del Certificado (HTML → PDF)

* Encabezado azul (#4c6ef5 aprox) con título **“CERTIFICADO DE DESCARTE”** y subtítulo “Prueba Diagnóstica Veterinaria”.
* Bloques con subtítulos de barra clara: **DATOS DEL PACIENTE**, **DATOS DE LA PRUEBA**, **VETERINARIA RESPONSABLE**.
* Campo “**N° Certificado: CERT-YYYYMMDD-####**” (usa fecha + secuencia diaria).
* Caja de **RESULTADO** resaltada en verde claro cuando NEGATIVO; en rojo claro cuando POSITIVO.
* Pie de página: fecha/hora de emisión, texto legal “Este certificado es válido únicamente para la fecha…” y líneas para “Firma del Veterinario” y “Sello de la Clínica”.
* Usa CSS inline compatible con render headless; tipografía sans (Inter/Roboto), tamaños y espaciados como la imagen.

> Aporta un componente util `renderCertificateHTML(data)` que devuelve HTML string listo para convertir a PDF.

## 5) Base de datos (Supabase / Postgres)

Crea migraciones SQL o Prisma schema (si usas Prisma) con:

### Tabla `users` (NextAuth + Adapter)

* id (uuid, pk), name, email (unique), image, created_at

### Tabla `certificates`

* id (uuid, pk)
* certificate_number (text, unique)  // p.ej. CERT-20251109-2466
* pdf_url (text)                      // URL pública/firmada del Storage
* pdf_path (text)                     // ruta en el bucket
* pet_name (text)
* species (text)
* breed (text)
* age (text)
* sex (text)
* test_type (text)
* test_brand (text)
* test_date (date)
* result (text)                       // NEGATIVO | POSITIVO | INDETERMINADO
* vet_name (text)
* clinic_name (text)
* district (text)
* created_by (uuid, fk users.id, null en público)
* created_at (timestamptz default now())

Índices por `created_at`, `certificate_number`, `pet_name`.

### Tabla `contacts`

* id (uuid, pk)
* name (text)
* email (text)
* phone (text)
* district (text)
* notes (text)
* owner_id (uuid fk users.id)
* created_at (timestamptz default now())

### Secuencia diaria para el correlativo

Crea una función/tabla auxiliar `cert_counters (date_key date pk, seq int)` o usa `generated always as identity` con reseteo por fecha. Al generar, garantiza **atomicidad** (transacción) para producir `CERT-YYYYMMDD-####`.

## 6) Storage (Supabase)

* Crea bucket `certificates`.
* Al generar el PDF, súbelo como `certificates/YYYY/MM/DD/{certificate_number}.pdf`.
* Guarda **url firmada** o genera URL pública (mejor firmada con expiración y presigned URL al descargar).

## 7) Seguridad y accesos

* **/ (formulario)**: *público*. Permite generar y descargar el PDF sin login. Si el usuario está autenticado, también asocia `created_by`.
* **/dashboard y /contacts**: *privados*. Usa `middleware.ts` para proteger rutas `/dashboard(.*)` y `/contacts(.*)`.
* Limita las consultas por `created_by` (row-level security opcional con Supabase Policies).
* Evita listar PDFs de otros usuarios.

## 8) Comportamiento de generación

1. Validar con **Zod** en client + server.
2. Route Handler `POST /api/certificates/generate`:

   * Normaliza datos y crea `certificate_number` único (transacción).
   * Renderiza HTML con la plantilla.
   * Genera PDF en server (Playwright headless), guarda archivo temporal y súbelo a Supabase Storage.
   * Inserta registro en `certificates`.
   * Responde `{ certificateNumber, downloadUrl }`.
3. En el cliente, mostrar `Alert` con datos y botón **Descargar PDF**.
4. Agregar un botón “Rellenar de un PDF previo” (opcional: parsear datos si ya existen en DB usando `certificate_number`).

## 9) Dashboard

* Tabla (Chakra `Table`) con columnas:

  * Nº Certificado, Mascota, Especie, Resultado (Badge de color), Fecha prueba, Veterinario, Distrito, Acciones.
* Filtros arriba en un `HStack`: Búsqueda por texto, Rango de fechas, Resultado, Especie.
* Paginación simple (limit/offset).
* Acciones:

  * **Ver** (abre drawer con detalles).
  * **Descargar PDF** (link a URL firmada).
  * **Copiar Nº** (copy to clipboard).

## 10) Contacts

* Tabla CRUD básica con Drawer para Crear/Editar.
* Exportar **CSV** de los contactos visibles (respeta filtros).
* Ruta y API protegidas.

## 11) Variables de entorno

Configura `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=        # para server actions que suben PDFs (o usa user key + RLS policies específicas)
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-long-secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 12) Estructura de carpetas sugerida

```
/app
  /(public)
    /page.tsx                      # Formulario público
    /api/certificates/generate/route.ts
  /(private)
    /dashboard/page.tsx
    /contacts/page.tsx
  /login/page.tsx
/components
  CertificateForm.tsx
  ResultBadge.tsx
  FiltersBar.tsx
  PdfSuccessDialog.tsx
  Navbar.tsx
  Protected.tsx                   # wrapper de sesión
/lib
  supabaseClient.ts
  auth.ts                         # NextAuth config
  pdf/renderCertificateHTML.ts    # devuelve HTML string
  pdf/generatePdf.ts              # html → pdf buffer
  db.ts                           # helpers para inserts/queries
  csv.ts
/styles
  theme.ts                        # tema Chakra (colores, fonts)
```

## 13) Theming (Chakra)

* Fuente base Inter/Roboto.
* ColorScheme `blue` (primary).
* `Heading` grandes, `Card` con `rounded="2xl"` y `shadow="md"`.
* `Container` maxW="6xl".
* Componentes: `Button`, `Input`, `Select`, `Badge`, `Table` con `variant="simple"`.

## 14) Tests y criterios de aceptación

* Puedo **generar un certificado** desde `/` llenando el formulario y obtengo un **PDF** con diseño idéntico (títulos, bloques, caja de **RESULTADO** verde/roja).
* El **PDF** se **sube** a Supabase Storage y queda **registrado** en la tabla `certificates`.
* Puedo **loguearme con Google** y acceder a `/dashboard` y `/contacts`.
* En `/dashboard` veo mis certificados, filtro por fecha/resultado/especie, **descargo** el PDF y copio el Nº.
* En `/contacts` creo/edito/elimino contactos y **descargo CSV**.
* Políticas RLS: solo veo mis datos en vistas privadas.
* Lint + build pasan; proyecto corre con `pnpm dev`.

## 15) Semillas (opcional)

Incluye un script para insertar 5 certificados y 5 contactos ficticios asociados a un usuario demo.

## 16) Instrucciones de uso

* `pnpm i`
* `pnpm dev`
* Registrar Google OAuth, completar `.env.local`.
* Crear tablas/bucket en Supabase y aplicar policies mínimas.
* Probar generación de PDF y subida al bucket.

**Entrega:**

* Proyecto funcional con todo lo anterior, listo para desplegar en Vercel (usa storage Supabase).
* README con pasos de entorno, variables y screenshots.

---

> Nota sobre el PDF: el diseño debe verse como en las imágenes de referencia (cabecera azul, secciones, “RESULTADO: NEGATIVO” en caja verde, pie con fecha/hora y aviso legal). Usa unidades y espaciados para que en A4 quede con márgenes y jerarquías claras.

