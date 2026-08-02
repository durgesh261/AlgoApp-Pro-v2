# Operations Runbook — AlgoApp Pro v2.0.0-rc1

Day-2 operational runbook for managing, monitoring, troubleshooting, and recovering **AlgoApp Pro v2**.

---

## 1. Emergency Kill Switch Procedure

### Activating the Kill Switch
When market anomalies, exchange API outages, or unexpected behavior occur, activate the Emergency Kill Switch immediately:

1. **Via Frontend UI**: Navigate to `/production-dashboard` or `/live-trading` and click **"ACTIVATE KILL SWITCH"**.
2. **Via REST API**:
   ```bash
   curl -X POST http://localhost:4000/api/v1/execution/delta/kill-switch \
        -H "Content-Type: application/json" \
        -d '{"active": true}'
   ```

**Effect**: Blocks **ALL** live order submissions to Delta Exchange while maintaining Paper Trading and Replay simulation modes intact.

---

## 2. Live Trading Activation Procedure

To activate Live Mode:
1. Ensure `DELTA_API_KEY` and `DELTA_API_SECRET` are set in `.env`.
2. Confirm Delta Testnet/Production connection status is `CONNECTED`.
3. Open `/production-dashboard` in the frontend interface.
4. Click **"LIVE TRADING (PROTECTED)"** and confirm the safety prompt.
5. All 8 safety checks in the **8-Point Live Safety Guard Matrix** must display green checks (`PASS`).

---

## 3. State Reconciliation & Recovery

### Manual State Reconciliation
Compare local `ExecutionEngine` orders and positions against Delta Exchange state:
```bash
curl -X POST http://localhost:4000/api/v1/execution/delta/reconcile
```

### Failure Recovery Scenarios
Simulate failure recovery via API:
- **WebSocket Drop**:
  ```bash
  curl -X POST http://localhost:4000/api/v1/execution/delta/simulate-recovery -H "Content-Type: application/json" -d '{"scenario": "WS_DISCONNECT"}'
  ```
- **Duplicate Message Deduplication**:
  ```bash
  curl -X POST http://localhost:4000/api/v1/execution/delta/simulate-recovery -H "Content-Type: application/json" -d '{"scenario": "DUPLICATE_MESSAGE"}'
  ```

---

## 4. Automated Backup Manager

Trigger database and journal snapshot backup:
```bash
curl -X POST http://localhost:4000/api/v1/production/backup
```
Backups are archived with status `SUCCESS` and size telemetry reported.
