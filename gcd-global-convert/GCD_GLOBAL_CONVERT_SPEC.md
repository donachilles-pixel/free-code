# GCD Global Convert Specification

Last updated: 2026-04-24

## 1. Product summary

GCD Global Convert is the first recommended product to build.

Positioning:

```text
AI conversion agent for self-serve SaaS and AI tools.
```

Customer-facing promise:

```text
Turn more signups into activated and paid users automatically.
```

Primary funnel:

```text
Website visit -> Signup -> Onboarding -> First value -> Upgrade -> Stripe payment
```

Portfolio role:

```text
GCD Platform -> GCD Global Convert
```

This product owns the US/global conversion loop. It should focus on existing traffic and existing signup intent, not net-new demand generation.

## 2. ICP

Best-fit customers:

- US-first or global self-serve SaaS
- AI tools
- developer tools
- productivity tools
- browser extensions
- prosumer-to-SMB tools
- teams with existing traffic and signups
- teams using Stripe, email, and product analytics

Ideal company profile:

- 5 to 100 employees
- monthly website traffic above 5,000 visits
- monthly signups above 300
- self-serve payment already exists or is close to launch
- free trial, free credits, usage cap, or freemium plan exists
- product value can be demonstrated within minutes

Bad fit:

- enterprise-only sales
- products requiring procurement
- products requiring heavy onboarding services
- products with no self-serve payment
- products with very low signup volume

Primary buyer:

- founder
- head of growth
- product lead
- lifecycle marketing lead

Primary user:

- growth manager
- product manager
- founder

## 3. Jobs to be done

Primary jobs:

- identify why new signups fail to activate
- create the shortest path to first value for each user
- trigger upgrade prompts at real value moments
- recover abandoned checkout and failed payment events
- show which playbooks created measurable paid conversion lift

Customer language:

```text
We have signups, but too few users become paid customers.
```

## 4. MVP scope

v0.1 must include:

- web and product JS SDK
- server-side event API
- Stripe webhook integration
- basic email integration
- activation event configuration
- upgrade trigger configuration
- activation rescue playbook
- value-moment upgrade playbook
- abandoned checkout playbook
- failed payment playbook
- funnel dashboard
- agent action log

v0.1 should not include:

- ad buying
- cold outbound
- full CRM
- support chatbot replacement
- multi-touch enterprise sales workflows
- complex attribution across every marketing channel

## 5. Core features

### 5.1 Onboarding and setup

Setup flow:

1. Connect website SDK.
2. Connect product event API or SDK.
3. Connect Stripe.
4. Define activation event.
5. Define value moment.
6. Define paid conversion event.
7. Import pricing plans.
8. Select first playbooks.
9. Run in observe-only mode.
10. Turn on automated actions.

Required setup screens:

- product profile
- ICP and audience profile
- funnel event mapping
- activation definition
- pricing and plan mapping
- integration checklist
- playbook review
- launch checklist

### 5.2 Activation Agent

Responsibilities:

- detect incomplete onboarding
- ask the minimum required question
- select the best template or starting point
- auto-create demo content or demo workspace
- recommend next step inside product
- send one contextual rescue email if user gets stuck
- suppress actions when the user is already active

Activation tactics:

- first task checklist
- template recommendation
- generated sample project
- contextual tooltip
- in-app prompt
- lifecycle email
- calendar-free self-serve guide

Activation success metric:

```text
activation_completed within 24 hours of signup
```

### 5.3 Conversion Agent

Responsibilities:

- detect value moment
- estimate upgrade readiness
- choose plan recommendation
- trigger in-app upgrade prompt
- trigger lifecycle email if user leaves
- recover checkout abandonment
- answer common pricing objections using approved content

Upgrade triggers:

- user creates first successful output
- user exports or shares result
- user invites teammate
- user hits free credits or usage cap
- user repeats a high-intent action
- user visits pricing page after activation
- user starts checkout but does not pay

Conversion success metric:

```text
paid subscription within 7 days of value moment
```

### 5.4 Revenue Rescue Agent

Responsibilities:

- detect failed Stripe invoice payment
- detect canceled subscription
- detect trial ending without activation
- detect trial ending after activation
- detect usage cap reached without upgrade
- send recovery message or in-app prompt
- route high-value accounts to human task if configured

Recovery actions:

- update payment method link
- plan downgrade recommendation
- temporary credit extension
- usage summary email
- founder-style personal note
- human follow-up task

## 6. Screens

Required v0.1 screens:

