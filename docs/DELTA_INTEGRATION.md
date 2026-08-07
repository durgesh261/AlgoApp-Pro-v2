# Delta Exchange Integration Specification & Architecture

**Document Version**:  
**Target Exchange**: Delta Exchange (India & Global Derivatives)  
**Supported Assets**: Perpetual Futures (`BTCUSD.P`, `ETHUSD.P`, `SOLUSD.P`, `XRPUSD.P`)  

---

## 1. Environment Configurations

Delta Exchange provides distinct base URLs for Sandbox/Testnet and Live Production.

| Setting | Sandbox / Testnet | Live Production |
| :--- | :--- | :--- |
| **REST Base URL** | `https://cdn.testnet.delta.exchange` | `https://api.delta.exchange` |
| **WebSocket Base URL** | `wss://socket.testnet.delta.exchange` | `wss://socket.delta.exchange` |
| **Web Portal** | `https://testnet.delta.exchange` | `https://www.delta.exchange` |
| **Rate Limit** | 10 requests / sec per IP | 10 requests / sec per API key |

---

## 2. Authentication Flow (HMAC-SHA256)

Delta Exchange authenticates private REST API requests using HMAC-SHA256 signature headers.

### Required Request Headers
- `api-key`: User's API Key string.
- `signature`: Hexadecimal HMAC-SHA256 signature calculated over the payload.
- `timestamp`: Current Unix timestamp in seconds (e.g. `1785700000`).

### Signature Calculation Method
```text
signature_payload = HTTP_METHOD + TIMESTAMP + PATH + QUERY_STRING + REQUEST_BODY
signature = HMAC_SHA256_HEX(api_secret, signature_payload)
```

### Signature Generation Example (TypeScript)
```typescript
import crypto from 'crypto';

export function generateDeltaSignature(
  apiSecret: string,
  method: string,
  timestamp: string,
  path: string,
  queryString: string = '',
  body: string = ''
): string {
  const payload = method.toUpperCase() + timestamp + path + queryString + body;
  return crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');
}
```

---

## 3. Key REST API Endpoints

### 3.1 Orders
- `POST /v2/orders`: Submit new order (Market, Limit, Stop).
- `PUT /v2/orders`: Modify open order (price/size).
- `DELETE /v2/orders`: Cancel open order.
- `DELETE /v2/orders/all`: Cancel all open orders for symbol.
- `GET /v2/orders`: Fetch open orders.

### 3.2 Positions
- `GET /v2/positions/margined`: Fetch open positions with leverage and margin.
- `POST /v2/positions/close_all`: Close all open positions.

### 3.3 Account & Margins
- `GET /v2/wallet/balances`: Fetch account balances, available margin, used margin.

---

## 4. WebSocket Channels & Reconnect Strategy

### 4.1 Required Channels
- `v2/ticker`: Real-time mark price, last price, best bid/ask.
- `user/orders`: Real-time order fill updates (`PENDING`, `OPEN`, `FILLED`, `CANCELLED`).
- `user/positions`: Real-time position PnL and liquidation margin updates.

### 4.2 Reconnect Strategy (Exponential Backoff with Jitter)
- Initial Reconnect Delay: 1,000ms
- Max Reconnect Delay: 30,000ms
- Backoff Multiplier: 2.0x
- Jitter Range: $\pm 200\text{ms}$
- Maximum Retries: 5 attempts before marking connection state as `DEGRADED`.

---

## 5. Order & Position Lifecycle Mapping

```text
[ AlgoApp Decision: EXECUTE ]
         ↓
[ ExecutionEngine: Submit Request ]
         ↓
[ DeltaAdapter: Validate & Classify ]
         ↓
[ Delta REST API: POST /v2/orders ]
         ↓
[ Delta WS: user/orders Event ]
         ↓
[ AlgoApp Execution Result: FILLED ]
```

---

## 6. Platform Emergency Kill Switch Integration

QuantEdge AI includes a platform-wide emergency stop mechanism (`EmergencyKillSwitch`).

### Kill Switch Enforcement Rules
1. When **`isEmergencyStopActive === true`**:
   - All outgoing live order submissions to Delta Exchange are **IMMEDIATELY REJECTED**.
   - Open orders can be cancelled automatically or manually.
   - Paper Trading and Replay simulation modes remain fully functional for testing.
