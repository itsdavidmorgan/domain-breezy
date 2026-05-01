# DomainBreezy — GPT-First MVP Spec

## Core Product

**DomainBreezy** is a Custom GPT-powered domain assistant that helps users go from idea → available domain → purchase flow quickly.

The MVP:
1. Runs primarily as a **Custom GPT inside ChatGPT**
2. Generates domain names from a user idea
3. Checks domain availability via the Namecheap API
4. Lets users “Instant Secure” an available domain
5. Charges a **$5 one-time DomainBreezy service fee via Stripe**
6. Redirects users to Namecheap to complete domain registration

---

## Core Positioning

**Headline:**  
Find and secure the perfect domain in seconds.

**Short Description:**  
DomainBreezy is an AI-powered domain assistant that helps founders, creators, and builders quickly discover available domain names and move into checkout with less friction.

**Core Promise:**  
Tell DomainBreezy your idea. Get strong available domains. Secure your favorite in minutes.

---

## Architecture Overview

```text
User in ChatGPT
→ DomainBreezy Custom GPT
→ DomainBreezy API
→ LLM domain generation
→ Namecheap availability check
→ User selects domain
→ Stripe Checkout for $5 service fee
→ domainbreezy.com/success
→ Namecheap domain registration
```

---

## System Roles

### Custom GPT
The GPT is the primary MVP interface.

It:
- Takes the user's business/project idea
- Calls the DomainBreezy API
- Presents available domain options
- Explains the $5 service fee
- Sends users to Stripe Checkout when they choose a domain

### DomainBreezy API
The API is the actual product engine.

It:
- Generates domain ideas using an LLM
- Checks availability through Namecheap
- Creates Stripe Checkout sessions
- Provides success-page redirect logic

### domainbreezy.com
The website is the trust and transaction layer.

It includes:
- Minimal landing page
- API routes
- Stripe success page
- Namecheap redirect page

---

## Recommended Tech Stack

### Frontend / Web
- Next.js
- React
- Tailwind CSS

### Backend
- Next.js API routes or Express
- Node.js

### APIs
- OpenAI or Claude for domain generation
- Namecheap API for availability checks
- Stripe Checkout for the $5 one-time service fee

### Deployment
- Vercel recommended

---

## Environment Variables

```env
OPENAI_API_KEY=
NAMECHEAP_API_KEY=
NAMECHEAP_USERNAME=
NAMECHEAP_CLIENT_IP=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=https://domainbreezy.com
```

---

## API Base URL

```text
https://domainbreezy.com/api
```

---

## API Endpoints

## 1. POST `/api/generate-domains`

Generates domain name ideas based on a user’s project, product, brand, or business idea.

### Request

```json
{
  "idea": "AI tool for preserving memories and legacy"
}
```

### Response

```json
{
  "domains": [
    {
      "name": "memoryforge.com",
      "type": "brandable",
      "reason": "Strong emotional brand with a creative, durable feel."
    },
    {
      "name": "legacyvoice.ai",
      "type": "emotional",
      "reason": "Clearly connects legacy and voice, with a fitting AI-oriented TLD."
    }
  ]
}
```

---

## 2. POST `/api/check-availability`

Checks availability for generated domain names.

### Request

```json
{
  "domains": [
    "memoryforge.com",
    "legacyvoice.ai"
  ]
}
```

### Response

```json
{
  "results": [
    {
      "domain": "memoryforge.com",
      "available": false
    },
    {
      "domain": "legacyvoice.ai",
      "available": true
    }
  ]
}
```

---

## 3. POST `/api/create-checkout-session`

Creates a Stripe Checkout session for the $5 DomainBreezy service fee.

### Request

```json
{
  "domain": "legacyvoice.ai"
}
```

### Response

```json
{
  "checkout_url": "https://checkout.stripe.com/..."
}
```

---

## Stripe Setup

### Product Name

```text
DomainBreezy Instant Secure
```

### Price

```text
$5 one-time
```

### Checkout Mode

```text
payment
```

### Success URL

```text
https://domainbreezy.com/success?domain={DOMAIN}
```

### Cancel URL

```text
https://domainbreezy.com/cancel?domain={DOMAIN}
```

---

