# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Servisex-Next is a Next.js 14 e-commerce application for selling products with integrated payment processing (YooKassa), delivery calculation (CDEK), and order management (RetailCRM). The site is currently suspended but maintains full e-commerce functionality.

## Development Commands

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Production build
pnpm start              # Start production server

# Code Quality
pnpm typecheck          # Run TypeScript type checking
pnpm lint               # Run ESLint
pnpm format             # Format code with Prettier
pnpm format:check       # Check formatting without modifying
pnpm check              # Run both lint and format:check

# Utilities
pnpm tree               # View project structure (3 levels)
pnpm tree:full          # View full project structure
```

**Important:** This project uses pnpm exclusively (enforced via preinstall hook).

## Architecture

### State Management

**Zustand (Cart State)**

- Primary cart store: [useCartStore.ts](src/hooks/useCartStore.ts)
- Persists to localStorage as "goat-cart-storage"
- Use [useStore.ts](src/hooks/useStore.ts) helper for SSR-safe access
- Cart operations: addItem, removeItem, increment/decrement quantity, clearCart

**TanStack Query (Server State)**

- Configured in [TanStackQueryProvider.tsx](src/providers/TanStackQueryProvider.tsx)
- Use `useMutation` for order creation and payments
- Use `useQuery` for order status polling (see [useOrderStatus.ts](src/hooks/useOrderStatus.ts))
- Order status polls every 4 seconds until terminal state (paid, canceled, no-product)

**React Hook Form + Zod**

- Checkout form validation schema: [checkout-form.ts](src/lib/checkout-form.ts)
- Form components integrated with Radix UI primitives

### External Services

**RetailCRM (Product Catalog & Orders)**

- Configuration: [config.ts](src/lib/server/config.ts)
- Environment-aware (prod/dev) via `RETAILCRM_ENV`
- API uses URLSearchParams (form-urlencoded format)
- Only displays SERVISEX manufacturer products with `active: true`

**YooKassa (Payment Processing)**

- Two-phase payment flow:
  1. Create payment with `capture=false` ([createPayment/route.ts](src/app/api/createPayment/route.ts))
  2. Webhook receives `payment.waiting_for_capture` event
  3. Validates stock availability, then captures or cancels
- Webhook handler: [yooKassa/route.ts](src/app/api/yooKassa/route.ts)
- IP validation for webhook security using ip-range-check
- Uses UUID-based idempotence keys to prevent duplicate payments

**CDEK (Delivery Service)**

- Handles pickup points ("offices") and delivery cost calculation
- OAuth token management for authentication
- API route: [cdek/route.ts](src/app/api/cdek/route.ts)

**Telegram (Notifications)**

- Function: `sendOrderDetailsToTelegram` in [utils.ts](src/lib/utils.ts)
- Two notification types: "created" (order submitted) and "paid" (payment captured)
- Environment-aware chat IDs

### API Routes Pattern

All API routes in [src/app/api/](src/app/api/):

- Use `export const dynamic = "force-dynamic"` to prevent caching
- Use `export const fetchCache = "force-no-store"` for fresh data
- Separate prod/dev endpoints (e.g., createPayment vs createTestPayment)
- Environment routing helpers in [utils.ts](src/lib/utils.ts): `getCreatePaymentApiPath()`, `getYooKassaWebhookPath()`

### Rendering Strategy

**Server Components:**

- Product catalog on homepage ([page.tsx](src/app/page.tsx))
- Uses `force-cache` for product fetching on homepage

**Client Components:**

- Cart and checkout ([cart/page.tsx](src/app/cart/page.tsx))
- Interactive features (quantity selectors, forms)

**Dynamic Routes:**

- Product pages: `[parentProductId]/[color]/page.tsx`

### Data Transformation

Product data transformation logic in [utils.ts](src/lib/utils.ts):

- `transformProducts()`: Converts RetailCRM structure to shop format
- Handles color/size variants and stock aggregation
- Filters by manufacturer (SERVISEX) and active status

### Environment Configuration

Custom `NEXT_PUBLIC_ENVIRONMENT` variable switches between dev/prod:

- Affects which RetailCRM instance to use
- Selects appropriate YooKassa credentials
- Routes to correct API endpoints

Server-only config in [config.ts](src/lib/server/config.ts) uses `import "server-only"` directive.

## TypeScript Configuration

Strict mode enabled with:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- Path aliases: `@/*` maps to `src/*`

Comprehensive type definitions in [src/types/](src/types/):

- [product.ts](src/types/product.ts), [order.ts](src/types/order.ts), [cart.ts](src/types/cart.ts)
- [yookassa.ts](src/types/yookassa.ts), [cdek.ts](src/types/cdek.ts), [crmOrders.ts](src/types/crmOrders.ts)

## Key Conventions

1. **Server-Only Imports:** Use `import "server-only"` for backend-only modules
2. **Environment Variables:** Prefix with `NEXT_PUBLIC_` for client access
3. **Component Organization:**
   - UI primitives: [src/components/ui/](src/components/ui/)
   - Feature components: [src/components/](src/components/)
4. **Order Status Flow:** new → availability-confirmed → paid/no-product/canceled
5. **Product Filtering:** Only SERVISEX manufacturer + active products displayed
6. **Current Status:** Site suspended (see [layout.tsx](src/app/layout.tsx)) but infrastructure active

## UI Component Library

Uses Radix UI primitives with custom styling:

- Dialog, Select, Tabs, Separator, Label, Radio Group
- Styled with Tailwind CSS and class-variance-authority
- Custom components in [src/components/ui/](src/components/ui/)

## 🟠 context7

Always use `context7` mcp when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.
