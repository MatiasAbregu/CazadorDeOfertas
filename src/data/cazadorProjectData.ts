export interface GitHubIssueTemplate {
  id: string;
  module: 'backend' | 'frontend' | 'architecture';
  moduleLabel: string;
  title: string;
  labels: string[];
  summary: string;
  body: string;
}

export const CAZADOR_README_MARKDOWN = `# 🍔 CazadorDeOfertas — Centralizador Inteligente de Descuentos

> **Plataforma centralizadora de promociones y cupones de comida rápida (McDonald’s, Burger King y Mostaza)** orientada a maximizar el ahorro del consumidor mediante ingesta automatizada asistida por IA, estructuración de letra chica, canje en un toque y validación comunitaria en tiempo real.

---

## 📐 1. Arquitectura MVC con Metodología SPEC

El proyecto implementa el patrón **Modelo-Vista-Controlador (MVC)** estructurado bajo la **Metodología SPEC** (*State & Specification, Process & Pipeline, Entities & Endpoints, Components & Client*), asegurando desacoplamiento, trazabilidad estricta y escalabilidad controlada.

\`\`\`
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  CLIENTE / DISPOSITIVO                 │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ HTTP / JSON
                                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CONTROLADORES (Controllers)                              │
│  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌────────────────────────┐  │
│  │ IngestionController     │  │ FeedCatalogController     │  │ InteractionController  │  │
│  │ - Cron Diario           │  │ - Filtros & Búsqueda      │  │ - Canje & Deep Link    │  │
│  │ - Pipeline McDonald's   │  │ - Motor de Recomendación  │  │ - Feedback Loop        │  │
│  │ - Pipeline Burger King  │  │ - Control de Expiración   │  │ - Reporte Comunitario  │  │
│  │ - Pipeline Mostaza      │  │ - Semáforo de Validez     │  │ - Registro de Apertura │  │
│  └────────────┬────────────┘  └─────────────┬─────────────┘  └───────────┬────────────┘  │
└───────────────┼─────────────────────────────┼────────────────────────────┼───────────────┘
                │                             │                            │
                ▼                             ▼                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                  MODELOS & SERVICIOS (Models)                            │
│  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌────────────────────────┐  │
│  │ SPEC Process / Pipeline │  │ SPEC State & Rules        │  │ SPEC Entities & Storage│  │
│  │ - Scraper / Fetcher     │  │ - Upsert & Deduplicación  │  │ - Oferta               │  │
│  │ - OCR Engine (Vision)   │  │ - Expiración Pasiva       │  │ - Marca (McD, BK, Mos) │  │
│  │ - LLM Parser & Normalizer│ │ - Scoring & Semáforo      │  │ - Restricción / Cupón  │  │
│  │ - Validador de Esquemas │  │ - Umbrales de Reportes    │  │ - Feedback / Reporte   │  │
│  └─────────────────────────┘  └───────────────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │ Rendering / JSON Response
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   VISTAS & COMPONENTES (Views)                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Feed Visual Unificado (Mobile-First) · Ficha Detallada · Botón de Canje Rápido      │  │
│  │ Bucle de Retroalimentación Inmediata · Semáforo Público · Onboarding Preferencias   │  │
│  └─────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

### 🧩 Desglose Metodológico SPEC (Specification-Driven MVC)

| Pilar SPEC | Capa MVC | Responsabilidad | Implementación Técnica |
| :--- | :--- | :--- | :--- |
| **S - State & Specification** | **Model (Reglas y Estado)** | Definición de esquemas de datos, invariantes de negocio, ciclo de vida de la oferta y reglas de estado. | Esquemas Zod/TypeScript, validación de clave única (\`marca + slug_titulo\`), reglas de expiración pasiva y cálculo de estado semáforo (\`VERIFICADA\`, \`DUDOSA\`, \`EXPIRADA\`). |
| **P - Process & Pipeline** | **Model (Servicios de Ingesta)** | Orquestación de captura de datos crudos (HTML/JSON), OCR para piezas gráficas y parseo semántico con LLM. | Worker cron diario, scrapers por marca, pipeline multimodales de OCR y LLM Structured Outputs para extraer beneficios y letra chica. |
| **E - Entities & Endpoints** | **Model & Controller (Contratos)** | Entidades persistentes de dominio y contratos RESTful de comunicación entre capas. | Entidades relacionales (\`Offer\`, \`Brand\`, \`Restriction\`, \`FeedbackLog\`) y endpoints (\`GET /api/feed\`, \`POST /api/offers/:id/redeem\`, \`POST /api/offers/:id/feedback\`). |
| **C - Components & Client** | **View & Presentation** | Componentes de interfaz reactiva, adaptabilidad móvil, microinteracciones y captura ágil de preferencias. | Vistas mobile-first, tarjetas de oferta con cálculo de ahorro visible, botón 1-touch para copiado de cupón y widget de feedback post-canje. |

---

## 🗂️ 2. Estructura de Directorios del Repositorio

\`\`\`bash
CazadorDeOfertas/
├── src/
│   ├── models/                       # [SPEC - State, Entities & Specifications]
│   │   ├── entities/
│   │   │   ├── Offer.ts              # Entidad principal de oferta estructurada
│   │   │   ├── Brand.ts              # Marcas soportadas (McDonalds, BurgerKing, Mostaza)
│   │   │   ├── Restriction.ts        # Reglas de uso, letra chica y medios de pago
│   │   │   └── FeedbackReport.ts     # Reportes y calificaciones de la comunidad
│   │   ├── schemas/                  # Validaciones de especificación (Zod / JSON Schema)
│   │   │   ├── offerSchema.ts
│   │   │   └── feedbackSchema.ts
│   │   └── services/                 # [SPEC - Process & Pipeline]
│   │       ├── pipeline/
│   │       │   ├── ingestionRunner.ts   # Orquestador del pipeline programado
│   │       │   ├── scrapers/            # Scrapers específicos por marca
│   │       │   │   ├── mcdonaldsScraper.ts
│   │       │   │   ├── burgerKingScraper.ts
│   │       │   │   └── mostazaScraper.ts
│   │       │   ├── ocrService.ts        # Extracción de texto desde imágenes y cuponeras PDF
│   │       │   └── llmParserService.ts  # Normalización semántica de letra chica con LLM
│   │       └── catalog/
│   │           ├── deduplicationService.ts # Generación de hash único y Upsert
│   │           └── expirationService.ts    # Motor de caducidad pasiva y control de estado
│   │
│   ├── controllers/                  # [Controllers MVC]
│   │   ├── ingestionController.ts    # Disparador y estado de ingesta de datos
│   │   ├── catalogController.ts      # Consulta de catálogo, búsqueda y filtros
│   │   ├── recommendationController.ts # Reglas de ordenamiento según preferencias del usuario
│   │   └── interactionController.ts  # Registro de canjes, deep links y bucle de feedback
│   │
│   ├── views/                        # [SPEC - Components & Client / UI]
│   │   ├── components/
│   │   │   ├── OfferCard.tsx         # Tarjeta de oferta con ahorro y botón de canje
│   │   │   ├── OfferDetailsModal.tsx # Ficha con letra chica y última verificación
│   │   │   ├── FilterBar.tsx         # Filtros por marca, medio de pago y precio
│   │   │   ├── PreferenceModal.tsx   # Captura ágil de hasta 3 categorías
│   │   │   ├── FeedbackWidget.tsx    # Bucle "¿Te funcionó?" al volver
│   │   │   ├── ValidityBadge.tsx     # Semáforo de validez pública
│   │   │   └── ReportModal.tsx       # Reporte de oferta vencida
│   │   ├── pages/
│   │   │   ├── FeedPage.tsx          # Vista principal unificada
│   │   │   └── NotFoundPage.tsx
│   │   └── hooks/
│   │       ├── useOffersFeed.ts
│   │       └── useUserPreferences.ts # Persistencia local de preferencias sin login
│   │
│   └── config/
│       ├── database.ts
│       └── env.ts
├── tests/                            # Pruebas unitarias y de integración del pipeline
├── docs/                             # Especificaciones funcionales y de arquitectura
├── README.md
└── package.json
\`\`\`

---

## 🚀 3. Alcance del MVP y Decálogo de Características

### Módulo 1: Administración (Backend & Control de Datos)
1. **Pipeline de Ingesta Asistido y Automatizado:** Ejecución programada diaria sobre canales públicos de McDonald’s, Burger King y Mostaza, con fallback para carga asistida por imágenes.
2. **Parser y Filtro de Restricciones vía LLM:** Extracción quirúrgica a JSON estandarizado (marca, producto, precio de lista, precio promo, % ahorro, código, vigencia y restricciones).
3. **Módulo OCR para Promociones Gráficas:** Lectura de flyers e imágenes de cuponeras para no perder promociones no publicadas en texto plano.
4. **Motor de Deduplicación y Upsert en BD:** Clave única determinística (\`marca + slug_titulo\`) para evitar duplicados en lecturas consecutivas.
5. **Motor de Expiración Pasiva y Control de Estado:** Baja inmediata del catálogo al cumplirse la fecha límite o al alcanzar umbral crítico de fallos reportados.

### Módulo 2: Cliente (Frontend & Experiencia de Usuario)
6. **Captura Ágil de Preferencias:** Selección express de hasta 3 categorías y zona geográfica al ingresar, almacenada localmente sin requerir registro ni contraseña.
7. **Feed Visual Unificado:** Catálogo diario mobile-first con buscador por texto y filtros rápidos (marca, medio de pago, rango de precio).
8. **Motor de Recomendación por Reglas:** Priorización de ofertas afines con badges explicativos (*"Coincide con tu preferencia por #Hamburguesas"*).
9. **Ficha Detallada de Oferta:** Información transparente con porcentaje de ahorro real, precio final, vigencia estricta, letra chica desglosada y timestamp de verificación.
10. **Canje Rápido en Un Toque:** Botón de acción directa que copia el código al portapapeles y redirige mediante enlace profundo (deep link) hacia la web o app del comercio.
11. **Bucle de Retroalimentación Inmediata (Feedback Loop):** Calificación rápida (*"Me funcionó / No me funcionó"*) al reingresar a la plataforma, alimentando el semáforo público de validez.
12. **Reporte Comunitario:** Formulario ligero para reportar datos erróneos o promociones caídas.

---

## 🚫 4. Funcionalidades Excluidas (Fuera de Alcance del MVP)

Para garantizar un ciclo de desarrollo ágil y validar la hipótesis central sin fricción, se excluyen justificadamente:
- **Cuentas de usuario y autenticación con contraseña/social login:** Se prioriza la exploración inmediata sin barreras de entrada; preferencias guardadas localmente.
- **Carrito propio, checkout o procesamiento de pagos:** La plataforma es un recomendador y canalizador; la transacción ocurre exclusivamente en el comercio oficial.
- **Alertas push y notificaciones en tiempo real:** Se prioriza el tráfico orgánico pasivo antes de introducir sobrecarga de infraestructura.
- **Geolocalización GPS activa:** Se reemplaza por selector manual de zona para reducir costos y complejidad de SDKs cartográficos.
- **Backoffice B2B, repartidores o delivery propio:** El foco absoluto es la experiencia del consumidor final.

---

## 🛠️ 5. Puesta en Marcha Local

\`\`\`bash
# Clonar el repositorio
git clone https://github.com/MatiasAbregu/CazadorDeOfertas.git
cd CazadorDeOfertas

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en entorno de desarrollo
npm run dev

# Ejecutar tests del pipeline de ingesta
npm run test
\`\`\`

---

## 👥 Equipo y Metodología
Desarrollado bajo la metodología **SPEC** y principios de diseño centrado en el usuario.
`;