## Required Payment Disclosure

This disclosure should appear before the user clicks the payment link:

```text
DomainBreezy charges a $5 instant secure service fee.
Domain registration is completed separately via Namecheap.
```

Optional expanded version:

```text
The $5 fee covers DomainBreezy’s AI domain discovery and instant secure flow. Your actual domain registration is completed separately through Namecheap, where you will pay the registrar’s domain registration price.
```

---

## Success Page

### Route

```text
/success
```

### Query Parameters

```text
domain={selectedDomain}
```

### Purpose

After Stripe payment succeeds, the user lands on the success page. The page should clearly explain that they still need to complete domain registration through Namecheap.

### Success Page Copy

```text
Almost there — let’s finish securing your domain.

Your DomainBreezy instant secure fee has been processed. To complete registration, continue to Namecheap and purchase your selected domain.
```

### CTA

```text
Complete Registration
```

### Namecheap Redirect URL

```text
https://www.namecheap.com/domains/registration/results/?domain={DOMAIN}
```

### Optional Behavior

- Show the CTA button immediately
- Auto-redirect after 3–5 seconds
- Keep the CTA visible in case the redirect does not happen

---

## Cancel Page

### Route

```text
/cancel
```

### Copy

```text
No problem — your DomainBreezy checkout was canceled.

Your domain has not been registered yet. You can return to ChatGPT and choose another domain, or try again when you’re ready.
```

---

## Custom GPT Setup

## GPT Name

```text
DomainBreezy
```

## GPT Description

```text
Find and secure available domain names from inside ChatGPT.
```

## GPT Instructions

```text
You are DomainBreezy, an AI domain assistant that helps users find and secure domains quickly and easily.

Your job is to:
1. Help users find strong domain names for businesses, apps, brands, products, and projects.
2. Generate domain ideas based on the user's description.
3. Check domain availability using the available API actions.
4. Present results clearly and help the user choose the best available option.
5. When the user selects a domain, create a checkout session for the DomainBreezy Instant Secure service.

When a user describes an idea:
- Call generateDomains.
- Then call checkAvailability.
- Present the best results grouped clearly.

Group results into:
- Top Picks
- Available Now
- Taken / Unavailable

When presenting domain names:
- Prioritize clear, trustworthy, memorable names.
- Prefer .com when strong options exist.
- Use .ai for AI/software/product ideas when appropriate.
- Use .co only when the name is strong.
- Avoid hyphens and awkward spellings.
- Explain briefly why the best names work.

When a user selects a domain:
- Call createCheckout.
- Provide the Stripe checkout link.

Required disclosure:
DomainBreezy charges a $5 instant secure service fee. Domain registration is completed separately via Namecheap.

Do not imply that DomainBreezy itself is the registrar.
Do not imply that payment of the $5 fee registers the domain.
Always make clear that the user must complete domain registration through Namecheap after paying the DomainBreezy fee.
```

---

## Custom GPT Actions — OpenAPI Schema

