# BlockWallet API — Guia do Desenvolvedor

Documentação para integração com a **BlockWallet API**, backend REST da aplicação BlockWallet (app iOS + Supabase + CoinGecko).

| Campo | Valor |
|---|---|
| Versão da API | v1 |
| Prefixo | `/api/v1` |
| Formato | JSON |
| Autenticação | Bearer JWT (Supabase Auth) |

---

## Sumário

1. [URLs e ambientes](#1-urls-e-ambientes)
2. [Início rápido](#2-início-rápido)
3. [Autenticação](#3-autenticação)
4. [Formato de resposta e erros](#4-formato-de-resposta-e-erros)
5. [Rate limiting](#5-rate-limiting)
6. [Referência de endpoints](#6-referência-de-endpoints)
7. [Fluxos comuns](#7-fluxos-comuns)
8. [Integração iOS (Swift)](#8-integração-ios-swift)
9. [Boas práticas](#9-boas-práticas)

---

## 1. URLs e ambientes

| Ambiente | Base URL |
|---|---|
| **Produção** | `https://blockwallet-api.onrender.com` |
| **Local** | `http://localhost:3000` |

Todos os endpoints de negócio usam o prefixo **`/api/v1`**.

| Endpoint | Descrição |
|---|---|
| `GET /` | Health check na raiz (sem prefixo) |
| `GET /api/v1/health` | Health check da API |

**Exemplo — verificar se a API está online:**

```bash
curl https://blockwallet-api.onrender.com/api/v1/health
```

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "blockwallet-api",
    "timestamp": "2026-06-05T18:54:34.273Z"
  },
  "timestamp": "2026-06-05T18:54:34.273Z"
}
```

> **Plano gratuito (Render):** após ~15 min de inatividade, a primeira requisição pode levar 30–60 s (cold start).

---

## 2. Início rápido

### 2.1 Cadastro e login

```bash
# 1. Criar conta
curl -X POST https://blockwallet-api.onrender.com/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@exemplo.com","password":"senha123","displayName":"Dev"}'

# 2. Login — guarde accessToken e refreshToken
curl -X POST https://blockwallet-api.onrender.com/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@exemplo.com","password":"senha123"}'
```

### 2.2 Chamada autenticada

```bash
curl https://blockwallet-api.onrender.com/api/v1/profile \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### 2.3 Headers padrão

| Header | Obrigatório | Valor |
|---|---|---|
| `Content-Type` | Sim (POST/PUT/PATCH) | `application/json` |
| `Authorization` | Sim (rotas 🔒) | `Bearer <accessToken>` |

---

## 3. Autenticação

A API usa **Supabase Auth**. O fluxo recomendado para apps clientes:

```
sign-up → sign-in → usar accessToken → refresh (quando expirar) → sign-out
```

### Legenda de rotas

| Símbolo | Significado |
|---|---|
| 🔓 | Pública — não exige `Authorization` |
| 🔒 | Protegida — exige `Authorization: Bearer <accessToken>` |

### POST `/api/v1/auth/sign-up` 🔓

Cria um novo usuário. O e-mail é confirmado automaticamente (sem link de verificação).

**Body:**

```json
{
  "email": "user@email.com",
  "password": "minimo6",
  "displayName": "Nome opcional"
}
```

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `email` | string | Sim | E-mail válido |
| `password` | string | Sim | Mínimo 6 caracteres |
| `displayName` | string | Não | Nome de exibição |

**Resposta:**

```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@email.com", ... }
  },
  "timestamp": "..."
}
```

---

### POST `/api/v1/auth/sign-in` 🔓

**Body:**

```json
{
  "email": "user@email.com",
  "password": "minimo6"
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresAt": 1748905200,
    "user": {
      "id": "uuid",
      "email": "user@email.com"
    }
  },
  "timestamp": "..."
}
```

Guarde `accessToken` e `refreshToken` de forma segura (Keychain no iOS).

---

### POST `/api/v1/auth/refresh` 🔓

Renova os tokens quando o `accessToken` expirar.

**Body:**

```json
{
  "refreshToken": "eyJ..."
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresAt": 1748908800
  },
  "timestamp": "..."
}
```

---

### POST `/api/v1/auth/sign-out` 🔒

Encerra a sessão ativa.

**Resposta:**

```json
{
  "success": true,
  "data": { "message": "Sessão encerrada com sucesso." },
  "timestamp": "..."
}
```

---

### POST `/api/v1/auth/reset-password` 🔓

Envia e-mail de recuperação de senha via Supabase.

**Body:**

```json
{
  "email": "user@email.com"
}
```

---

### POST `/api/v1/auth/me` 🔒

Retorna dados do usuário autenticado.

**Resposta:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@email.com",
    "metadata": { "display_name": "Nome" }
  },
  "timestamp": "..."
}
```

---

## 4. Formato de resposta e erros

### Resposta de sucesso

Todas as respostas bem-sucedidas seguem o envelope:

```json
{
  "success": true,
  "data": { },
  "timestamp": "2026-06-05T18:54:34.273Z"
}
```

O payload real está sempre dentro de `data`.

### Resposta de erro

Erros seguem o formato padrão do NestJS (sem envelope `success`):

```json
{
  "statusCode": 401,
  "message": "Token inválido ou expirado.",
  "error": "Unauthorized"
}
```

| Código | Situação comum |
|---|---|
| `400` | Validação falhou, saldo insuficiente, moeda inexistente |
| `401` | Token ausente, inválido ou expirado |
| `404` | Recurso não encontrado |
| `429` | Rate limit excedido (60 req/min por IP) |

**Validação de body:** campos extras no JSON retornam `400`. Apenas os campos documentados nos DTOs são aceitos.

---

## 5. Rate limiting

Limite global: **60 requisições por minuto por IP**.

Ao exceder, a API retorna `429 Too Many Requests`.

**Dica:** cacheie respostas de mercado (`/coins/markets`, `/coins/price/simple`) no app e evite polling agressivo.

---

## 6. Referência de endpoints

Prefixo base: **`/api/v1`**

---

### 6.1 Profile — `/profile`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/profile` | 🔒 | Perfil completo |
| PATCH | `/profile` | 🔒 | Atualizar perfil |
| GET | `/profile/dashboard` | 🔒 | Resumo do dashboard |

**PATCH `/profile` — body (todos opcionais):**

```json
{
  "displayName": "Novo Nome",
  "avatarUrl": "https://exemplo.com/avatar.png"
}
```

**GET `/profile/dashboard` — resposta:**

```json
{
  "success": true,
  "data": {
    "simulated_balance_usd": "9500.00",
    "total_invested_usd": "1250.00",
    "asset_count": "3",
    "transaction_count": "5",
    "favorite_count": "7",
    "crypto_ids": ["bitcoin", "ethereum", "solana"]
  },
  "timestamp": "..."
}
```

---

### 6.2 Preferences — `/preferences`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/preferences` | 🔒 | Preferências do usuário |
| PUT | `/preferences` | 🔒 | Criar/atualizar preferências |

**PUT `/preferences` — body (todos opcionais):**

```json
{
  "marketSortOrder": "market_cap_desc",
  "chartPeriodDefault": "7",
  "currencyDisplay": "usd",
  "theme": "dark",
  "showPortfolioValue": true,
  "priceChangeTimeframe": "24h",
  "notificationsEnabled": true
}
```

| Campo | Valores permitidos |
|---|---|
| `marketSortOrder` | `market_cap_desc`, `market_cap_asc`, `volume_desc`, `volume_asc`, `price_change_desc`, `id_asc` |
| `chartPeriodDefault` | `1`, `7`, `30`, `90`, `365`, `max` |
| `currencyDisplay` | `usd`, `brl` |
| `theme` | `dark`, `light` |
| `priceChangeTimeframe` | `1h`, `24h`, `7d` |

---

### 6.3 Coins — `/coins`

Endpoints de mercado são **públicos** (proxy CoinGecko). Cache local exige autenticação.

| Método | Rota | Auth | Query params | Descrição |
|---|---|---|---|---|
| GET | `/coins/markets` | 🔓 | `page`, `per_page`, `order`, `vs_currency` | Lista de mercado |
| GET | `/coins/price/simple` | 🔓 | `ids`, `vs_currencies` | Preço atual |
| GET | `/coins/search/query` | 🔓 | `q` | Busca por nome/símbolo |
| GET | `/coins/:id` | 🔓 | — | Detalhe da moeda |
| GET | `/coins/:id/chart` | 🔓 | `days`, `vs_currency` | Gráfico histórico |
| GET | `/coins/cache/list` | 🔒 | `page`, `per_page` | Cache Supabase (sem CoinGecko) |
| GET | `/coins/cache/:id` | 🔒 | — | Metadado em cache |

**Defaults:**

| Param | Default |
|---|---|
| `page` | `1` |
| `per_page` | `50` (markets) / `20` (transactions) |
| `order` | `market_cap_desc` |
| `vs_currency` / `vs_currencies` | `usd` |
| `days` | `7` |

**Valores de `order`:** `market_cap_desc`, `market_cap_asc`, `volume_desc`, `volume_asc`, `price_change_desc`, `id_asc`

**Valores de `days`:** `1`, `7`, `30`, `90`, `365`, `max`

**Exemplos:**

```bash
# Top 50 moedas por market cap
curl "https://blockwallet-api.onrender.com/api/v1/coins/markets?page=1&per_page=50"

# Preço de bitcoin e ethereum
curl "https://blockwallet-api.onrender.com/api/v1/coins/price/simple?ids=bitcoin,ethereum&vs_currencies=usd"

# Gráfico 30 dias
curl "https://blockwallet-api.onrender.com/api/v1/coins/bitcoin/chart?days=30&vs_currency=usd"

# Busca
curl "https://blockwallet-api.onrender.com/api/v1/coins/search/query?q=sol"
```

---

### 6.4 Wallet — `/wallet`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/wallet` | 🔒 | Todos os ativos da carteira |
| GET | `/wallet/:cryptoId` | 🔒 | Posição de uma moeda |
| POST | `/wallet/buy` | 🔒 | Comprar criptomoeda |
| POST | `/wallet/sell` | 🔒 | Vender criptomoeda |

**POST `/wallet/buy` e `/wallet/sell` — body:**

```json
{
  "cryptoId": "bitcoin",
  "quantity": 0.01,
  "priceAtTransaction": 98500.00,
  "notes": "Compra inicial"
}
```

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `cryptoId` | string | Sim | ID CoinGecko (ex: `bitcoin`) |
| `quantity` | number | Sim | Mínimo `0.00000001` |
| `priceAtTransaction` | number | Sim | Mínimo `0.000001` — obter via `/coins/price/simple` |
| `notes` | string | Não | Anotação livre |

**Erros comuns:**

| Erro | Causa |
|---|---|
| `400` Saldo insuficiente | Saldo USD simulado não cobre a compra |
| `400` Quantidade insuficiente | Tentativa de venda acima do que possui |
| `400` Moeda não encontrada | `cryptoId` ausente no cache — chame `GET /coins/:id` antes |

> O saldo e posições são calculados pelo **trigger PostgreSQL** no Supabase. A API apenas registra a transação.

---

### 6.5 Transactions — `/transactions`

| Método | Rota | Auth | Query params | Descrição |
|---|---|---|---|---|
| GET | `/transactions` | 🔒 | `crypto_id`, `type`, `page`, `per_page` | Histórico paginado |
| GET | `/transactions/summary` | 🔒 | — | Totais comprado/vendido |
| GET | `/transactions/:id` | 🔒 | — | Transação individual |

**Filtro `type`:** `buy` ou `sell`

**Resposta de `/transactions`:**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "crypto_id": "bitcoin",
        "crypto_name": "Bitcoin",
        "crypto_symbol": "btc",
        "type": "buy",
        "quantity": "0.0100000000",
        "price_at_transaction": "98500.00000000",
        "total_value_usd": "985.00",
        "balance_before_usd": "10000.00",
        "balance_after_usd": "9015.00",
        "created_at": "2026-06-02T10:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "perPage": 20
  },
  "timestamp": "..."
}
```

---

### 6.6 Favorites — `/favorites`

| Método | Rota | Auth | Body | Descrição |
|---|---|---|---|---|
| GET | `/favorites` | 🔒 | — | Lista de favoritos |
| POST | `/favorites` | 🔒 | `{ "cryptoId": "bitcoin" }` | Adicionar |
| DELETE | `/favorites/:cryptoId` | 🔒 | — | Remover |
| GET | `/favorites/:cryptoId/check` | 🔒 | — | Verificar se é favorito |

---

### 6.7 Portfolio — `/portfolio`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/portfolio/snapshots` | 🔒 | Snapshots do período (`?days=30`) |
| GET | `/portfolio/snapshots/latest` | 🔒 | Snapshot mais recente |
| POST | `/portfolio/snapshots` | 🔒 | Gravar snapshot do dia |

**POST `/portfolio/snapshots` — body:**

```json
{
  "totalValueUsd": 1350.00,
  "availableBalanceUsd": 8650.00,
  "assetCount": 3,
  "snapshotDate": "2026-06-02"
}
```

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `totalValueUsd` | number | Sim | ≥ 0 |
| `availableBalanceUsd` | number | Sim | ≥ 0 |
| `assetCount` | number | Sim | ≥ 0 |
| `snapshotDate` | string | Não | ISO date (`YYYY-MM-DD`); default: hoje |

> Chame **uma vez por dia** na abertura do app, com valores calculados a partir dos preços atuais.

---

### 6.8 Alerts — `/alerts`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/alerts` | 🔒 | Todos os alertas (`?active=true` para filtrar) |
| POST | `/alerts` | 🔒 | Criar alerta |
| PATCH | `/alerts/:id/deactivate` | 🔒 | Desativar alerta |
| DELETE | `/alerts/:id` | 🔒 | Remover alerta |

**POST `/alerts` — body:**

```json
{
  "cryptoId": "bitcoin",
  "alertType": "above",
  "targetPrice": 100000.00
}
```

| Campo | Valores |
|---|---|
| `alertType` | `above` — dispara quando preço **supera** o alvo; `below` — quando **fica abaixo** |

Alertas são verificados automaticamente a cada **5 minutos** no servidor. Quando disparados, `is_active` passa a `false` e `triggered_at` é preenchido.

---

## 7. Fluxos comuns

### 7.1 Primeiro acesso do usuário

```
1. POST /auth/sign-up
2. POST /auth/sign-in          → salvar tokens
3. GET  /profile/dashboard     → saldo inicial ($10.000 simulados)
4. GET  /preferences           → carregar ou criar defaults
```

### 7.2 Comprar uma criptomoeda

```
1. GET  /coins/markets                    → usuário escolhe a moeda
2. GET  /coins/bitcoin                    → detalhe (popula cache se necessário)
3. GET  /coins/price/simple?ids=bitcoin   → preço atual
4. POST /wallet/buy                       → executar compra
5. GET  /wallet                           → atualizar tela da carteira
6. GET  /transactions?page=1              → histórico
```

**Exemplo completo de compra:**

```bash
# Obter preço
curl "https://blockwallet-api.onrender.com/api/v1/coins/price/simple?ids=bitcoin"

# Comprar
curl -X POST https://blockwallet-api.onrender.com/api/v1/wallet/buy \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cryptoId": "bitcoin",
    "quantity": 0.01,
    "priceAtTransaction": 98500.00
  }'
```

### 7.3 Renovar sessão expirada

```
1. Requisição retorna 401
2. POST /auth/refresh  { refreshToken }
3. Substituir accessToken e refreshToken armazenados
4. Repetir requisição original
```

### 7.4 Snapshot diário de portfolio

```
1. GET /wallet
2. GET /coins/price/simple?ids=bitcoin,ethereum,...   → preços atuais
3. Calcular totalValueUsd no app
4. POST /portfolio/snapshots
```

---

## 8. Integração iOS (Swift)

### 8.1 Configuração base

```swift
enum APIConfig {
    static let baseURL = URL(string: "https://blockwallet-api.onrender.com/api/v1")!
}
```

### 8.2 Cliente HTTP mínimo

```swift
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T
    let timestamp: String
}

struct AuthSession: Decodable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Int
    let user: AuthUser
}

struct AuthUser: Decodable {
    let id: String
    let email: String
}

func apiRequest<T: Decodable>(
    path: String,
    method: String = "GET",
    body: Encodable? = nil,
    token: String? = nil
) async throws -> T {
    var request = URLRequest(url: APIConfig.baseURL.appendingPathComponent(path))
    request.httpMethod = method
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
    if let body { request.httpBody = try JSONEncoder().encode(body) }

    let (data, response) = try await URLSession.shared.data(for: request)
    guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
        throw URLError(.badServerResponse)
    }
    return try JSONDecoder().decode(APIResponse<T>.self, from: data).data
}
```

### 8.3 Armazenamento de tokens

| Token | Onde guardar |
|---|---|
| `accessToken` | Keychain |
| `refreshToken` | Keychain |
| `expiresAt` | UserDefaults ou Keychain |

Renove o token **proativamente** (ex: 5 min antes de `expiresAt`) ou reativamente ao receber `401`.

### 8.4 IDs de moedas

Use sempre o **CoinGecko ID** (ex: `bitcoin`, `ethereum`, `solana`), não o símbolo (`BTC`, `ETH`).

---

## 9. Boas práticas

| Tópico | Recomendação |
|---|---|
| **Preço na compra/venda** | Sempre busque `/coins/price/simple` imediatamente antes de `/wallet/buy` ou `/wallet/sell` |
| **Cache de mercado** | Não chame `/coins/markets` a cada scroll; use paginação e cache local |
| **Moedas novas** | Chame `GET /coins/:id` antes da primeira transação para garantir que o cache existe |
| **Erros 401** | Tente refresh automático; se falhar, redirecione para login |
| **Cold start** | Exiba loading na primeira requisição após inatividade prolongada |
| **Paginação** | Use `page` e `per_page` em listas longas (`/transactions`, `/coins/markets`) |
| **Campos numéricos** | Valores monetários no banco podem vir como strings na resposta — trate conversão no app |

---

## Documentação relacionada

| Arquivo | Conteúdo |
|---|---|
| `SDD.md` | Documento de arquitetura interna (módulos, banco, crons, deploy) |
| `.env.example` | Variáveis de ambiente para execução local |
| `render.yaml` | Configuração de deploy no Render |

---

## Suporte

Para dúvidas sobre schema do banco, consulte `BlockWallet/docs/blockwallet_schema.sql`.

Para arquitetura e decisões de design, consulte `SDD.md`.
