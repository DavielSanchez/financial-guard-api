# Technical Backend PRD - Financial Guard

**Rol de este documento:** Este PRD técnico servirá como "Ground Truth" para que los asistentes de IA (Cursor, Copilot, etc.) construyan los servicios, controladores y la lógica de base de datos exactos con una arquitectura robusta, segura y escalable.

---

## 1. Arquitectura de Datos (Modelos)

Se recomienda utilizar un ORM moderno y fuertemente tipado como **Prisma** o **Drizzle ORM** (integrado con PostgreSQL).

### Esquema y Relaciones

- **User**:
  - `id` (UUID o CUID, PK)
  - `email` (String, Unique)
  - `passwordHash` (String)
  - `createdAt`, `updatedAt` (DateTime)

- **Wallet**: (Las fuentes de fondos: Banco, Efectivo, Billetera Crypto)
  - `id` (UUID, PK)
  - `userId` (FK -> User)
  - `name` (String)
  - `currency` (String, ej. "USD", "EUR")
  - `balance` (Decimal) *-- Desnormalizado para lectura rápida, o calculado dinámicamente si prefieres event sourcing.*
  - `createdAt`, `updatedAt`

- **Category**: (Agrupación para analíticas)
  - `id` (UUID, PK)
  - `userId` (FK -> User, permitiendo categorías custom)
  - `name` (String)
  - `type` (Enum: `INCOME`, `EXPENSE`)
  - `color`, `icon` (String, opcionales para UI)

- **Transaction**: (El core transaccional)
  - `id` (UUID, PK)
  - `walletId` (FK -> Wallet)
  - `categoryId` (FK -> Category, opcional en transferencias)
  - `amount` (Decimal - *Usar tipo decimal para precisión financiera, o Integer en centavos*)
  - `type` (Enum: `INCOME`, `EXPENSE`, `TRANSFER`)
  - `description` (String, nullable)
  - `date` (DateTime)
  - `createdAt`

- **SavingsGoal**: (Metas "Cyber-finance")
  - `id` (UUID, PK)
  - `userId` (FK -> User)
  - `name` (String)
  - `targetAmount` (Decimal)
  - `currentAmount` (Decimal)
  - `deadline` (DateTime, opcional)
  - `createdAt`, `updatedAt`

---

## 2. Estrategia de Auth (Sesiones y Seguridad)

Para proteger la aplicación SaaS B2C, la autenticación debe ser Stateless pero altamente segura.

- **Mecanismo:** JSON Web Tokens (JWT).
- **Transporte Seguro:** Se enviarán mediante **Cookies `HttpOnly`, `Secure` y `SameSite=Strict`**. Esto mitiga ataques XSS (el frontend no puede leer el token) y CSRF.
- **Middleware de Protección:**
  - Todo endpoint (excepto `/auth/login` y `/auth/register`) pasará por un `authMiddleware`.
  - El middleware verificará y decodificará la cookie.
  - En caso de validez, inyectará `req.user = { id: string }` en el contexto para acceso rápido en los controladores.
  - Si no hay token o expiró, devolverá estatus HTTP `401 Unauthorized`.

---

## 3. Lógica de Negocio (Edge Functions / Cálculo de Balances)

La eficiencia del cálculo financiero para el Dashboard se manejará evitando consultas pesadas directas (Full Table Scans) aprovechando agregaciones a nivel de base de datos.

- **Cálculo de Balances:**
  - El Total General suma el atributo `balance` de todas las `Wallets` del usuario.
  - Alternativa (estricta): Suma dinámica de todo el historial de transacciones (Income vs Expense) vía un query de agregación agrupado (`SUM() GROUP BY walletId`).
