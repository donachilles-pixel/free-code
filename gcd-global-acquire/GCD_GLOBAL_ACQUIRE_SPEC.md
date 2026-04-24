# GCD Global Acquire Specification

Last updated: 2026-04-24

## 1. Product summary

GCD Global Acquire is the second-stage US/global acquisition product.

Positioning:

```text
AI inbound growth agent for self-serve SaaS and AI tools.
```

Customer-facing promise:

```text
Create more qualified traffic and intent from content, landing pages, and campaigns.
```

Primary funnel:

```text
Market signal -> Content / page / campaign -> Visitor -> Captured intent -> Signup
```

Portfolio role:

```text
GCD Platform -> GCD Global Acquire
```

Recommended launch timing:

```text
After GCD Global Convert proves it can convert existing signups into paid users.
```

This product owns net-new qualified demand generation for the US/global market. It should optimize for qualified signup and downstream paid conversion, not raw traffic.

## 2. ICP

Best-fit customers:

- SaaS and AI tools with clear use cases
- teams with some content or paid acquisition motion
- teams that know ICP but cannot produce enough high-intent pages or campaigns
- teams that already have GCD Convert installed

Ideal company profile:

- 10 to 150 employees
- clear categories and use cases
- multiple ICP segments
- existing blog, docs, templates, or landing pages
- enough conversion data to learn from

Bad fit:

- companies without clear positioning
- companies expecting fully automated brand strategy
- heavily regulated products requiring legal review for every claim
- teams with no ability to publish pages or run campaigns

Primary buyer:

- founder
- head of growth
- content lead
- demand generation lead

Primary user:

- growth marketer
- content marketer
- founder
- product marketer

## 3. Jobs to be done

Primary jobs:

- discover high-intent acquisition opportunities
- generate and test use-case landing pages
- generate campaign variants
- create SEO or AI-search-friendly content briefs
- route acquired traffic into the right Convert playbook
- measure acquisition quality by downstream activation and paid conversion

Customer language:

```text
We need more qualified signups, but we do not know which pages, topics, or campaigns will convert.
```

## 4. MVP scope

v0.1 must include:

- opportunity research workspace
- ICP and use-case mapping
- landing page brief generator
- landing page variant generator
- campaign message generator
- content calendar
- publish or export workflow
- acquisition-to-conversion attribution
- integration with GCD Global Convert

v0.1 should not include:

- autonomous ad budget spending
- autonomous cold email at scale
- social account takeover
- automatic claim generation without approval
- broad SEO suite replacement

## 5. Core features

### 5.1 Opportunity Agent

Responsibilities:

- analyze product positioning
- analyze existing pages and conversion data
- identify ICP-specific use cases
- identify competitor and alternative pages
- identify high-intent keyword clusters
- prioritize opportunities by likely conversion value

Output:

- opportunity backlog
- use-case page plan
- comparison page plan
- template page plan
- campaign plan

### 5.2 Page Agent

Responsibilities:

- generate landing page structure
- generate headline and CTA variants
- map proof points to ICP
- create FAQ and objection handling
- create integration with Convert playbooks
- create tracking plan

The Page Agent should optimize for qualified signup, not raw page views.

### 5.3 Campaign Agent

Responsibilities:

- generate campaign variants
- adapt message by channel
- create newsletter, LinkedIn, community, and paid search copy
- recommend target segment and landing page
- generate UTM structure
- measure downstream activation and paid conversion

### 5.4 Content Refresh Agent

Responsibilities:

- detect stale content
- detect pages with traffic but poor conversion
- recommend updates based on conversion data
- create variants for testing

## 6. Screens

Required screens:

- Acquisition overview: traffic, signup quality, paid conversion by source
- Opportunities: prioritized backlog
- Use cases: ICP, pain, offer, page status
- Page builder: brief, sections, variants, tracking
- Campaigns: channel, copy, status, result
- Attribution: source -> signup -> activation -> paid
- Approvals: pages and campaigns awaiting human review
- Brand rules: claims, tone, forbidden language, approved proof

## 7. Data model

Required inputs:

- website pages
- product description
- ICP definitions
- existing conversion data from GCD Convert
- traffic sources
- pricing and plan data
- approved claims and proof

Core objects:

- `opportunity`
- `content_asset`
- `landing_page`
- `campaign`
- `message_variant`
- `utm_rule`
- `content_approval`

Example opportunity:

```json
{
  "opportunity_id": "opp_123",
  "type": "use_case_page",
  "icp": "indie_ai_tool_founder",
  "intent": "reduce_trial_dropoff",
  "recommended_asset": "landing_page",
  "expected_goal": "qualified_signup",
  "priority_score": 0.82
}
```

Example landing page asset:

```json
{
  "landing_page_id": "lp_123",
  "opportunity_id": "opp_123",
  "title": "Reduce AI trial dropoff",
  "target_icp": "indie_ai_tool_founder",
  "primary_cta": "Start free trial",
  "status": "draft",
  "linked_convert_playbook": "activation_rescue"
}
```

## 8. APIs and workflow hooks

Create opportunity:

```http
POST /v1/acquire/opportunities
```

Create content asset:

```http
POST /v1/acquire/assets
```

Submit approval:

```http
POST /v1/acquire/assets/{asset_id}/approval
```

Record publish event:

```http
POST /v1/acquire/publish-records
```

Attribution events should reuse the shared event API:

```http
POST /v1/events
```

Required acquisition events:

- `opportunity_created`
- `asset_drafted`
- `asset_approved`
- `asset_published`
- `campaign_launched`
- `utm_visit_received`
- `qualified_signup_created`
- `asset_refreshed`

## 9. Integrations

v0.1 integrations:

- website CMS export
- Webflow or Framer export
- GitHub PR export for static sites
- Google Search Console
- Google Analytics
- GCD Global Convert

v0.2 integrations:

- ad platforms
- LinkedIn
- newsletter tools
- community platforms
- SEO tools

## 10. Pricing

Recommended packaging:

- Add-on to GCD Global Convert: $199/month
- Standalone Growth: $499/month
- Scale: $1,499/month

Usage metric:

- generated and tracked assets
- active campaigns
- monthly opportunity analysis

Outcome pricing should be delayed until attribution is strong enough.

## 11. Success metrics

North-star metric:

```text
qualified signups generated by GCD-created or GCD-optimized assets
```

Operating metrics:

- visitor to signup rate
- signup to activation rate by asset
- paid conversion by campaign
- cost per qualified signup
- content production cycle time
- page lift versus baseline

## 12. Engineering kickoff checklist

First implementation slice:

1. Define `opportunity`, `content_asset`, `landing_page`, `campaign`, `message_variant`, `utm_rule`, and `content_approval` tables.
2. Build opportunity backlog and priority scoring.
3. Build ICP and use-case configuration.
4. Build landing page brief generator.
5. Build page variant generation with human approval.
6. Build campaign copy generation with UTM rules.
7. Build publish/export workflow.
8. Connect attribution to GCD Global Convert events.
9. Build acquisition overview and asset performance screen.
10. Add brand rules, approved claims, and forbidden claim controls.

Handoff prompt for a new engineering model:

```text
Read GCD_GLOBAL_ACQUIRE_SPEC.md first.

Build GCD Global Acquire v0.1: an AI inbound growth agent for self-serve SaaS and AI tools.
Start with opportunity backlog, ICP/use-case mapping, landing page brief generation, campaign copy generation, approval workflow, CMS/export workflow, and attribution into GCD Global Convert.
Do not build autonomous ad spending, cold outbound, or social account takeover.
```

