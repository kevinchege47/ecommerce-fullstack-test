# Cymelle Technologies — Full-Stack Assessment

> **Stack:** Java 17 + Spring Boot 4.1.0 (backend) · React 18 + Tailwind CSS 3 (frontend)  
> **Database:** H2 in-memory (auto-seeded on startup)

---

## Quick start

### Prerequisites
| Tool | Minimum version |
|------|-----------------|
| JDK  | 17              |
| Maven | 3.8+            |
| Node | 20+             |
| npm  | 9+              |

### 1 — Backend

```bash
cd ecommerce-backend
mvn spring-boot:run
```

API available at **http://localhost:8080**  
H2 console at **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:cymelle`, user: `sa`, no password)

### 2 — Frontend

```bash
cd ecommerce-frontend
npm install
npm start
```
### 3 -  Running unit tests for frontend 

```bash
cd ecommerce-frontend
npm test
```
### 4 - Running unit tests for backend

```bash
cd ecommerce-backend
mvn test
```

Dashboard at **http://localhost:3000**  
The React dev server proxies `/orders`, `/inventory`, `/fare` to `http://localhost:8080` (configured in `package.json`).

### 4 — Run unit tests

```bash
cd ecommerce-backend
mvn test
```

---

## API reference

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders` | List orders — supports `?status=`, `?from=`, `?to=` query params |
| `POST` | `/orders` | Place an order (deducts stock in a single transaction) |
| `DELETE` | `/orders/{id}` | Cancel an order (rolls back stock in a single transaction) |

**POST /orders body:**
```json
{
  "customerName": "Alice Wanjiku",
  "customerEmail": "alice@example.com",
  "inventoryItemId": 1,
  "quantity": 2
}
```

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/inventory` | All items with `lowStock` flag |
| `GET` | `/inventory/low-stock` | Items below configured threshold (default: 10) |

### Fare

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fare/calculate?distanceKm=12.5&surgeMultiplier=1.5` | Calculate trip fare |

---

## Frontend notes

- All tabs (Inventory, Orders, Fare Calculator) are **wired to the live Spring Boot API** — no mock data.
- Loading states, error states, and empty states are implemented in every view.
- The Orders tab supports filtering by status and date range; cancelled orders restore stock via the `DELETE /orders/{id}` endpoint.
- Low-stock items are visually flagged in the Inventory tab with a red badge and row highlight.

---

## Configuration

`ecommerce-backend/src/main/resources/application.properties`

| Key | Default | Description |
|-----|---------|-------------|
| `inventory.low-stock-threshold` | `10` | Items below this quantity are flagged as low stock |
| `fare.base` | `50.0` | Base fare in KES |
| `fare.per-km-rate` | `15.0` | Per-kilometre charge in KES |
| `fare.minimum` | `80.0` | Minimum fare floor in KES |
| `fare.surge-multiplier` | `1.0` | Default surge (1.0 = no surge) |

