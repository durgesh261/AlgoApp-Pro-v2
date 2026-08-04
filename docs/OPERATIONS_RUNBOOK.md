# AlgoApp Pro v2 — Production Operations Runbook

## 1. Subsystem Monitoring & NOC Operations
- Access NOC Operations Center at `http://localhost:3000/operations`.
- Verify all 15 core subsystems display status `HEALTHY`.
- Monitor memory RSS (< 500 MB) and CPU usage (< 25%).

## 2. Emergency Backup & Restore Procedures
- **Create Backup**: Navigate to Operations NOC → Click `CREATE BACKUP`.
- **Generate One-Click Health Report**: Click `ONE-CLICK HEALTH REPORT` to run real-time diagnostic checks across all 15 services.

## 3. Disconnect & Failover Recovery
- **Delta Exchange API Disconnect**: The Delta Adapter automatically re-establishes connection using exponential backoff (1s, 2s, 4s, 8s, max 30s).
- **TradingView Webhook Listener Disconnect**: Alerts are queued in the Event Bus deduplication buffer and processed upon reconnect.

## 4. Error Escalation
- All system errors are captured in the **Centralized Error Center Log** (`http://localhost:3000/operations`).
- Export CSV error logs for auditing via `EXPORT CSV`.
