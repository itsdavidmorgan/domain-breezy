# GPT Actions Setup

## 1) Deploy DomainBreezy API
- Deploy this project to Vercel.
- Set required environment variables from `.env.example`.
- Confirm endpoints are reachable at `https://<your-domain>/api`.

## 2) Import OpenAPI spec into Custom GPT
- Open the GPT Builder.
- Go to **Actions** and import `openapi/domainbreezy-actions.json`.
- Update the server URL in the OpenAPI file if your production URL differs.

## 3) Paste GPT instructions
- Copy text from `docs/custom-gpt-instructions.md`.
- Paste into GPT **Instructions**.

## 4) Configure action auth
- If your API is private, configure action authentication.
- If public for MVP, add rate limiting before launch.

## 5) Validate operation chain
1. Ask for domain ideas with a clear product concept.
2. Confirm GPT calls `generateDomains`.
3. Confirm GPT calls `checkAvailability`.
4. Confirm GPT displays a table including total price with service fee.
5. Select an available domain and registrar, then confirm GPT calls `purchaseDomain`.
6. If result is `requires_external_checkout`, confirm GPT calls `createCheckout`.
7. Verify disclosure appears before checkout URL for external flow.

## 6) Success flow check
- Complete checkout in Stripe test mode.
- Verify `/success?domain=...` loads.
- Verify Namecheap redirect works and CTA remains visible.
