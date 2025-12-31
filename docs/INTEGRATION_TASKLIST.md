# Iran Budget Integration Tasklist

## Goal
Integrate PostgreSQL database + hierarchical Sankey diagram + React controls into one working application

## Current State
✅ PostgreSQL database with 10 years of data (1395-1404)
✅ Python script creating beautiful hierarchical Sankey (`create_hierarchical_sankey.py`)
✅ React Next.js app with basic controls and simple Sankey
❌ Not connected together

---

## Phase 1: Backend API Setup ✅ COMPLETE

### 1.1 Create API Route Structure
- [x] Create `/frontend/app/api/budget/route.ts` - main budget data endpoint
- [x] Create `/frontend/app/api/health/route.ts` - database health check

### 1.2 Database Connection
- [x] Install `pg` (node-postgres) package
- [x] Create `/frontend/lib/db.ts` - database connection pool
- [x] Create `.env.local` with database credentials
- [x] Test connection with health endpoint

### 1.3 Data Transformation Layer
- [x] Create `/frontend/lib/budget-transform.ts` - transform DB data to Sankey format
- [x] Map database schema to hierarchical Sankey nodes/links
- [x] Add Persian labels mapping (from Python script)
- [x] Handle all 10 years (1395-1404)

---

## Phase 2: Frontend Sankey Component ✅ COMPLETE

### 2.1 Create Hierarchical Sankey Component
- [x] Create `/frontend/components/HierarchicalSankey.tsx`
- [x] Port Python Plotly logic to Plotly.js (React)
- [x] Implement 5-level hierarchy:
  - Level 1: Detailed revenue sources (11 items)
  - Level 2: Revenue categories (3 items)
  - Level 3: Budget center (2 columns: revenue/spending)
  - Level 4: Main spending categories (4 items)
  - Level 5: Detailed spending (11 items)

### 2.2 Styling & Persian Support
- [x] Add Vazir font to Next.js layout
- [x] Implement RTL support for Persian labels
- [x] Match colors from Python script (blues → magentas)
- [x] Add vertical text annotations for center columns

### 2.3 Interactivity
- [x] Hover tooltips with values
- [ ] Click to highlight flow paths
- [x] Responsive sizing

---

## Phase 3: Integration ✅ COMPLETE

### 3.1 Update Main Page
- [x] Replace simple Sankey with HierarchicalSankey component
- [x] Connect year selector to API
- [x] Add loading states
- [x] Add error handling

### 3.2 Data Flow
- [x] User selects year → API call → Transform data → Render Sankey
- [ ] Cache API responses (React Query or SWR)
- [ ] Prefetch adjacent years

### 3.3 Additional Controls
- [x] Keep existing language toggle (EN/FA)
- [ ] Keep currency toggle (Rial/Dollar)
- [ ] Add comparison mode (compare 2 years side-by-side)

---

## Phase 4: Enhanced Features

### 4.1 Stats Dashboard
- [ ] Revenue breakdown cards
- [ ] Expenditure breakdown cards
- [ ] YoY growth indicators
- [ ] Deficit/surplus highlights

### 4.2 Export & Share
- [ ] Export as PNG
- [ ] Export as PDF
- [ ] Share link with specific year/settings
- [ ] Embed mode (iframe-friendly)

### 4.3 Data Quality
- [ ] Show data source notes
- [ ] Display verification status
- [ ] Link to official budget law documents

---

## Phase 5: Polish & Deploy

### 5.1 Performance
- [ ] Optimize Sankey rendering for large datasets
- [ ] Add service worker for offline support
- [ ] Compress API responses

### 5.2 Testing
- [ ] Test all 10 years render correctly
- [ ] Test on mobile devices
- [ ] Cross-browser testing
- [ ] RTL/LTR switching

### 5.3 Documentation
- [ ] Update README with setup instructions
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide

---

## Tech Stack Decisions

**Backend:**
- Next.js API Routes (App Router)
- node-postgres for DB connection
- Server-side data transformation

**Frontend:**
- React 18 + TypeScript
- Plotly.js via react-plotly.js
- Tailwind CSS
- Vazir font for Persian

**Database:**
- PostgreSQL (existing)
- Connection pooling
- Read-only queries

---

## Priority Order

🔥 **MUST HAVE (Phase 1-3)**
1. API endpoint with DB connection
2. Hierarchical Sankey component
3. Year selector working
4. Persian labels displaying correctly

⭐ **SHOULD HAVE (Phase 4)**
5. Stats dashboard
6. Export features
7. Comparison mode

✨ **NICE TO HAVE (Phase 5)**
8. Advanced interactivity
9. Offline support
10. Comprehensive docs

---

## Next Steps

Start with Phase 1.2: Database Connection
- Install pg package
- Create connection pool
- Test with simple query
