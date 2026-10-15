# 🍔 CazadorDeOfertas — Centralizador Inteligente de Descuentos

> **Plataforma centralizadora de promociones y cupones de comida rápida (McDonald’s, Burger King y Mostaza)** orientada a maximizar el ahorro del consumidor mediante ingesta automatizada asistida por IA, estructuración de letra chica, canje en un toque y validación comunitaria en tiempo real.

---

## 📐 1. Arquitectura MVC con Metodología SPEC

El proyecto implementa el patrón **Modelo-Vista-Controlador (MVC)** estructurado bajo la **Metodología SPEC** (*State & Specification, Process & Pipeline, Entities & Endpoints, Components & Client*), asegurando desacoplamiento, trazabilidad estricta y escalabilidad controlada.

```
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
```

---

### 🧩 Desglose Metodológico SPEC (Specification-Driven MVC)

| Pilar SPEC | Capa MVC | Responsabilidad | Implementación Técnica |
| :--- | :--- | :--- | :--- |
| **S - State & Specification** | **Model (Reglas y Estado)** | Definición de esquemas de datos, invariantes de negocio, ciclo de vida de la oferta y reglas de estado. | Esquemas Zod/TypeScript, validación de clave única (`marca + slug_titulo`), reglas de expiración pasiva y cálculo de estado semáforo (`VERIFICADA`, `DUDOSA`, `EXPIRADA`). |
| **P - Process & Pipeline** | **Model (Servicios de Ingesta)** | Orquestación de captura de datos crudos (HTML/JSON), OCR para piezas gráficas y parseo semántico con LLM. | Worker cron diario, scrapers por marca, pipeline multimodales de OCR y LLM Structured Outputs para extraer beneficios y letra chica. |
| **E - Entities & Endpoints** | **Model & Controller (Contratos)** | Entidades persistentes de dominio y contratos RESTful de comunicación entre capas. | Entidades relacionales (`Offer`, `Brand`, `Restriction`, `FeedbackLog`) y endpoints (`GET /api/feed`, `POST /api/offers/:id/redeem`, `POST /api/offers/:id/feedback`). |
| **C - Components & Client** | **View & Presentation** | Componentes de interfaz reactiva, adaptabilidad móvil, microinteracciones y captura ágil de preferencias. | Vistas mobile-first, tarjetas de oferta con cálculo de ahorro visible, botón 1-touch para copiado de cupón y widget de feedback post-canje. |

---

## 🗂️ 2. Estructura de Directorios del Repositorio

```bash
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
```

---

## 🚀 3. Alcance del MVP y Decálogo de Características

### Módulo 1: Administración (Backend & Control de Datos)
1. **Pipeline de Ingesta Asistido y Automatizado:** Ejecución programada diaria sobre canales públicos de McDonald’s, Burger King y Mostaza, con fallback para carga asistida por imágenes.
2. **Parser y Filtro de Restricciones vía LLM:** Extracción quirúrgica a JSON estandarizado (marca, producto, precio de lista, precio promo, % ahorro, código, vigencia y restricciones).
3. **Módulo OCR para Promociones Gráficas:** Lectura de flyers e imágenes de cuponeras para no perder promociones no publicadas en texto plano.
4. **Motor de Deduplicación y Upsert en BD:** Clave única determinística (`marca + slug_titulo`) para evitar duplicados en lecturas consecutivas.
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

```bash
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
```

---

## 👥 Equipo y Metodología
Desarrollado bajo la metodología **SPEC** y principios de diseño centrado en el usuario.
