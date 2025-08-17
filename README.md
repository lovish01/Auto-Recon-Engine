# Reconciliation Engine – UI Prototype (Extended)

Features added:
- **Sample data** and a **guided onboarding** overlay
- **Fuzzy matching** (fallback when key match fails; configurable field + threshold)
- **Group-by summary** (sum amounts by chosen fields and compare between sources)
- **Export** includes groupSummary.csv
- Backend **Express stub** (see `/server`) with `/api/reconcile`

## Frontend Quickstart
```bash
npm i
npm run dev
```
Load sample data with the **"Load Sample Data"** button or upload your own CSVs.

## Recommended Matching Rules for samples
- Keys: `date` (type: date), `type` (text)
- Amount Field: `amount`
- Amount Tolerance: `10`
- Fuzzy Field: `ref`
- Group By: `account`

## Backend Stub
```
cd server
npm i
npm run dev
```
POST JSON to `http://localhost:4000/api/reconcile`:
```json
{
  "source1":[{"...": "..."}],
  "source2":[{"...": "..."}],
  "rules":{"keys":[{"field":"date","type":"date"}],"amountField":"amount","amountTolerance":0}
}
```
Integrate the frontend by replacing the client-side call with the API call (e.g., in `App.jsx`).

## Notes
- Fuzzy matching uses a lightweight Levenshtein similarity (no extra deps).
- Group summary compares sums per group against tolerance.
