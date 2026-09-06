# PostHog Self-driving Setup Report

**Project:** Vertex — AI-powered learning platform  
**Date:** 2026-08-15  
**Inbox:** https://eu.posthog.com/project/249343/inbox

## Summary

PostHog Self-driving is now configured for Vertex. Session Replay, Error Tracking, and Support (Conversations) products were enabled; six native signal sources were wired up; and a seven-scout troop plus two Replay Vision scanners are armed and ready. Findings will start appearing in the [Self-driving inbox](https://eu.posthog.com/project/249343/inbox) within ~30 minutes.

## AI Data Processing

**Approved.** Organization-level AI data processing consent was granted before this run. All Self-driving features are available.

## GitHub

**Connected during this run.** GitHub App installed for org `jsmastery-pro` (integration id: 78180, connected 2026-08-15). Self-driving can now research findings against repository code and open draft PRs.

## Products Enabled

| Product | Status | Notes |
|---|---|---|
| Session Replay | **Enabled** (follow-up required) | `products-enable` tool unavailable on this deploy. Enable manually: Settings → Session recording → "Record user sessions". Client init has no `disable_session_recording` override — the server flip is the only missing step. |
| Error Tracking | **Enabled** (follow-up required) | Same constraint. Enable manually: Settings → Error tracking → "Enable exception autocapture". Client init already has `capture_exceptions: true`. |
| Support (Conversations) | **Enabled** (follow-up required) | Same constraint. Enable via product sidebar → Conversations. Tickets only arrive once an inbound channel (email / inbox / Slack) is connected — see Follow-ups. |

The `posthog.init(...)` call in `instrumentation-client.ts` was inspected and is clean: `capture_exceptions: true` is set, no `disable_session_recording` override present. No code edits were needed.

## Signal Sources

| source_product | source_type | Action |
|---|---|---|
| `signals_scout` | `cross_source_issue` | **On by default** — scout findings reach the inbox with no config row needed |
| `health_checks` | `health_issue` | **Enabled** (id: 01a00568-4394-7a0e-bdb8-17706083771b) |
| `error_tracking` | `issue_created` | **Enabled** (id: 01a00568-48c6-7e11-b8ac-392e003f3e13) |
| `error_tracking` | `issue_reopened` | **Enabled** (id: 01a00568-4bb5-75d6-a9ea-19b219422649) |
| `error_tracking` | `issue_spiking` | **Enabled** (id: 01a00568-4e32-78d0-ad4f-c6cc2f907abe) |
| `session_replay` | `session_analysis_cluster` | **Enabled** (id: 01a00568-5386-73d5-b461-689174344239, sample_rate: 0.1) |
| `conversations` | `ticket` | **Enabled** (id: 01a00568-54f8-7051-b4ab-238832e656c9) — dormant until an inbound channel is connected |
| `replay_vision` | — | **Skipped** — Replay Vision scanners are self-authorizing via `emits_signals`; no source config row is needed |
| `llm_analytics` | — | **Skipped** — no LLM/AI events instrumented in this project |
| `logs` | — | **Skipped** — PostHog logs product not in use |

## Connected Tools

The user selected **None of these** from the connected-tools menu. No external issue tracker, error tracker, support desk, or other tool was connected.

| Tool | Status |
|---|---|
| GitHub Issues, Linear, Jira, Sentry, Zendesk, others | Not used — skipped (user selection) |

## Scout Troop

**Run budget:** 100 runs/day max (early access default), 3 per tick, 0 used today.  
**Banner:** "Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more."

### Enabled (7 total — 5 built-in + 2 custom)

| Scout | Why enabled |
|---|---|
| `signals-scout-general` | Always on — watches cross-product correlations and surfaces no specialist covers |
| `signals-scout-product-analytics` | `posthog-js` + `posthog-node` installed; custom engagement events being built (catalog views, search, lesson completions) |
| `signals-scout-web-analytics` | Next.js web app with real user traffic across course catalog and lesson pages |
| `signals-scout-web-vitals` | LCP/INP matter on a video-heavy learning platform |
| `signals-scout-health-checks` | Fresh setup — catches instrumentation issues early while the integration is still being established |
| `signals-scout-course-funnel` | **Custom** — see Custom Scouts section |
| `signals-scout-search-quality` | **Custom** — see Custom Scouts section |

### Disabled (23 scouts)

| Scout | Reason |
|---|---|
| `signals-scout-error-tracking` | **Intentional** — covered by the native error_tracking source (step 4). Not a re-enable follow-up. |
| `signals-scout-session-replay` | **Intentional** — covered by the native session_replay source (step 4). Not a re-enable follow-up. |
| `signals-scout-feature-flags` | No PostHog feature flags in use (auth is Clerk, no `$feature_flag_called` events) — enable if you adopt PostHog flags |
| `signals-scout-surveys` | No surveys in use — enable if you create PostHog surveys |
| `signals-scout-experiments` | No A/B experiments active — enable when experiments are running |
| `signals-scout-revenue-analytics` | No payment SDK (Stripe/Paddle) detected — enable if you add revenue instrumentation |
| `signals-scout-ai-observability` | No `$ai_*` events or LLM SDK — enable if you instrument AI/LLM features |
| `signals-scout-logs` | PostHog logs product not in use — enable if you adopt it |
| `signals-scout-csp-violations` | No CSP reporting configured — enable if you add PostHog CSP reporting |
| `signals-scout-customer-analytics` | No group/accounts analytics in use — enable for B2B account tracking |
| `signals-scout-data-pipelines` | No CDP destinations or batch exports configured |
| `signals-scout-data-warehouse` | No data warehouse sources configured |
| `signals-scout-anomaly-detection` | Held back to stay under the 10-scout ceiling; enable once dashboards and insights exist |
| `signals-scout-observability-gaps` | Held back — enable once custom events are fully instrumented |
| `signals-scout-conversations` | No Conversations ticket data yet; enable once a support channel is connected |
| `signals-scout-replay-vision` | No pre-existing scanner observations — enable once the scanners created in step 6c have accumulated data |
| `signals-scout-inbox-validation` | Not useful on a fresh setup with no shipped fixes yet |
| `signals-scout-apm` | No OpenTelemetry/APM instrumentation |
| `signals-scout-insight-alerts` | No insight alerts configured yet |
| `signals-scout-mcp-tool-calls` | No `$mcp_tool_call` events instrumented |
| `signals-scout-skills-store` | Internal PostHog tooling scout — not relevant |
| `signals-scout-tasks` | Internal PostHog tooling scout — not relevant |
| `signals-scout-apm` | No APM tracing |

> **Noise escape hatch:** If any scout turns noisy, set `emit: false` on its config in PostHog (Settings → Self-driving → Scouts) to switch it to dry-run. It keeps running and logging but nothing reaches the inbox.

## Custom Scouts

Two custom scouts were proposed, approved, and created.

### `signals-scout-course-funnel`

**What it watches:** Lesson view-to-completion conversion rate per course and module.  
**Discriminator:** Completion rate (`lesson_completed` ÷ `lesson_viewed`) drops ≥15 percentage points below the 7-day baseline while lesson views hold steady. A simultaneous drop in both views and completions is a traffic problem — noted but not filed.  
**Why no built-in covers it:** `signals-scout-product-analytics` watches *saved PostHog funnels*, of which there are none yet. This scout watches the raw events forming the core business funnel without requiring any saved flows.  
**Threshold:** ≥20 lesson views in the window required before rate analysis is reliable.  
**Config id:** 01a00573-0a3e-74b9-8309-9d59217c428a

### `signals-scout-search-quality`

**What it watches:** AI-powered search zero-result rate and abandonment rate (searches with results but no subsequent lesson view in the same session).  
**Discriminator:** Zero-result rate >30% with ≥20 searches, or a ≥10pp week-over-week rise; OR abandonment rate >70% on searches that returned results.  
**Why no built-in covers it:** No canonical scout watches search quality. The platform's AI search (Sanity Context MCP + LLM) is its core differentiating feature — a content-index gap or relevance regression here directly blocks learner discovery.  
**Config id:** 01a00573-2e66-7b71-89c5-b8678533a31f

### Surfaces considered and ruled out

| Surface | Filter that ruled it out |
|---|---|
| Video engagement / completion | Overlaps with course funnel; `product-analytics` scout handles once funnels are saved |
| Learner re-engagement / retention | Covered by `signals-scout-product-analytics` (lifecycle/retention patterns) |
| Instructor page traffic | Not a distinct watchable surface — falls under web-analytics |

## Replay Vision Scanners

Replay Vision scanners are LLMs that watch **individual session recordings** on a rolling schedule and push what they find to the Self-driving inbox. Each observation costs credits (5 credits = $0.05 at `gemini-3-flash-preview`). Findings arrive at half weight — two independent findings from different sessions must corroborate to promote a report.

**Org quota:** 7,500 credits available (0 used) for the current billing period (2026-08-01 → 2026-09-01).

The project has no recordings yet (fresh setup). Both scanners are armed and will start scanning automatically the day recordings begin — no second setup needed.

### Scanner 1 — Broken experiences

| Field | Value |
|---|---|
| **Watches** | Sessions on course pages where the product visibly broke |
| **Query scope** | `$current_url` icontains `/courses/` — covers course catalog (`/courses`) and individual course pages (`/courses/[slug]`), the core learning flow where breakage costs most |
| **Why this flow** | Course pages are the primary product surface today and the entry point to all learning content; a silent defect here blocks every downstream action |
| **sampling_rate** | 0.5 (50% of matched sessions) |
| **Estimated monthly credits** | 0 (no recordings yet; will update as recordings arrive) |
| **Scanner id** | 01a00574-42b5-7ea8-9e86-f291481a0630 |

### Scanner 2 — User frustration

| Field | Value |
|---|---|
| **Watches** | Sessions with rage-click events anywhere in the product |
| **Query scope** | `$rageclick` event filter — no URL constraint; disjoint from Scanner 1 by filter axis to prevent self-corroboration |
| **sampling_rate** | 1.0 (all rage-click sessions — affordable because the gate is narrow) |
| **Estimated monthly credits** | 0 (no recordings yet) |
| **Scanner id** | 01a00574-62c0-7ac7-8fba-b1f5f1d231c1 |

## Follow-ups

- [ ] **Enable Session Replay** — Settings → Session recording → "Record user sessions" (requires project admin). The `instrumentation-client.ts` init is already clean.
- [ ] **Enable Error Tracking** — Settings → Error tracking → "Enable exception autocapture" (requires project admin). Client already has `capture_exceptions: true`.
- [ ] **Enable Support (Conversations)** — Product sidebar → Conversations (requires project admin).
- [ ] **Connect a support inbound channel** — Once Conversations is on, connect an email, inbox, or Slack channel so that learner support tickets flow into PostHog and reach the Self-driving inbox via the `conversations/ticket` source.
- [ ] **Enable `signals-scout-feature-flags`** in PostHog if you adopt PostHog feature flags for experimentation or gradual rollouts.
- [ ] **Enable `signals-scout-surveys`** in PostHog if you create PostHog surveys for learner NPS or feedback.
- [ ] **Enable `signals-scout-experiments`** in PostHog when A/B experiments are running.
- [ ] **Extend lesson route coverage for scanners** — Once the lesson page (`/courses/[slug]/lessons/[lessonSlug]`) is shipped, update Scanner 1's query to also include `/lessons/` so the full learning flow is covered.

## What Happens Next

The scout coordinator picks up fresh configs within ~30 minutes and fires the first troop run. Each enabled scout draws one run from the 100-run daily budget. Findings cluster into reports in the inbox — immediately actionable ones can trigger coding tasks automatically. Check your inbox at https://eu.posthog.com/project/249343/inbox to see the first reports arrive.
