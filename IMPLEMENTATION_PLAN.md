# Implementation Plan: Voice-to-Text Ordering with Memory Context

## The Series

This project is part of a series where I build production-quality features for real companies — until they hire me. Each project targets a specific company, identifies a feature gap, and delivers a working proof-of-concept that demonstrates both the product vision and the engineering to back it up.

**This episode: Uber Eats.**

I am in no way affiliated with Uber, Uber Eats, or any of their subsidiaries.

---

## The Problem

Uber Eats knows a lot about you — what you order, how often, which restaurants you go back to. But it doesn't *use* that knowledge in a way that feels personal. Every time you open the app, you're starting from scratch: browsing, scrolling, tapping through menus, manually customizing modifiers.

Meanwhile, your regular coffee shop barista remembers your order after two visits.

## The Feature

**Voice-to-text ordering with invisible preference memory.**

You speak to the app like you'd speak to that barista. It knows your usual spots, remembers that you hate pickles, and can find you a new restaurant when you're tired of your go-to. No settings page, no preference manager — it just knows you.

### What It Looks Like

1. Open the app — a high-fidelity Uber Eats home screen
2. Say **"Hey Uber Eats"** or tap the mic in the search bar
3. Say: *"I want shawarma but not from Shelby's. Recommend a new spot."*
4. The AI responds: *"Okay, ditching Shelby's today — bold move. Found 'Beirut Grill,' 4.8 stars, people are obsessed. Want me to place the order? No pickles, obviously."*
5. Confirm → checkout → done

### What's Happening Under the Hood

- **Voice capture** via Web Speech API with real-time transcription in the search bar
- **Wake word detection** — "Hey Uber Eats" activates the mic hands-free
- **Order parsing** — a mock NLP engine extracts intent, restaurant, items, and modifiers from natural speech
- **Preference memory** — stored in localStorage, auto-applied to every order, invisible to the user
- **Witty AI personality** — short, funny responses that reference your habits naturally

---

## What We Built

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js + Tailwind CSS | Fast to build, high-fidelity UI that closely matches Uber Eats |
| Voice | Web Speech API | Browser-native, free, real-time — works in Chrome for the demo |
| AI / NLP | Mock engine (GPT-4o optional) | Demo works out of the box with no API key. GPT-4o can be enabled for richer responses |
| Memory | localStorage | Zero infrastructure, persists across sessions |
| Data | Static JSON | 4 restaurants with realistic menus and modifiers |

### Key Design Decisions

**Mock AI by default.** The demo runs without any API keys. A built-in NLP engine handles keyword detection, cuisine matching, restaurant exclusion, preference application, and witty response generation. GPT-4o is an optional upgrade for anyone who wants more natural language understanding.

**Invisible memory.** There is no settings page or preference manager. The system stores your preferences (`no pickles`), your usual spots (`Shelby's for shawarma`), and your order history — then applies them silently. The user only notices when the AI says "No pickles, obviously."

**Single-turn voice, visual confirmation.** You speak once, the AI proposes, you confirm visually at checkout. No multi-turn dialogue, no back-and-forth. This avoids the complexity of conversational state management while still delivering the magic moment.

**High-fidelity UI.** The app looks and feels like Uber Eats — not a wireframe or a generic food app. This matters for the demo because the feature needs to feel like it belongs in the real product.

### Architecture

```
User speaks → Web Speech API captures audio
                ↓
         Transcript text
                ↓
    API route: /api/parse-order
    (mock engine or GPT-4o)
                ↓
    Structured order: restaurant, items, modifiers
                ↓
    Preference engine applies stored preferences
    (e.g., auto-remove pickles)
                ↓
    AI generates witty response
                ↓
    Checkout confirmation screen
                ↓
    User confirms → order placed → history updated
```

### Files

```
src/
  app/
    page.tsx                    — Home screen with voice integration
    restaurant/[id]/page.tsx    — Restaurant menu page
    api/parse-order/route.ts    — Mock NLP engine + optional GPT-4o
  components/
    SearchBar.tsx               — Uber Eats search bar with mic icon
    VoiceOverlay.tsx            — Loading + AI response overlay
    RestaurantCard.tsx          — Restaurant card
    MenuItem.tsx                — Menu item with preference indicators
  lib/
    voice.ts                    — Speech capture + wake word detection
    ai.ts                       — AI client
    preferences.ts              — Preference memory engine + seed data
    menuMatcher.ts              — Fuzzy match speech → menu items
  data/
    restaurants.json            — 4 mock restaurants with full menus
```

---

## Engineering Standards

All code in this repo follows the principles laid out in [ENGINEERING_EXCELLENCE.md](./ENGINEERING_EXCELLENCE.md):

- **No over-engineering.** This is an MVP. Every file earns its place.
- **Uber Eats stack-compliant.** Code patterns mirror what a real Uber engineer would recognize — isolated API layers, typed interfaces, domain-specific naming.
- **Simple and swappable.** Each piece (voice capture, AI parsing, preference storage, menu matching) is a single file with a clean interface. Swap localStorage for Cassandra, swap the mock engine for GPT-4o, swap Web Speech API for a native module — the rest of the pipeline doesn't change.

---

## For Uber Engineers

If you're an engineer at Uber and want to take this further, see [UBER_ENGINEER_IMPLEMENTATION_PLAN.md](./UBER_ENGINEER_IMPLEMENTATION_PLAN.md) for a detailed port guide covering:

- How each MVP component maps to Uber's real infrastructure (Michelangelo, Palette, Gen AI Gateway, Elasticsearch)
- A 5-step integration path from this repo to production
- 6 reasons this feature doesn't exist yet — and solutions for each one
