# Union Chapter Manager

A multi-tenant web app that helps a union local/chapter run its day-to-day
representation work in one place: a **member roster**, **worksites**, a
**member-contact log**, a **grievance/issue tracker** with a note timeline,
plus **chapter notes** and **quick links**.

It's a genericized, sellable starter extracted from a working single-tenant
CSEA chapter tracker. The proven data model is intact; the personal data and
one-user assumptions are gone. Each chapter's data is isolated at the database
level, so one deployment can serve many chapters as a subscription product.

> **Status:** functional starter. Auth, tenant isolation, and all core panels
> work. Billing (Stripe) and a marketing page are intentionally left out — see
> [Turning this into a product](#turning-this-into-a-product).

---

## What's inside

| Area | What it does |
|------|--------------|
| **Auth** | Email + password sign-up / sign-in via Supabase Auth |
| **Onboarding** | Create a chapter, or join an existing one with a share code |
| **Members** | Searchable roster; per-member role (Member / Steward / E-Board / Officer / Labor Rep), worksite, contact info |
| **Worksites** | Buildings/sites the local represents, with member counts |
| **Interactions** | Dated log of member contacts, with topics, notes, and archiving |
| **Issues** | Grievance/case tracker: status (Open → In Progress → Resolved → Closed), priority, and a per-issue update timeline |
| **Notes** | Free-form chapter notes / topics |
| **Links** | Quick links (contract PDF, benefits portal, forms) |
| **Learn** | Free micro-lessons + an upsell for a paid course — the top of a course→SaaS funnel |
| **Settings** | Switch chapters, share the join code, create/join more chapters |

### Course + SaaS funnel

The **Learn** tab doubles as marketing: its free lessons teach a slice of the
workflow the app implements, then point to a paid course. Lesson and course
content is configured in [`src/lib/lessons.js`](src/lib/lessons.js) — set
`COURSE.url` to your course platform page. The strategy behind it is written up
in [`docs/course-outline.md`](docs/course-outline.md) (the course itself) and
[`docs/funnel.md`](docs/funnel.md) (how the lead magnet → course → subscription
loop works, with conversion math).

---

## Architecture

- **Frontend:** React 19 + Vite, installable as a PWA. No backend server of its
  own — it talks directly to Supabase.
- **Backend:** [Supabase](https://supabase.com) (Postgres + Auth). All tenant
  isolation is enforced in the database with Row-Level Security, so a bug in
  the frontend can't leak one chapter's data to another.

### Multi-tenancy model

```
auth.users ──< memberships >── organizations (a chapter = a tenant)
                                     │
        members · worksites · interactions · issues · issue_notes · notes · links
                         (every row carries org_id)
```

- An **organization** is one chapter (the tenant).
- A **membership** links a logged-in user (officer/steward) to an org with a
  role of `owner`, `admin`, or `member`.
- Every domain row has an `org_id`. The RLS policy on each table is simply
  "the current user is a member of this row's org" (`is_org_member(org_id)`),
  so users only ever see and edit their own chapter's data.
- Creating and joining orgs goes through two `SECURITY DEFINER` RPCs
  (`create_organization`, `join_organization`) so the first membership is
  created atomically without opening a hole in the policies.

The full schema, policies, and RPCs live in
[`supabase/schema.sql`](supabase/schema.sql) — heavily commented.

---

## Local setup

**Prerequisites:** Node 18+ and a free Supabase project.

1. **Create the database.** In your Supabase project, open **SQL Editor → New
   query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql),
   and run it.

2. **Turn on email auth.** Supabase → **Authentication → Providers → Email**
   (on by default). For quick local testing you can disable "Confirm email"
   so sign-up logs you straight in.

3. **Configure the app.**
   ```bash
   cp .env.example .env
   # then edit .env with your project's URL and anon key
   # (Supabase → Project Settings → API)
   ```

4. **Run it.**
   ```bash
   npm install
   npm run dev
   ```
   Open the printed URL, create an account, then create your first chapter.

### Deploying

It's a static build (`npm run build` → `dist/`). Any static host works;
[`vercel.json`](vercel.json) is included for one-click Vercel deploys. Set the
two `VITE_SUPABASE_*` environment variables in your host's dashboard.

---

## Turning this into a product

This starter deliberately stops at a working, isolated multi-tenant app. To
sell it as a subscription, the usual remaining pieces are:

1. **Billing** — add Stripe Checkout + a `subscriptions` table (or Stripe's
   customer portal). Gate access with a check on the org's plan status.
2. **Landing page** — a public marketing page with pricing and a sign-up CTA.
3. **Email confirmation & password reset** — enable in Supabase Auth (UI hooks
   for reset can be added to `AuthScreen`).
4. **Roster import** — a CSV upload for `members` so a new chapter isn't typing
   in hundreds of people by hand.

### Natural next features (each maps to a table you'd add)

The original tracker also had these chapter-specific tools, easy to re-add on
the same `org_id` + RLS pattern:

- **Committee appointments** roster
- **Conference / delegate** attendance and report cards
- **RIF (reduction-in-force) intake** worksheets
- **Personnel commission** case tracking
- **Realtime** shared editing (uncomment the two lines at the bottom of
  `schema.sql` to enable Supabase Realtime on interactions/issues)

---

## Project layout

```
supabase/schema.sql        # tables, RLS policies, onboarding RPCs
src/
  lib/supabase.js          # Supabase client + auth helpers
  lib/roles.js             # role / status / priority option lists
  hooks/                   # one data hook per domain area, all org-scoped
  components/              # AuthScreen, Onboarding, Layout, and the panels
  index.css / app.css      # design tokens + component styles
```

## License

MIT — see the intent of a starter: fork it, brand it, sell it.
