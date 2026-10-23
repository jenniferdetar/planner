# Course outline — "How to Run Your Union Local"

A companion course to the Union Chapter Manager app. It teaches the *workflow*;
the app *runs* the workflow. Someone who finishes the course both wants the app
and already knows how to use it.

## Positioning

- **Audience:** newly elected or under-supported chapter officers and stewards —
  volunteers doing a hard job with no training and no time.
- **Promise:** "Run your local like a pro without drowning in spreadsheets."
- **Why you:** real operational experience, not theory. This is the knowledge
  that usually only transfers by luck when an outgoing officer happens to train
  the incoming one.

## Scope & format (keep it finishable)

- **8 modules, ~3 hours total.** Short lessons (5–15 min), not lecture blocks.
- **Screen-recorded walkthroughs** in the app where relevant, so the software is
  demoed as you teach.
- **Downloadable templates** are the highest-value part for buyers: grievance
  intake form, RIF/seniority checklist, meeting agenda, steward assignment map,
  member-contact log.
- Ship a **v1 with 4 modules** if that's what gets it out the door. A tight,
  finished mini-course beats a sprawling one that never launches.

## Pricing

| Tier | Price | What's in it |
|------|-------|--------------|
| **Playbook** | $49 | Templates + the 3 foundational modules. A cheap yes. |
| **Full course** | $149 | All 8 modules + all templates + updates. The default. |
| **Course + app** | $149 + app subscription | Bundle the course free into an annual app plan. |

Anchor on $149. The $49 playbook is the low-friction entry that warms buyers for
the app; the bundle is where the recurring revenue comes from.

## Modules

### 1. Your chapter's source of truth
Roster, worksites, roles. Why scattered data loses grievances. Setting up the
Members and Worksites tabs so everything downstream works.
*Template: member roster starter + steward assignment map.*

### 2. Member engagement & the contact log
Building the habit of logging every interaction; using history to spot patterns
and hand off cleanly. The Interactions tab.
*Template: member-contact log.*

### 3. Grievance handling: intake to resolution
The pipeline (Open → In Progress → Resolved → Closed), hitting timelines, and
building the paper trail that wins. The Issues tab and note timelines.
*Template: grievance intake form + timeline tracker.*

### 4. Building & supporting a steward network
Mapping stewards to worksites, spotting coverage gaps, recruiting, and the
train-the-steward mindset that lets a chapter scale beyond its officers.

### 5. RIF & layoff preparedness
Seniority lists, bumping rights, notice and information requests, and modeling
who's affected the moment numbers land. Preparing in calm times.
*Template: RIF readiness checklist.*

### 6. Contract enforcement & member rights
Reading your contract as an enforcement tool, Weingarten rights in
investigatory meetings, and documentation standards.
*(Framed as general operational practice — always defer to your contract,
bylaws, labor rep, and counsel.)*

### 7. Running effective meetings & elections
Agendas that respect people's time, quorum and minutes, committee
appointments, and clean, defensible elections.
*Template: meeting agenda + minutes.*

### 8. Communication & member benefits
Keeping members informed, a simple links/benefits hub, and turning good
representation into engagement and turnout.

## How it connects to the app

Every module maps to a tab in the Union Chapter Manager. The free in-app **Learn**
tab (`src/lib/lessons.js`) already carries abbreviated versions of modules 1, 2,
3, 4, and 5 — those are the funnel's top, teasing the paid course from inside the
product. Update `COURSE.url` in that file to point at wherever the course lives.

## Production checklist (v1)

- [ ] Script modules 1–3 (the foundation) first
- [ ] Build the 5 core templates (these sell even on their own)
- [ ] Record app walkthroughs alongside each relevant lesson
- [ ] Host on a no-code platform (Podia / Teachable / Gumroad) — do **not** build
      course hosting into the app
- [ ] Set `COURSE.url` in the app's Learn tab to the checkout page
- [ ] Add a one-page sales page with the promise, outline, and price