- Home dashboard: funnel, revenue lift, active playbooks
- Funnel: visit, signup, activation, upgrade, paid
- Playbooks: list, status, performance, controls
- Playbook editor: trigger, segment, actions, guardrails
- Users: lifecycle stage, events, agent actions
- Experiments: variants and lift
- Integrations: SDK, Stripe, email
- Settings: billing, team, compliance, suppression

## 7. APIs and SDK

Client SDK:

```html
<script src="https://cdn.gcd.ai/sdk.js" data-project-id="proj_123"></script>
```

Server event endpoint:

```http
POST /v1/events
```

Identify endpoint:

```http
POST /v1/identify
```

Track activation:

```http
POST /v1/events
{
  "event_name": "activation_completed",
  "user_id": "user_123",
  "properties": {
    "activation_type": "first_project_created"
  }
}
```

Action webhook:

```http
POST /v1/actions/webhook
```

## 8. Data contract

Minimum event fields:

```json
{
  "event_id": "evt_123",
  "event_name": "activation_completed",
  "timestamp": "2026-04-24T10:00:00Z",
  "workspace_id": "ws_123",
  "project_id": "proj_123",
  "anonymous_id": "anon_123",
  "user_id": "user_123",
  "account_id": "acct_123",
  "channel": "website",
  "source": "google",
  "campaign": "ai_writer_launch",
  "properties": {}
}
```

Required lifecycle events:

- `page_viewed`
- `cta_clicked`
- `signup_started`
- `signup_completed`
- `onboarding_started`
- `activation_started`
- `activation_completed`
- `value_moment_detected`
- `paywall_viewed`
- `upgrade_clicked`
- `checkout_started`
- `payment_succeeded`
- `payment_failed`
- `subscription_started`
- `subscription_renewed`
- `subscription_canceled`
- `usage_limit_reached`
- `trial_started`
- `trial_ending_soon`
- `trial_expired`
- `message_sent`
- `message_opened`
- `message_clicked`
- `agent_action_taken`
- `human_handoff_created`
- `email_captured`
- `email_verified`
- `workspace_created`
- `stripe_checkout_started`
- `stripe_checkout_completed`
- `stripe_invoice_payment_failed`
- `stripe_subscription_updated`

Default stages:

```text
anonymous
known_lead
signed_up
onboarding
activated
qualified_for_upgrade
checkout_intent
paid
retention_risk
churned
reactivated
```

## 9. Integrations

v0.1 integrations:

- Stripe
- Postmark, SendGrid, or customer SMTP
- Segment-compatible event stream
- Webhook

v0.2 integrations:

- HubSpot
- Intercom
- Customer.io
- Amplitude
- Mixpanel
- Supabase

## 10. Pricing

Recommended packaging:

- Starter: $99/month
- Growth: $299/month
- Scale: $799/month
- optional outcome add-on

Outcome examples:

- recovered checkout
- recovered failed payment
- trial-to-paid conversion influenced by active playbook

Pricing principle:

```text
Base subscription covers platform cost. Outcome or usage pricing captures upside without making early adoption risky.
```

## 11. Success metrics

North-star metric:

```text
incremental paid conversions influenced by GCD
```

Operating metrics:

- signup to activation rate
- activation to paid rate
- median time to first value
- checkout recovery rate
- failed payment recovery rate
- agent cost per paid user
- playbook lift versus baseline

## 12. Engineering kickoff checklist

First implementation slice:

1. Define `workspace`, `project`, `user`, `account`, `event`, `stage`, `playbook`, and `action` tables.
2. Ship `/v1/events` and `/v1/identify`.
3. Ship JS SDK with anonymous identity, UTM capture, page view, CTA, and identify support.
4. Implement stage engine for signup, activation, upgrade intent, checkout, paid, and rescue states.
5. Implement Stripe webhook ingestion.
6. Build dashboard funnel view and user timeline.
7. Implement activation rescue playbook in observe-only mode.
8. Implement value-moment upgrade playbook with manual approval.
9. Implement checkout and failed-payment recovery.
10. Add action audit log, suppression, and unsubscribe controls.

Handoff prompt for a new engineering model:

```text
Read GCD_GLOBAL_CONVERT_SPEC.md first.

Build GCD Global Convert v0.1: an AI conversion agent for self-serve SaaS and AI tools.
Start with the event API, JS SDK, Stripe webhook ingestion, stage engine, activation rescue playbook, value-moment upgrade playbook, dashboard funnel, and user timeline.
Do not build acquisition, CRM, cold outbound, or support chatbot features.
```

