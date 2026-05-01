# DomainBreezy MVP

DomainBreezy is a GPT-first domain assistant that helps users go from idea to available domain options, then either register in chat (Cloudflare/DNSimple/Porkbun when connected) or use external checkout fallback.

## Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- OpenAI (domain generation)
- Namecheap API (availability checks)
- Cloudflare Registrar API (optional in-chat registration)
- DNSimple Registrar API (optional in-chat registration)
- Porkbun API (optional in-chat registration)
- Stripe Checkout + webhook verification

## Local setup
1. Install dependencies:
   - `npm install`
2. Create env file:
   - `cp .env.example .env.local`
3. Fill required variables in `.env.local`.
4. Start the app:
   - `npm run dev`

## API endpoints
- `POST /api/generate-domains`
- `POST /api/check-availability`
- `POST /api/create-checkout-session`
- `POST /api/connect-registrar`
- `GET /api/registrar-connections`
- `POST /api/purchase-domain`
- `POST /api/stripe/webhook`

## Custom GPT actions
- OpenAPI schema: `openapi/domainbreezy-actions.json`
- GPT instructions: `docs/custom-gpt-instructions.md`
- Setup steps: `docs/gpt-actions-setup.md`

## Test commands
- `npm run lint`
- `npm test`

## Deployment checklist (Vercel)
1. Create a Vercel project and connect this repository.
2. Set all environment variables from `.env.example`.
3. Confirm production URL is correct in `NEXT_PUBLIC_SITE_URL`.
4. Configure Stripe webhook endpoint:
   - `https://<your-domain>/api/stripe/webhook`
5. Import `openapi/domainbreezy-actions.json` into GPT Actions.
6. Validate full flow:
   - Idea prompt -> generated domains -> availability + pricing options -> in-chat purchase attempt.
   - If not connected, prompt for registrar connect flow at `/connect-registrar`.
   - If Namecheap selected, fallback to checkout link -> success page -> Namecheap redirect.

## Compliance notes
- DomainBreezy may facilitate registrations through connected registrar APIs.
- The $4.99 service fee is included in displayed total prices.
- Namecheap remains an external checkout fallback flow.

## Registrar connect UX
- Use `/connect-registrar` as a popup-style companion page while chat stays visible.
- For MVP, connected registrar credentials are stored in memory by session cookie (not persistent across deploys/restarts).
