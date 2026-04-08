# OME Deployments Demo Script

**Prototype:** https://itsptk.github.io/ome-console/  
**Design Doc:** [Google Doc](https://docs.google.com/document/d/1jEh-2nEFzbuFB977migDzcy9cNdo7QMFZFax1NgIOb8/edit)

---

## Executive Summary

This prototype demonstrates a **fleet-centric deployment management system** for OpenShift Management Engine. The key insight from Randy George:

> "You are managing 1 item (the change) vs the N number of resources that are changing. With 1000 clusters, you never need to look at 1000 clusters."

---

## Part 1: Deployments List Page (Activity Stream)

### What you're looking at:
- **Activity stream view** showing all ongoing and completed deployments
- Replaces resource-centric views with **change-centric monitoring**

### Key features to point out:

1. **Workspace filtering** — Filter by workspace (e.g., "Retail") to see relevant deployments only

2. **Status column** — Shows deployment state:
   - Running, Stopped, Complete, Failed
   - Errors float to top by default

3. **Progress indicators** — Context-rich progress:
   - "Phase 1: 3/10 complete, Soaking (4h remaining)"
   - "Rolling: 15/100 complete, 5 in progress"
   - Not just red/yellow/green — actual context

4. **Action controls** (kebab menu):
   - **Stop** — Pause for RCA (root cause analysis)
   - **Restart** — Resume without re-running wizard
   - **Delete** — Remove permanently

### Demo talking point:
> "Instead of looking at 500 clusters, you're looking at maybe 4-5 active deployments. If something fails, you drill down from here."

---

## Part 2: Deployment Wizard (Create Deployment)

### Step 1: Action
**What changed:** Renamed from "Change package" to action-oriented verbs

- Select what you're doing: **Update, Install, Apply, Delete, Create**
- Example: "Cluster update 4.15.12 → 4.16.2"
- **+Add dependent action** — Chain actions (e.g., Z-stream update → Operator deployment)

### Step 2: Placement
**What changed:** Separated from rollout strategy (per April 2 feedback)

- **Label selector** — e.g., `env=prod` with live preview of matched clusters
- **Manual selection** — Searchable list for explicit selection
- **Matched clusters table** — Shows exactly which clusters will be affected

### Step 3: Rollout
**What changed (April 8 - Randy's feedback):**

#### Rollout Method (3 cards):
1. **Canary** — Subset first, soak, then remainder
2. **Rolling** — Waves of X clusters
3. **Immediate** — All at once (high risk)

#### Schedule (3 cards - NEW):
1. **Now** — Start immediately
2. **Delayed** — Start at specific date/time (defaults to today)
3. **Maintenance window** — During allowed windows (e.g., weekends 10pm-2am)

#### Canary Configuration:
- **Canary label selector** — e.g., `tier=canary`
- **Matched clusters table** — Shows which clusters will be in the canary phase (NEW - Randy's feedback)
- **Help text:** "All canary clusters deploy together, then soak before proceeding to Phase 2"
- **Soak duration** — e.g., 24h
- **Error threshold** — Stop if error rate exceeds X%
- **Require approval before Phase 2** — Checkbox for manual gate (changed from "Auto-promote")

#### Phase 2 Configuration:
- Clusters per wave
- Soak time between waves
- Error threshold

### Step 4: Execution Policy
- **Run as** — Personal / Service Account / Platform
- **Require Manual Confirmation** — Final review before execution

### Step 5: Review
**What changed:** Now shows ALL fields from Steps 1-4

- Action summary with versions
- Placement method and matched clusters
- Rollout method and schedule
- Canary config (if applicable) with cluster list
- Phase 2 config
- **Execution policy** (NEW) — Run as + Manual confirmation
- Estimated completion time

---

## Part 3: Deployment Detail Page (Drilldown)

### What you're looking at:
- Deep-dive into a specific deployment for troubleshooting

### Key features:

1. **Overview section:**
   - Deployment type, status, initiated by, creation time
   - Affected clusters summary

2. **Timeline view (Gantt-style):**
   - Visual representation of deployment phases
   - Shows: Start → Phase 1 → Safety brake triggered → Soak → Phase 2
   - Critical for **root cause analysis**

3. **Cluster status breakdown:**
   - Complete / In Progress / Failed / Pending
   - Click on "3 Failed" to see exactly which clusters and why

4. **Failure details:**
   - Specific error messages per cluster
   - Links to logs and resources

### Demo talking point:
> "If 3 out of 40 clusters failed, I click on the 3 failures and see exactly what went wrong. I don't need to hunt through 40 cluster dashboards."

---

## Part 4: Key Design Decisions

### 1. Brake Pedal Philosophy
> "If errors occur, the user can cancel the schedule before it changes the remaining fleet."

- Safety brake auto-triggers at error threshold
- Pending actions auto-cancel on failure
- User can Stop → RCA → Restart or Cancel

### 2. Two Deployment Models (Future consideration)
From Alec/Shawn discussion:
- **Reconciling** (like K8s Deployments) — Continuous reconciliation
- **Terminal** (like K8s Jobs) — Fire and forget, done when done

### 3. Agentic UI (Future direction)
From April 2 feedback:
> "What if every search box was a free text AI query with page context?"

- "Ask" boxes vs "Search" boxes
- 2-year product timeline allows for agentic experiences

---

## Recent Changes (April 8, 2026 - Randy's Feedback)

| Change | Before | After |
|--------|--------|-------|
| Canary cluster preview | Not shown | Matched clusters table in selector AND Review |
| Schedule options | 2 options (Immediate/Window) | 3 cards: Now, Delayed, Maintenance window |
| Delayed start | Not available | Date/time picker, defaults to today |
| Canary waves | Multiple waves | Simplified: all canary clusters deploy together |
| Approval mechanism | "Auto-promote after soak" | "Require approval before Phase 2" checkbox |
| Review completeness | Missing execution policy | Shows all fields including Run as + Manual confirmation |
| Terminology | "Canary selector" | "Canary label selector" |

---

## Demo Flow (Recommended)

1. **Start on Deployments list** — Show the activity stream, workspace filter
2. **Click "Create deployment"** — Walk through wizard
3. **Step 1:** Select cluster update action
4. **Step 2:** Show label selector with matched clusters preview
5. **Step 3:** Select Canary, show the new schedule cards, show matched canary clusters
6. **Step 4:** Show Run as and Manual confirmation
7. **Step 5:** Point out the complete Review with all sections
8. **Back to list** — Show a deployment in progress
9. **Drilldown** — Show timeline and failure investigation flow

---

## Questions to Anticipate

**Q: Why not show individual clusters?**
> A: With 500+ clusters, listing them doesn't help. You monitor the deployment, and only drill into failures when they occur.

**Q: What's the difference between Canary and Rolling?**
> A: Canary = specific subset first (by label), soak, then remainder. Rolling = sequential waves of X clusters.

**Q: Why separate Placement from Rollout?**
> A: Placement is WHERE it goes. Rollout is HOW it's sequenced. These are independent decisions.

**Q: What happens when the safety brake triggers?**
> A: Deployment stops, pending clusters are cancelled, user investigates failures, then can Restart or Cancel.
