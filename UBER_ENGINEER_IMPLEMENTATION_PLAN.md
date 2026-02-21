# Implementation Plan: Voice-to-Text Ordering with Memory Context

## Overview

This document outlines how a real Uber Eats engineer could take this proof-of-concept and integrate it into the production Uber Eats application. It also covers why this feature doesn't exist yet and how each blocker can be addressed.

---

## Architecture: MVP vs Production

| Component | This MVP | Production at Uber |
|---|---|---|
| Voice capture | Web Speech API (browser) | React Native native module (iOS Speech / Android SpeechRecognizer) |
| Order parsing | Mock engine / GPT-4o (optional) | Michelangelo-hosted model via Gen AI Gateway |
| Preference memory | localStorage | Palette Feature Store (Cassandra) + PostgreSQL for explicit prefs |
| Menu matching | Fuzzy string match against JSON | Elasticsearch + Food Knowledge Graph + query2vec embeddings |
| UI framework | Next.js + Tailwind (web) | React Native (mobile) with Redux + Redux Sagas |
| Inter-service comms | Next.js API routes (REST) | gRPC + Protobuf |

---

## Step-by-Step Port Guide for Uber Engineers

### Step 1: Voice Capture — Replace Web Speech API with Native Module

**Our MVP:** `lib/voice.ts` wraps the browser's Web Speech API with two functions:
- `startListening()` — captures speech, returns interim + final transcripts
- `startWakeWordListener()` — runs continuously, triggers on "Hey Uber Eats"

**At Uber:** Build a React Native native module using:
- **iOS:** `Speech` framework (`SFSpeechRecognizer`) — on-device, low latency
- **Android:** `SpeechRecognizer` API — Google's on-device or cloud STT

**Key insight:** Uber already has audio recording infrastructure in-app for safety features (ride recording). The native audio pipeline exists — this just adds a speech-to-text layer on top.

**Interface stays the same:** `startListening()` → returns transcribed text. The rest of the pipeline doesn't care whether it came from Web Speech API or a native module.

### Step 2: Order Parsing — Replace Mock/GPT-4o with Michelangelo

**Our MVP:** `api/parse-order/route.ts` uses a mock NLP engine that detects keywords, cuisines, restaurant names, and preferences from the transcript. Optionally, GPT-4o can be enabled for more natural parsing.

**At Uber:**
- Fine-tune a model on Michelangelo using real order transcripts and structured order data
- Deploy via the Gen AI Gateway (already built — handles PII redaction, cost attribution, safety guardrails)
- Use the Food Knowledge Graph + query2vec for menu item disambiguation instead of fuzzy matching
- The gateway already supports multiple model backends (OpenAI GPT-4o, internally-hosted Llama, etc.)

**Key insight:** Uber's Gen AI Gateway already exists and is in production. This feature would be a new API consumer of existing infrastructure, not a new system.

### Step 3: Preference Memory — Replace localStorage with Palette Feature Store

**Our MVP:** `lib/preferences.ts` reads/writes user preferences to localStorage with this structure:
- `preferences[]` — explicit removals/additions (e.g., "no pickles")
- `usualSpots[]` — frequent restaurants by cuisine
- `orderHistory[]` — recent orders

**At Uber:**
- **Explicit preferences** (no pickles) → PostgreSQL with `modifier_id` foreign keys linking to the Menu Catalog Service
- **Behavioral preferences** (usual spots, cuisine affinities) → Already exist in Palette/Cassandra. Uber updates these daily using Bayesian logic, upweighted for recency.
- **Session context** (what was said earlier in this voice session) → Redis with 30-minute TTL

**Key insight:** The behavioral preference layer already exists at Uber. They just need to add a structured explicit preference table for voice-declared constraints like "no pickles."

### Step 4: Menu Matching — Replace Fuzzy JSON with Elasticsearch

**Our MVP:** `lib/menuMatcher.ts` does word-overlap fuzzy matching against static JSON menu data.

**At Uber:**
- Query the existing Elasticsearch index used for text search
- Leverage the Food Knowledge Graph for semantic matching ("cheeseburger" → "Classic Double Patty Smashburger with American Cheese")
- Use query2vec embeddings where queries that lead to similar orders are close in vector space

**Key insight:** Text search and voice search produce the same type of input — a string of words describing food. Voice is just a new input modality for an existing search pipeline.

### Step 5: UI Integration — Port to React Native

**Our MVP:** Next.js components — SearchBar with mic icon, VoiceOverlay with loading/response states, checkout confirmation.

**At Uber:**
- Port these patterns into React Native components
- Use Redux Sagas to manage the async flow: voice capture → parsing → menu matching → checkout
- The VoiceOverlay modal pattern maps directly to React Native's `Modal` component
- Search bar mic icon integrates into the existing Uber Eats search header

---

## Why Uber Hasn't Built This Yet

### 1. "Voice ordering is low priority — users order from home, not hands-free"

**Reality:** True for 2020-2023. But in February 2026, Uber launched an AI Cart Assistant that builds grocery carts from text prompts and photos. Voice is the natural next step — same backend, new input modality.

**Solution:** Position this as an extension of the AI Cart Assistant, not a standalone feature.

### 2. "Menu disambiguation across thousands of restaurants is too hard"

**Reality:** Valid — "cheeseburger" maps to different items at every restaurant.

**Solution:** Uber already solved this with their Food Knowledge Graph and query2vec embeddings. The system doesn't need to be perfect — it proposes a match, and the user confirms at checkout. Our demo proves this pattern works.

### 3. "Allergy/dietary safety liability with misheard orders"

**Reality:** This is the biggest real blocker. A misheard "no nuts" could be life-threatening.

**Solution:** Never silently apply allergy modifications. The checkout confirmation screen is mandatory — the user always sees and confirms the final order. For known allergies, hard-block items containing the allergen with a visible warning, separate from taste preferences.

### 4. "Google Assistant already handles voice ordering"

**Reality:** The Google Assistant integration exists but is limited and rarely used. It leaves the Uber Eats app, goes through Google's flow, and loses the UX context.

**Solution:** In-app voice is fundamentally different. It's contextual (knows what screen you're on), has access to full order history and preferences, and stays in the Uber Eats experience.

### 5. "Building a voice stack is expensive"

**Reality:** It was in 2020. In 2026, STT costs are $0.004-0.006/minute (Whisper/Deepgram), and LLM parsing costs are under $0.01/call. Total cost per voice order: under $0.02.

**Solution:** Route through the existing Gen AI Gateway. No new infrastructure — just a new API consumer.

### 6. "Multi-turn voice conversations are complex to manage"

**Reality:** Full conversational ordering with back-and-forth dialogue is genuinely complex.

**Solution:** Don't build multi-turn. Use single-turn voice + visual confirmation. The user speaks once, the AI proposes an order, and the user confirms visually. This avoids dialogue state management entirely.

---

## Proposed Production Timeline

1. **Week 1-2:** Native voice capture module (iOS + Android)
2. **Week 3-4:** Integrate with Gen AI Gateway for order parsing
3. **Week 5-6:** Add explicit preference storage to Palette
4. **Week 7-8:** Connect to existing Elasticsearch menu search
5. **Week 9-10:** UI integration, QA, A/B test rollout

---

## Optional: GPT-4o Integration

For engineers who want to test with real AI responses instead of the mock engine:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add it to `.env.local`: `OPENAI_API_KEY=sk-your-key-here`
3. Restart the dev server — the API route will automatically switch to GPT-4o
4. The system prompt includes user memory context, so responses are personalized
