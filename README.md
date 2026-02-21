# Uber Eats — Voice-to-Text Ordering with Memory Context

> Part of my series where I build features for companies until they hire me.
>
> **I am in no way affiliated with Uber, Uber Eats, or any of their subsidiaries.** This is an independent proof-of-concept built for educational and portfolio purposes.

---

## What This Is

A high-fidelity Uber Eats UI clone with a voice ordering feature and an invisible preference memory system. You speak your order, and the AI assistant:

- **Knows your usual spots** — "I want shawarma but not from Shelby's" and it finds you an alternative
- **Remembers your preferences** — said "no pickles" once? It auto-removes pickles from every future order
- **Has personality** — responds with short, witty replies instead of robotic confirmations
- **Works hands-free** — say "Hey Uber Eats" and it starts listening

The demo runs entirely on localhost with no external API keys required. The mock AI engine handles order parsing, restaurant recommendations, and preference memory out of the box.

## How It Works

1. Open the app — you see an Uber Eats home screen with restaurants
2. Tap the mic icon in the search bar (or say "Hey Uber Eats")
3. Speak your order naturally
4. A loading screen appears while the AI processes
5. The AI responds with a witty confirmation and shows the checkout
6. Confirm the order — done

Your preferences are remembered across sessions. No settings page, no configuration — it just works.

## Running Locally

```bash
# Clone the repo
git clone <repo-url>
cd uber-eats

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:3000** in Chrome (required for Web Speech API / voice features).

### Optional: Enable GPT-4o

The demo works without any API key using a built-in mock engine. To use OpenAI's GPT-4o for more natural AI responses:

1. Copy `.env.local` and add your key: `OPENAI_API_KEY=sk-your-key-here`
2. Restart the dev server

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, Tailwind CSS |
| Voice capture | Web Speech API (browser-native) |
| AI / NLP | Mock engine (default) or OpenAI GPT-4o (optional) |
| Preference memory | localStorage |
| Menu data | Static JSON |

## Project Structure

```
src/
  app/
    page.tsx                    — Home screen (restaurant listings)
    restaurant/[id]/page.tsx    — Restaurant menu page
    api/parse-order/route.ts    — AI order parsing (mock + optional GPT-4o)
  components/
    SearchBar.tsx               — Search bar with integrated mic icon
    VoiceOverlay.tsx            — Loading + AI response overlay
    RestaurantCard.tsx          — Restaurant card
    MenuItem.tsx                — Menu item with preference indicators
  lib/
    voice.ts                    — Web Speech API wrapper + wake word
    ai.ts                       — AI client
    preferences.ts              — localStorage memory engine
    menuMatcher.ts              — Fuzzy match speech to menu items
  data/
    restaurants.json            — Mock restaurants and menus
```

## Documentation

- [ENGINEERING_EXCELLENCE.md](./ENGINEERING_EXCELLENCE.md) — Code quality standards and Uber Eats stack compliance
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — What we built, why, and how it fits into the series
- [UBER_ENGINEER_IMPLEMENTATION_PLAN.md](./UBER_ENGINEER_IMPLEMENTATION_PLAN.md) — How an Uber engineer could integrate this into the real app, and why this feature doesn't exist yet
