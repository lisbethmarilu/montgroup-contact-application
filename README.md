# Certificados Veterinarios

Aplicación web completa para generar y gestionar certificados veterinarios en formato PDF. Construida con Next.js 14, Chakra UI, NextAuth, y Supabase.

## Características

### Públicas
- **Generación de Certificados**: Formulario público para generar certificados veterinarios en PDF
- **Descarga Inmediata**: Los certificados se generan y están disponibles para descarga al instante
- **Diseño Profesional**: PDFs con diseño profesional, campos estructurados y código QR único

### Privadas (requieren autenticación)
- **Dashboard**: Vista de todos los certificados generados con filtros avanzados
- **Gestión de Contactos**: CRUD completo para administrar contactos veterinarios
- **Exportación CSV**: Exporta tus contactos a formato CSV
- **Autenticación Google**: Inicio de sesión seguro con Google OAuth

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Chakra UI
- **Autenticación**: NextAuth con Google Provider
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Validación**: Zod + react-hook-form
- **PDF Generation**: Playwright (HTML → PDF)
- **Deployment**: Vercel-ready

## Prerequisitos

- Node.js 18+ y npm/pnpm
- Cuenta de Supabase
- Google OAuth credentials
- (Opcional) Cuenta de Vercel para deployment

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd montgroup-contact-application
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar Supabase

#### Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Copia las credenciales (URL y anon key)

#### Ejecutar migraciones

Ejecuta el SQL en `supabase/migrations/001_initial_schema.sql` en el SQL Editor de Supabase para crear:
- Tablas: `users`, `accounts`, `sessions`, `certificates`, `contacts`, `cert_counters`
- Funciones: `increment_cert_counter`
- Políticas RLS (Row Level Security)
- Índices y triggers

#### Crear Storage Bucket

1. En Supabase Dashboard, ve a Storage
2. Crea un nuevo bucket llamado `certificates`
3. Configúralo como público o con políticas de acceso según tus necesidades

### 4. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Crea credenciales OAuth 2.0:
   - Tipo: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Para producción: `https://tu-dominio.com/api/auth/callback/google`
5. Copia el Client ID y Client Secret

### 5. Variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secret-seguro-aqui

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
.
├── src/
│   ├── app/                        # App Router (Next.js 14)
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/               # NextAuth endpoints
│   │   │   └── certificates/       # Certificate generation
│   │   ├── dashboard/              # Dashboard privado
│   │   ├── contacts/               # Gestión de contactos
│   │   ├── login/                  # Página de login
│   │   ├── layout.tsx              # Layout raíz
│   │   ├── page.tsx                # Página principal (formulario público)
│   │   └── providers.tsx           # Providers (Chakra, NextAuth)
│   ├── components/                 # Componentes React
│   │   ├── CertificateForm.tsx     # Formulario de certificados
│   │   ├── FiltersBar.tsx          # Barra de filtros
│   │   ├── Navbar.tsx              # Barra de navegación
│   │   ├── PdfSuccessDialog.tsx    # Modal de éxito
│   │   └── ResultBadge.tsx         # Badge de resultado
│   ├── lib/                        # Utilidades
│   │   ├── pdf/                    # PDF generation
│   │   │   ├── generatePdf.ts      # Playwright PDF gen
│   │   │   └── renderCertificateHTML.ts
│   │   ├── validations/            # Schemas Zod
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── csv.ts                  # CSV export
│   │   ├── db.ts                   # Database helpers
│   │   └── supabaseClient.ts       # Supabase client
│   ├── styles/
│   │   └── theme.ts                # Chakra UI theme
│   └── types/
│       └── next-auth.d.ts          # TypeScript types
├── supabase/
│   └── migrations/                 # SQL migrations
├── .env.example                    # Template de variables
├── next.config.js
├── package.json
└── tsconfig.json
```

## Uso

### Generar un Certificado (Público)

1. Abre la aplicación en `/`
2. Completa el formulario con:
   - Datos del paciente (mascota)
   - Datos de la prueba diagnóstica
   - Datos de la veterinaria responsable
3. Haz clic en "Generar Certificado PDF"
4. Descarga el PDF generado

### Dashboard (Requiere Login)

1. Inicia sesión con Google en `/login`
2. Ve al Dashboard en `/dashboard`
3. Filtra certificados por:
   - Nombre de mascota
   - Resultado (NEGATIVO/POSITIVO/INDETERMINADO)
   - Especie
4. Acciones disponibles:
   - Ver detalles
   - Descargar PDF
   - Copiar número de certificado

### Gestión de Contactos

1. Ve a `/contacts`
2. Crea, edita o elimina contactos
3. Exporta todos los contactos a CSV

## Deployment en Vercel

### 1. Conectar repositorio

```bash
# Pushea tu código a GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio
3. Configura las variables de entorno (las mismas de `.env.local`)
4. Despliega

### 3. Actualizar Google OAuth

Agrega tu URL de Vercel a los Authorized redirect URIs en Google Cloud Console:
```
https://tu-app.vercel.app/api/auth/callback/google
```

### 4. Actualizar NEXTAUTH_URL

```env
NEXTAUTH_URL=https://tu-app.vercel.app
```

## Seguridad

### Row Level Security (RLS)

Las políticas RLS en Supabase garantizan que:
- Los certificados públicos pueden ser creados por cualquiera
- Los usuarios solo ven sus propios certificados en el dashboard
- Los contactos son privados por usuario
- No se puede acceder a datos de otros usuarios

### Autenticación

- Rutas protegidas con NextAuth middleware
- Solo usuarios autenticados pueden acceder a `/dashboard` y `/contacts`
- Sesiones almacenadas en Supabase con el adapter oficial

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'user')"

Asegúrate de que:
1. Las variables de entorno están correctamente configuradas
2. Las tablas de NextAuth existen en Supabase
3. El adapter de Supabase está correctamente configurado

### Error al generar PDF

Si Playwright falla en producción:
1. Verifica que `playwright-aws-lambda` esté instalado
2. Asegúrate de que el límite de memoria de Vercel sea suficiente
3. Considera usar una función serverless dedicada

### Certificados no aparecen en el dashboard

Verifica las políticas RLS en Supabase:
```sql
-- Verifica que las políticas existan
SELECT * FROM pg_policies WHERE tablename = 'certificates';
```

## Licencia

MIT

## Soporte

Para reportar problemas o solicitar características, abre un issue en el repositorio.
