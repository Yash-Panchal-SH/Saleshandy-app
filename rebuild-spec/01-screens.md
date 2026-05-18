# Screens

## Public / Auth
- Login (email + password + MFA)
- Agency / white-label login
- SSO login + `/sso-callback`
- Sign up (standard + LTD variant)
- Reset password + callback
- Accept invite
- Verify email
- OAuth callbacks (generic + whitelabel)
- Connect-email-account callback
- Public demo
- Checkout (Stripe 3DS)
- Email infra pay (`/email-infra/pay`)
- Inbox Radar — public shareable report

## Authenticated
- Tasks (`/tasks`, `/tasks/:prospectId`, `/tasks/:prospectId/:tab`)
- Prospects / CRM (table, kanban, list views)
- Leads
- Lead Finder v2 (tabs + subtabs + prospect detail)
- CSV enrichment (new, status)
- Email accounts (list, create, `/:hashId/:tab`)
- Email insights
- Domains
- Inframail IPs
- Email warmup
- Email verifier
- Inbox Radar (authenticated)
- Dialer (call logs, call detail, phone numbers, number settings)
- Sequence (campaign builder + nested screens like seq setting, seq prospect, subsequence)
- Templates
- Reports
- Mailbox emails
- Unified inbox
- Growth hub
- LinkedIn automation
- Billing — upgrade plan, subscriptions
- Agency client management
- Agency portal

## Settings (nested under `/settings/*`)
- My profile
- Schedule
- Custom fields
- Custom domain
- Admin settings
- API tokens
- Users & teams
- Out of office
- Webhook
- Do not contact
- Do not call
- Custom outcomes
- Call outcomes
- Whitelabel
- Safety settings
- MCP settings
- Billing & subscription

## System
- 404 not found
- 500 server error
- Maintenance mode
- Offline fallback
- Plan / permission block page

## Showcase (internal)
- Component library / Storybook route
