# Airport Safety CAR System

A web-based **Corrective Action Request (CAR)** management system for airport safety teams. Covers the full workflow from safety/inspection finding to closure.

## Workflow

1. **Safety Team** creates a CAR, attaches the Safety/Inspection Report, and issues it to the responsible stakeholder
2. **Stakeholder** submits Root Cause Analysis (RCA) + Corrective Action Plan (CAP) with supporting documents
3. **Safety Team** reviews and approves or rejects the CAP
4. **Stakeholder** submits Final Action Taken with evidence
5. **Safety Team** accepts the evidence and closes the CAR

## Features

- Role switcher: Safety Team / Stakeholder (no login required for testing)
- Dashboard with status stats, search, and filters (status / type / priority)
- File attachments at 3 stages (drag & drop, stored as base64 in browser)
- Overdue indicator on past-due CARs
- Full audit trail on every CAR
- Data persisted in browser localStorage — no server needed

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Render

This repo includes `render.yaml` for one-click Render deployment.

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo — Render will auto-detect `render.yaml`
4. Deploy

Build command: `npm install && npm run build`  
Publish directory: `dist`

## Planned upgrades

- [ ] Backend API + database (PostgreSQL) to share data across team members
- [ ] Stakeholder directory / user accounts with login
- [ ] Email notifications on CAR issuance and deadlines
- [ ] SharePoint integration (pending IT approval)