export const CAZADOR_ISSUES: GitHubIssueTemplate[] = [
  {
    id: 'ISSUE-01',
    module: 'backend',
    moduleLabel: 'Módulo 1: Backend',
    title: '[BE-01] Pipeline de Ingesta Automatizado y Asistido para McDonald\'s, Burger King y Mostaza',
    labels: ['backend', 'mvp', 'pipeline', 'scraping'],
    summary: 'Construir el pipeline programado diario para recolectar promociones crudas de las 3 marcas seleccionadas.',
    body: `### 📋 Contexto del Requerimiento
Como sistema centralizador de ofertas, necesitamos recolectar periódicamente la información pública de promociones de las tres marcas principales de comida rápida (**McDonald’s, Burger King y Mostaza**) sin requerir intervención manual constante.

### 🎯 Objetivos de la Tarea
- Implementar un runner programado (cron job / scheduled task) que se ejecute una vez al día o bajo demanda.
- Conectores modulares de scraping para las fuentes oficiales web / canales digitales de las 3 marcas.
- Permitir un modo de contingencia o ingesta asistida mediante carga de imágenes/capturas en caso de bloqueo técnico temporal.

### 📐 Especificación Técnica (SPEC - Process & Pipeline)
- **Ubicación:** \`src/models/services/pipeline/ingestionRunner.ts\` y \`src/models/services/pipeline/scrapers/\`
- **Marcas cubiertas:**
  1. \`mcdonaldsScraper.ts\`
  2. \`burgerKingScraper.ts\`
  3. \`mostazaScraper.ts\`
- **Salida:** Datos crudos estructurados temporalmente (\`raw_content\`, \`source_url\`, \`brand_id\`, \`timestamp\`).

### ✅ Criterios de Aceptación
- [ ] El pipeline ejecuta la extracción de las 3 marcas de forma secuencial o paralela controlada.
- [ ] Registra fecha, hora y resultado de cada ejecución en un log de ingesta (\`IngestionLog\`).
- [ ] Maneja timeouts y errores de red sin detener el proceso de las marcas restantes.
- [ ] Admite una interfaz de contingencia para inyectar payloads de prueba manualmente.`,
  },
  {
    id: 'ISSUE-02',
    module: 'backend',
    moduleLabel: 'Módulo 1: Backend',
    title: '[BE-02] Extracción de Promociones desde Imágenes y Documentos mediante OCR',
    labels: ['backend', 'ai', 'ocr', 'mvp'],
    summary: 'Procesar banners gráficos, flyers y PDFs de cuponeras para extraer texto de promociones que no están en HTML.',
    body: `### 📋 Contexto del Requerimiento
Gran parte de los descuentos de cadenas como Mostaza o McDonald's son publicados exclusivamente como piezas gráficas (flyers en redes sociales o cuponeras en PDF). Para no perder estas promociones, el MVP debe incorporar OCR.

### 🎯 Objetivos de la Tarea
- Integrar un servicio de reconocimiento óptico de caracteres (OCR) para leer texto dentro de imágenes JPG/PNG y documentos PDF vinculados.
- Extraer texto de títulos, precios impresos, legales al pie y códigos promocionales visibles.

### 📐 Especificación Técnica (SPEC - Process & Pipeline)
- **Ubicación:** \`src/models/services/pipeline/ocrService.ts\`
- **Entrada:** URLs o buffers de imágenes y PDFs detectados durante el scraping.
- **Salida:** Texto plano extraído con metadatos de confianza y coordenadas básicas.
- **Fallback:** En caso de baja resolución o fallo de lectura, marcar la pieza para revisión humana.

### ✅ Criterios de Aceptación
- [ ] Procesa imágenes estándar de banners y flyers promocionales.
- [ ] Extrae con precisión números de precios (ej. \`$4.500\`), porcentajes (\`30% OFF\`) y vigencias (\`Hasta el 31/10\`).
- [ ] Entrega el texto limpio como entrada para el Parser LLM.`,
  },
  {
    id: 'ISSUE-03',
    module: 'backend',
    moduleLabel: 'Módulo 1: Backend',
    title: '[BE-03] Parser, Estructurador Semántico y Filtro de Restricciones vía LLM',
    labels: ['backend', 'ai', 'llm', 'mvp'],
    summary: 'Convertir datos crudos y texto OCR en objetos JSON estandarizados con beneficios y condiciones normalizadas.',
    body: `### 📋 Contexto del Requerimiento
Cada marca expresa sus promociones con distinta sintaxis (precios tachados, 2x1, combos, descuentos bancarios, cupones de app). Se requiere un LLM para interpretar las condiciones de la "letra chica" y generar un JSON estándar.

### 🎯 Objetivos de la Tarea
- Procesar el texto crudo y resultados de OCR mediante IA estructurante.
- Extraer campos con precisión:
  - Marca
  - Nombre del producto / combo
  - Precio de lista (original)
  - Precio promocional
  - Porcentaje de ahorro calculado
  - Código del cupón (si aplica)
  - Fecha exacta de expiración
  - Restricciones específicas (días válidos, medios de pago, sucursales adheridas, límite de 1 por persona).

### 📐 Especificación Técnica (SPEC - State & Specification)
- **Ubicación:** \`src/models/services/pipeline/llmParserService.ts\`
- **Esquema de salida:** Validado estrictamente con Zod (\`offerSchema.ts\`).
- Los datos ausentes o ambiguos se rotulan como \`null\` o \`no_especificado\`, sin inferencias inventadas.

### ✅ Criterios de Aceptación
- [ ] El parser devuelve siempre un JSON que satisface el contrato \`Offer\`.
- [ ] Diferencia claramente el tipo de beneficio: precio final, porcentaje, producto gratis, cupón de app o beneficio bancario.
- [ ] Genera un resumen conciso de 1-2 oraciones comprensible para el usuario final.
- [ ] Almacena el fragmento del texto original como trazabilidad de auditoría.`,
  },
  {
    id: 'ISSUE-04',
    module: 'backend',
    moduleLabel: 'Módulo 1: Backend',
    title: '[BE-04] Motor de Deduplicación, Generación de Clave Única y Lógica de Upsert en BD',
    labels: ['backend', 'database', 'data-integrity', 'mvp'],
    summary: 'Evitar duplicados en lecturas diarias y actualizar ofertas existentes mediante una clave compuesta.',
    body: `### 📋 Contexto del Requerimiento
Dado que el pipeline de ingesta se ejecuta diariamente sobre las mismas páginas, es imprescindible evitar que se creen fichas repetidas de una misma promoción.

### 🎯 Objetivos de la Tarea
- Diseñar un generador determinístico de clave única para cada oferta: \`hash(brand_id + slug_producto + beneficio_principal)\`.
- Implementar la lógica de Upsert en base de datos:
  - Si la clave ya existe: actualizar fecha de última verificación, precio y condiciones si cambiaron.
  - Si la clave no existe: crear nuevo registro activo con fecha de alta.

### 📐 Especificación Técnica (SPEC - State & Database)
- **Ubicación:** \`src/models/services/catalog/deduplicationService.ts\`
- **Índice único:** \`offers_unique_dedup_key\`
- **Optimización:** Respuesta de consulta de alta velocidad para la alimentación del feed.

### ✅ Criterios de Aceptación
- [ ] Dos lecturas idénticas de la misma oferta no generan duplicados en el catálogo.
- [ ] Si una oferta existente sufre una actualización de precio o vigencia, se actualiza el registro conservando su historial.
- [ ] Se registra la fecha y hora de la última comprobación técnica exitosa.`,
  },
  {
    id: 'ISSUE-05',
    module: 'backend',
    moduleLabel: 'Módulo 1: Backend',
    title: '[BE-05] Motor de Reglas de Expiración Pasiva y Control de Estado del Catálogo',
    labels: ['backend', 'logic', 'mvp'],
    summary: 'Ocultar automáticamente ofertas con fecha de vigencia vencida o que superen el umbral de reportes comunitarios.',
    body: `### 📋 Contexto del Requerimiento
Para mantener la confianza de los usuarios, el catálogo público nunca debe exhibir ofertas que ya vencieron o que la comunidad reportó reiteradamente como inválidas.

### 🎯 Objetivos de la Tarea
- Crear un motor de reglas que evalúe periódicamente el estado de las ofertas:
  1. **Expiración temporal pasiva:** Si \`current_date > expiration_date\`, pasar estado a \`EXPIRADA\` e invisibilizar del feed público.
  2. **Control por reportes comunitarios:** Si una oferta acumula un umbral de reportes negativos (\`negative_feedback >= 3\` o \`validity_score < 0.4\`), suspender su visibilidad de forma automática.
- Mantener métricas del motivo de baja para retroalimentar la calidad de las fuentes.

### 📐 Especificación Técnica (SPEC - State & Catalog Rules)
- **Ubicación:** \`src/models/services/catalog/expirationService.ts\`
- **Estados de oferta:** \`ACTIVA\`, \`EN_REVISION\`, \`SUSPENDIDA_POR_REPORTES\`, \`EXPIRADA\`.

### ✅ Criterios de Aceptación
- [ ] Las ofertas vencidas por calendario dejan de ser devueltas en la API del feed inmediatamente.
- [ ] Las ofertas con 3 o más reportes consecutivos de "No me funcionó" cambian a estado de alerta o se ocultan.
- [ ] Los endpoints públicos solo devuelven ofertas con estado \`ACTIVA\`.`,
  },
  {
    id: 'ISSUE-06',
    module: 'frontend',
    moduleLabel: 'Módulo 2: Cliente',
    title: '[FE-01] Captura Ágil de Preferencias y Selección de Zona (Onboarding sin Login)',
    labels: ['frontend', 'ux', 'mvp'],
    summary: 'Permitir al usuario indicar hasta 3 preferencias de comida y zona geográfica sin obligarlo a registrarse.',
    body: `### 📋 Contexto del Requerimiento
Para reducir la fricción al mínimo absoluto, el MVP excluye el registro y login con contraseñas. El usuario debe poder ingresar, indicar rápidamente sus preferencias gastronómicas y ver ofertas afines de inmediato.

### 🎯 Objetivos de la Tarea
- Diseñar una vista/modal de bienvenida ligero al primer acceso.
- Permitir seleccionar hasta 3 categorías estáticas (ej. *Hamburguesas Clásicas*, *Combos Familiares*, *Postres/Helados*, *Opciones Vegetarianas*).
- Permitir seleccionar manualmente la zona geográfica (ej. *Córdoba Capital*, *CABA*, *GBA*, *Rosario*).
- Persistir las preferencias localmente en \`localStorage\` / sesión del navegador.

### 📐 Especificación Técnica (SPEC - Components & Client)
- **Componentes:** \`src/views/components/PreferenceModal.tsx\`, \`src/views/hooks/useUserPreferences.ts\`
- **Modo:** No bloqueante (se puede omitir o editar en cualquier momento desde el encabezado).

### ✅ Criterios de Aceptación
- [ ] El usuario puede guardar sus 3 categorías y zona con 2 toques.
- [ ] No solicita email, teléfono ni contraseñas.
- [ ] Las preferencias se aplican inmediatamente al ordenamiento del catálogo en la sesión actual.`,
  },
  {
    id: 'ISSUE-07',
    module: 'frontend',
    moduleLabel: 'Módulo 2: Cliente',
    title: '[FE-02] Feed Visual Unificado Mobile-First con Buscador y Filtros de Restricción',
    labels: ['frontend', 'ui', 'mobile-first', 'mvp'],
    summary: 'Construir la pantalla principal optimizada para smartphones con búsqueda y filtros combinados.',
    body: `### 📋 Contexto del Requerimiento
El valor central del producto es reunir en una sola pantalla las ofertas de McDonald's, Burger King y Mostaza, permitiendo filtrar por condiciones reales de compra.

### 🎯 Objetivos de la Tarea
- Desarrollar la vista principal (\`FeedPage\`) orientada a navegación móvil con scroll fluido.
- Buscador reactivo por nombre de producto o combo.
- Barra de filtros rápidos:
  - Marca: McDonald's, Burger King, Mostaza.
  - Medio de pago: Efectivo, Tarjetas bancarias, Billeteras virtuales (Mercado Pago, MODO).
  - Rango de precio: Menor a $3.000, $3.000-$6.000, más de $6.000.

### 📐 Especificación Técnica (SPEC - Components & Presentation)
- **Componentes:** \`src/views/pages/FeedPage.tsx\`, \`src/views/components/FilterBar.tsx\`, \`src/views/components/OfferCard.tsx\`
- **Diseño:** Estética limpia, modo oscuro/claro de alto contraste, tipografía legible y badges visibles.

### ✅ Criterios de Aceptación
- [ ] Las tarjetas cargan rápido y muestran marca, foto/icono, título, precio promocional y porcentaje de descuento.
- [ ] Los filtros se combinan sin recargar la página.
- [ ] Se muestra un estado vacío elegante si ninguna oferta coincide con los filtros aplicados.`,
  },
  {
    id: 'ISSUE-08',
    module: 'frontend',
    moduleLabel: 'Módulo 2: Cliente',
    title: '[FE-03] Capa de Recomendación y Priorización Personalizada basada en Reglas',
    labels: ['frontend', 'algorithm', 'mvp'],
    summary: 'Ordenar las ofertas priorizando las preferencias del usuario e indicar transparentemente el motivo.',
    body: `### 📋 Contexto del Requerimiento
Para evitar la sobrecarga informativa, el feed no debe ser un listado plano arbitrario, sino priorizar las opciones que coinciden con los gustos declarados por la persona.

### 🎯 Objetivos de la Tarea
- Implementar un algoritmo de ordenamiento en cliente/controlador basado en reglas lógicas (evitando modelos pesados de ML en esta etapa inicial).
- Asignar peso a las ofertas que contengan las etiquetas de las 3 categorías seleccionadas por el usuario.
- Añadir un badge visual explicativo que justifique la sugerencia (ej. *"✨ Coincide con tu preferencia por #Hamburguesas"* o *"🔥 Destacado para tu zona"*).

### 📐 Especificación Técnica (SPEC - State & Controllers)
- **Ubicación:** \`src/controllers/recommendationController.ts\`
- **Transparencia algorítmica:** El usuario siempre comprende por qué una oferta aparece primero.

### ✅ Criterios de Aceptación
- [ ] Las ofertas que coinciden con las preferencias del usuario se posicionan en los primeros lugares del feed.
- [ ] Cada oferta priorizada luce su etiqueta explicativa correspondiente.
- [ ] El usuario puede alternar entre orden "Recomendados para ti" y "Mayor descuento" o "Más recientes".`,
  },
  {
    id: 'ISSUE-09',
    module: 'frontend',
    moduleLabel: 'Módulo 2: Cliente',
    title: '[FE-04] Ficha Detallada de la Oferta con Desglose de Letra Chica y Verificación Técnica',
    labels: ['frontend', 'ui', 'mvp'],
    summary: 'Diseñar el modal/detalle con toda la información crítica: ahorro, vigencia, requisitos y timestamp de verificación.',
    body: `### 📋 Contexto del Requerimiento
Los usuarios se frustran cuando van al local o a la app y se enteran de condiciones imprevistas. La ficha detallada debe brindar total transparencia sobre los términos y vigencia de cada cupón.

### 🎯 Objetivos de la Tarea
- Crear el componente modal o vista expandida (\`OfferDetailsModal\`).
- Desglose estructurado de:
  - Ahorro real calculado (Precio original vs. Precio final).
  - Fecha exacta de inicio y fin de vigencia.
  - Letra chica: sucursales no adheridas, días válidos, medios de pago exclusivos.
  - Requisitos previos: si exige tener instalada la app oficial, cuenta registrada o cupón impreso.
  - Timestamp con fecha y hora de la última verificación técnica automática.

### 📐 Especificación Técnica (SPEC - Components & Presentation)
- **Componente:** \`src/views/components/OfferDetailsModal.tsx\`
- **Integridad:** Presenta datos directos del parser LLM validados contra el texto original.

### ✅ Criterios de Aceptación
- [ ] Muestra de forma destacada el ahorro en dinero y en porcentaje.
- [ ] Advierte claramente si el enlace redirige a una landing general o exige app propietaria.
- [ ] Muestra el estado del semáforo de validación comunitaria.`,
  },
  {
    id: 'ISSUE-09B',
    module: 'frontend',
    moduleLabel: 'Módulo 2: Cliente',
    title: '[FE-05] Mecanismo de Canje Rápido en 1 Toque: Copiado de Cupón y Deep Link Oficial',
    labels: ['frontend', 'ux', 'feature', 'mvp'],
    summary: 'Botón de acción que copia el código al portapapeles y abre la web o aplicación nativa del comercio.',
    body: `### 📋 Contexto del Requerimiento
El objetivo del producto es reducir al mínimo el tiempo y la fricción entre descubrir una oferta y canjearla en la plataforma del restaurante.

### 🎯 Objetivos de la Tarea
- Diseñar el botón de acción principal de la tarjeta de oferta: *"Canjear Oferta"*.
- Al presionarlo:
  1. Si la oferta tiene código de descuento, copiarlo automáticamente al portapapeles del dispositivo y mostrar notificación flotante ("¡Código copiado!").
  2. Registrar la métrica de apertura en el servidor (\`POST /api/offers/:id/redeem\`).
  3. Redirigir mediante enlace comprobado o deep link a la app/sitio oficial de McDonald's, Burger King o Mostaza.

### 📐 Especificación Técnica (SPEC - Controller & Component)
- **Ubicación:** \`src/views/components/OneTouchRedeemButton.tsx\` y \`src/controllers/interactionController.ts\`
- **Comprobación de enlace:** Validar que el destino esté activo y no sea un enlace roto.

### ✅ Criterios de Aceptación
- [ ] El código promocional se copia al portapapeles en el 100% de los casos compatibles.
- [ ] Se abre la URL de origen comprobada en una nueva pestaña o deep link nativo.
- [ ] Se registra la intención de canje para análisis de conversión del MVP.`,
  },
  {
    id: 'ISSUE-10',
    module: 'frontend',
    moduleLabel: 'Módulo 2: Cliente',
    title: '[FE-06] Bucle de Retroalimentación Inmediata (Feedback Loop) y Semáforo de Validez',
    labels: ['frontend', 'community', 'feedback', 'mvp'],
    summary: 'Preguntar al usuario si la oferta funcionó al regresar a la app para alimentar el semáforo público.',
    body: `### 📋 Contexto del Requerimiento
Para validar la segunda promesa del MVP (*"¿La persona encontró la promoción en el destino y le sirvió?"*), se requiere un bucle de retroalimentación social no invasivo.

### 🎯 Objetivos de la Tarea
- Detectar cuando el usuario regresa a la pestaña o ventana de CazadorDeOfertas luego de haber hecho clic en "Canjear Oferta".
- Presentar un micro-widget flotante de calificación instantánea:
  - *"¿Pudiste aprovechar esta oferta?"* ➔ Botones: \`👍 Sí, me funcionó\` | \`👎 No funcionó / Vencida\` | \`⭐ Me interesa para más tarde\`
- Enviar el voto al servidor para calcular el score de confiabilidad.
- Mostrar en cada tarjeta un indicador semáforo:
  - 🟢 **Verde:** Funcionando (alta tasa de éxito reciente).
  - 🟡 **Amarillo:** Pocas verificaciones o reportes mixtos.
  - 🔴 **Rojo / Alerta:** En revisión técnica por reportes recientes.

### 📐 Especificación Técnica (SPEC - Process & Presentation)
- **Componentes:** \`src/views/components/FeedbackWidget.tsx\`, \`src/views/components/ValidityBadge.tsx\`
- **Impacto:** Retroalimenta de inmediato el Motor de Expiración Pasiva (Issue [BE-05]).

### ✅ Criterios de Aceptación
- [ ] El widget aparece amigablemente tras la vuelta del usuario sin tapar el feed.
- [ ] El voto computa en un solo toque y desaparece con animación de agradecimiento.
- [ ] El semáforo visual de la oferta se actualiza de inmediato.`,
  },
  {
    id: 'ISSUE-11',
    module: 'frontend',
    moduleLabel: 'Módulo 2: Cliente',
    title: '[FE-07] Formulario Comunitario de Reporte de Ofertas Vencidas o Datos Erróneos',
    labels: ['frontend', 'community', 'quality', 'mvp'],
    summary: 'Permitir a los usuarios reportar anomalías puntuales en cualquier oferta del catálogo.',
    body: `### 📋 Contexto del Requerimiento
La lectura automática puede cometer errores ante cambios imprevistos en las páginas de las cadenas. El formulario de reporte permite a los usuarios señalar anomalías directamente.

### 🎯 Objetivos de la Tarea
- Añadir botón discreto de "Reportar problema" en la ficha de cada oferta.
- Modal con opciones predefinidas:
  - Oferta ya expiró en el local.
  - El precio en el local o app es distinto al publicado.
  - El código de cupón no es válido o da error.
  - El enlace lleva a una página rota o vacía.
  - Campo opcional de comentarios breves.
- Almacenar el reporte con timestamp y user agent anónimo.

### 📐 Especificación Técnica (SPEC - Controller & Presentation)
- **Componente:** \`src/views/components/ReportModal.tsx\`
- **Endpoint:** \`POST /api/offers/:id/report\`

### ✅ Criterios de Aceptación
- [ ] El formulario se completa en menos de 10 segundos.
- [ ] Los reportes se asocian de forma unívoca a la oferta correspondiente.
- [ ] Si una oferta acumula reportes críticos, se dispara la alerta para el motor de expiración.`,
  },
  {
    id: 'ISSUE-12',
    module: 'architecture',
    moduleLabel: 'Arquitectura & Metodología',
    title: '[ARCH-01] Configuración del Entorno Base con Arquitectura MVC y Metodología SPEC',
    labels: ['architecture', 'setup', 'spec'],
    summary: 'Estructurar el repositorio y contratos de interfaces respetando el estándar SPEC (State, Process, Entity, Component).',
    body: `### 📋 Contexto del Requerimiento
Para garantizar que el código se mantenga ordenado y los modelos no se mezclen con la presentación, se debe consolidar la arquitectura MVC según las especificaciones del README.

### 🎯 Objetivos de la Tarea
- Crear la estructura de carpetas:
  - \`src/models/entities/\`
  - \`src/models/schemas/\`
  - \`src/models/services/pipeline/\`
  - \`src/models/services/catalog/\`
  - \`src/controllers/\`
  - \`src/views/components/\`
  - \`src/views/pages/\`
- Definir interfaces de dominio TypeScript para:
  - \`Offer\`, \`Brand\`, \`Restriction\`, \`UserPreferences\`, \`IngestionLog\`.
- Configurar pruebas unitarias con Vitest o Jest para validación de esquemas Zod.

### ✅ Criterios de Aceptación
- [ ] La estructura de directorios coincide 1:1 con la especificación del README.
- [ ] No existen dependencias circulares entre Controllers y Views.
- [ ] El pipeline de TypeScript compila sin errores (\`npm run lint\`).`,
  },
];