Use this as the starting point for GPT Actions.

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "DomainBreezy API",
    "version": "1.0.0",
    "description": "API for generating domain names, checking availability, and creating DomainBreezy checkout sessions."
  },
  "servers": [
    {
      "url": "https://domainbreezy.com/api"
    }
  ],
  "paths": {
    "/generate-domains": {
      "post": {
        "operationId": "generateDomains",
        "summary": "Generate domain name ideas",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "idea": {
                    "type": "string",
                    "description": "The user's business, product, app, brand, or project idea."
                  }
                },
                "required": ["idea"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Generated domain suggestions."
          }
        }
      }
    },
    "/check-availability": {
      "post": {
        "operationId": "checkAvailability",
        "summary": "Check domain availability",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "domains": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                },
                "required": ["domains"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Domain availability results."
          }
        }
      }
    },
    "/create-checkout-session": {
      "post": {
        "operationId": "createCheckout",
        "summary": "Create Stripe checkout session for DomainBreezy Instant Secure",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "domain": {
                    "type": "string",
                    "description": "The selected domain name."
                  }
                },
                "required": ["domain"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Stripe checkout URL."
          }
        }
      }
    }
  }
}
```

---

# Landing Page Spec

## Page

```text
https://domainbreezy.com
```

## Goal

The landing page should establish trust, explain the product in seconds, and send users into the Custom GPT.

This does not need to be a full marketing site for MVP. It should be simple, clear, and conversion-focused.

---

## Landing Page Structure

### Hero Section

**Headline:**

```text
Find and secure the perfect domain in seconds.
```

**Subheadline:**

```text
DomainBreezy is an AI-powered domain assistant that helps you turn an idea into available domain names — then guides you through securing your favorite.
```

**Primary CTA:**

```text
Try DomainBreezy in ChatGPT
```

**Secondary CTA:**

```text
How it works
```

---

### How It Works Section

Use three simple steps:

#### 1. Describe your idea

```text
Tell DomainBreezy what you’re building — an app, business, product, brand, or side project.
```

#### 2. Get available domains

```text
DomainBreezy generates smart domain ideas and checks availability in real time.
```

#### 3. Secure your favorite

```text
Choose a domain, pay the $5 DomainBreezy instant secure fee, then complete registration through Namecheap.
```

---

### Disclosure Section

Include this clearly near the CTA and footer:

```text
DomainBreezy is not a domain registrar. Domain registration is completed separately through Namecheap. The $5 DomainBreezy fee covers AI-powered domain discovery and the instant secure flow.
```

---

### Footer

Suggested footer links:
- Privacy Policy
- Terms
- Contact
- Built by DomainBreezy

---

## Landing Page Visual Style

DomainBreezy should feel:
- Simple
- Fast
- Trustworthy
- Lightweight
- Friendly, but not childish

Suggested style:
- Clean white or off-white background
- Blue, teal, or soft green accent
- Rounded cards
- Minimal gradients
- Strong CTA button
- No clutter

---

## Starter Landing Page Copy

```text
DomainBreezy

Find and secure the perfect domain in seconds.

Stop bouncing between name generators, registrar searches, and checkout pages. DomainBreezy helps you describe your idea, discover strong available domains, and move quickly toward ownership.

Try DomainBreezy in ChatGPT

How it works:

1. Describe your idea
Tell DomainBreezy what you’re building.

2. Get available domains
Receive smart, brandable domain suggestions with availability checks.

3. Secure your favorite
Pay the $5 DomainBreezy instant secure fee, then complete registration through Namecheap.

DomainBreezy is not a domain registrar. Domain registration is completed separately through Namecheap.
```

---

# MVP Build Order

## Step 1 — Backend API

Build:
- `/api/generate-domains`
- `/api/check-availability`
- `/api/create-checkout-session`

Stub Namecheap if necessary during early local development.

---

## Step 2 — Stripe Checkout

Build:
- Stripe Checkout session creation
- Success page
- Cancel page

Confirm:
- selected domain is passed through metadata
- success page receives the selected domain
- redirect to Namecheap works

---

## Step 3 — GPT Actions

Build:
- Custom GPT instructions
- OpenAPI schema
- Action authentication if needed
- Test all three API actions inside ChatGPT

---

## Step 4 — Landing Page

Build:
- Minimal homepage
- CTA to Custom GPT
- Disclosure language
- Footer links

---

## Step 5 — Full Flow Test

Test:
1. User asks GPT for domains
2. GPT generates suggestions
3. GPT checks availability
4. User selects one
5. GPT returns Stripe checkout link
6. User pays $5
7. User lands on success page
8. User continues to Namecheap

---

# MVP Exclusions

Do not build these yet:
- User accounts
- Saved domain history
- Domain portfolio
- DNS setup
- Email setup
- Direct registrar purchasing
- Multi-registrar comparison
- Browser extension
- Full standalone chat UI

---

# Phase 2 Ideas

After validation:
- Standalone web app
- Multi-registrar search
- Domain price comparison
- Registrar reseller API integration
- Full “buy for me” flow
- Saved projects
- Domain monitoring
- Brand kit generator
- One-click landing page creation
- Shopify / WordPress setup assistant

---

# Key Product Principle

DomainBreezy is not just a domain lookup tool.

It is:

```text
The fastest way to go from idea → domain decision → ownership flow.
```

The product wins by making naming and domain purchase feel effortless, trustworthy, and fast.