- **Deltas Porcentuales (Mes actual vs Mes pasado):**
  - **Función Analítica / Service (`calculateDashboardDeltas`):**
    1. Obtener la suma de ingresos (`INCOME`) y egresos (`EXPENSE`) desde el día 1 del mes actual hasta la fecha actual (`current_period`).
    2. Obtener la misma suma para el mismo marco de tiempo del mes anterior (`previous_period`).
    3. Fórmula: `((current_period - previous_period) / previous_period) * 100`.
  - Se recomienda usar **Edge Functions** o **Workers** (si usas Vercel/Supabase) con una capa de caché (ej. Redis o in-memory) con TTL de 5-15 minutos (Stale-While-Revalidate) para que el Dashboard cargue instantáneo.

---

## 4. Integraciones (Plan de Expansión)

- **AI Coach (LLM):**
  - **Propósito:** Analizar la data del mes para brindar consejos financieros personalizados.
  - **Implementación:** Un endpoint `/ai/coach` (Idealmente usando Edge runtime para streaming con Server-Sent Events - SSE). Recuperará las transacciones y categorías del último mes, las anonimizará (removiendo descripciones sensibles o PII), y armará un prompt estructurado en JSON para OpenAI (GPT-4o) / Anthropic (Claude-3.5) / Vercel AI SDK.
- **Stripe (Pasarela de Pago):**
  - **Propósito:** Manejar el pago de características premium (SaaS subscriptions).
  - **Implementación:** Endpoint para generar un `CheckoutSession`. Es imperativo exponer un endpoint de **Webhook** (`POST /webhooks/stripe`) no protegido por JWT (protegido mediante la firma del webhook con Stripe SDK) que escuche eventos como `invoice.payment_succeeded` o `customer.subscription.deleted` para actualizar el estado del plan en la entidad `User`.

---

## 5. Contratos de API (JSON Responses / TypeScript Types)

Estos esquemas de respuesta deben mapearse directamente a las interfaces de TypeScript en el Frontend de Financial Guard.

### `GET /auth/me`
Recupera el perfil actual basado en la cookie `HttpOnly`.
```json
// TypeScript: AuthUserResponse
{
  "user": {
    "id": "usr_12345uuid",
    "email": "user@cyberfinance.com",
    "createdAt": "2024-03-01T12:00:00Z"
  }
}
```

### `GET /dashboard/summary`
Core analítico principal para la pantalla de inicio.
```json
// TypeScript: DashboardSummaryResponse
{
  "totalBalance": 15450.25,
  "period": "2024-03", // Mes actual visualizado
  "income": {
    "amount": 4200.00,
    "deltaPercentage": 5.2 // Subió 5.2% vs mes pasado
  },
  "expenses": {
    "amount": 2100.50,
    "deltaPercentage": -1.5 // Bajó 1.5% vs mes pasado (positivo para el usuario)
  },
  "walletsBreakdown": [
    {
      "walletId": "wallet_123",
      "name": "Banco Principal",
      "balance": 10000.00
    },
    {
      "walletId": "wallet_456",
      "name": "Binance Crypto",
      "balance": 5450.25
    }
  ]
}
```

### `GET /transactions`
Lista paginada del historial de movimientos.
```json
// TypeScript: PaginatedTransactionsResponse
{
  "data": [
    {
      "id": "txn_89012uuid",
      "amount": 150.00,
      "type": "EXPENSE",
      "description": "Cyberpunk Neon Keyboard",
      "date": "2024-03-15T18:30:00Z",
      "wallet": {
        "id": "wallet_123",
        "name": "Banco Principal"
      },
      "category": {
        "id": "cat_001",
        "name": "Tecnología",
        "color": "#FF00FF",
        "icon": "computer"
      }
    }
  ],
  "pagination": {
    "total": 342,
    "page": 1,
    "limit": 20,
    "totalPages": 18
  }
}
```

---
**Instrucción para Agentes (Cursor/Copilot):**
Al leer este documento, implementa cada endpoint utilizando un patrón de inyección de dependencias o un patrón Controller-Service. Asegúrate de implementar el archivo de middleware de autenticación (`auth.middleware.ts`) primero y aplicar validación estricta de payloads (Zod/Joi) antes de conectar a la capa de base de datos.
