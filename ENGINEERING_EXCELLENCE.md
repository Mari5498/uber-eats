# Engineering Excellence

## Principles
- **No over-engineering.** This is an MVP. Simple > clever. Three lines of repeated code > a premature abstraction.
- **Uber Eats stack-compliant.** Our code should mirror patterns a real Uber engineer would recognize and could port into the actual codebase.
- **Every file earns its place.** No utils for one-time operations. No wrappers around wrappers.

## Uber Eats Mobile Stack Compliance

Our demo is a web app, but code patterns should align with how Uber Eats actually works so an engineer could realistically adopt this.

| Uber Eats Uses | Our MVP Equivalent | Why It Matters |
|---|---|---|
| React Native + Redux + Redux Sagas | Next.js + React state | Same component model, same state patterns. An engineer ports the logic, not the framework. |
| gRPC + Protobuf (inter-service) | REST API routes in Next.js | MVP doesn't need gRPC. But our API contracts should be clean enough to swap to gRPC later. |
| Elasticsearch (menu search) | Simple fuzzy match against JSON | Same concept — match user intent to menu items. Our matcher is a clean, isolated function. |
| Michelangelo (ML platform) + Palette Feature Store | GPT-4o API call + localStorage | We use GPT-4o as the "brain." An engineer would swap this for their Michelangelo-hosted model. |
| Food Knowledge Graph + query2vec | GPT-4o structured output | Uber already has semantic food understanding. Our GPT prompt mimics what their graph does. |
| Cassandra (user features) + Redis (cache) | localStorage | Same shape of data (preferences, history). An engineer would move this to Palette/Cassandra. |

## Code Quality Rules
1. **Components:** Small, single-responsibility. No component over 150 lines.
2. **Types:** TypeScript strict mode. All API responses and preference objects are typed.
3. **No dead code.** If it's not used, it doesn't exist.
4. **API layer isolation.** All GPT-4o calls go through `lib/ai.ts`. All preference reads/writes go through `lib/preferences.ts`. Swappable.
5. **No env secrets in code.** OpenAI key via `.env.local`, gitignored.
6. **Naming:** Match Uber's patterns — descriptive, domain-specific (e.g., `menuMatcher`, not `fuzzySearch`).

---

# Implementation Path for Uber Engineers

## How an Uber Engineer Would Use This Repo

This repo is a **working proof-of-concept**. Here's how an Uber engineer ports it into the real Uber Eats stack:

### Step 1: Voice Capture → Replace Web Speech API with native module
- Our `lib/voice.ts` wraps Web Speech API for the browser demo
- At Uber: Build a React Native native module using iOS Speech framework / Android SpeechRecognizer
- The interface stays the same: `startListening()` → returns transcribed text
- Uber already has audio recording capability in-app (safety features) — the infra exists

### Step 2: Order Parsing → Replace GPT-4o with Michelangelo-hosted model
- Our `lib/ai.ts` sends transcribed text to GPT-4o and gets structured order data back
- At Uber: Fine-tune a model on Michelangelo using real order data, deploy via their Gen AI Gateway
- Uber already has a Gen AI Gateway with PII redaction, cost attribution, and safety guardrails
- The food knowledge graph + query2vec would handle menu item disambiguation instead of GPT

### Step 3: Preference Memory → Replace localStorage with Palette Feature Store
- Our `lib/preferences.ts` reads/writes to localStorage
- At Uber: Explicit preferences (no pickles) → PostgreSQL with modifier_id linkage
- Behavioral preferences (usual spots) → already exist in Palette/Cassandra (cuisine preference features, updated daily with Bayesian logic)
- Session context → Redis (TTL 30 min)

### Step 4: Menu Matching → Replace fuzzy JSON match with Elasticsearch
- Our `lib/menuMatcher.ts` does simple fuzzy matching against static JSON
- At Uber: Query their existing Elasticsearch index with the food knowledge graph for semantic matching
- They already do this for text search — voice is just a new input modality

### Step 5: UI Integration → Port components into React Native
- Our Next.js components become React Native components
- The SearchBar, VoiceOverlay, and checkout confirmation patterns transfer directly
- Redux Sagas would manage the async voice → parse → match → confirm flow

## Why Uber Hasn't Built This Yet (And How to Solve Each Blocker)

### 1. "Voice ordering is low priority — users order from home, not hands-free"
**Reality:** True for 2020-2023. But the Feb 2026 AI Cart Assistant launch shows Uber is now investing in AI-assisted ordering. Voice is the natural next step after text prompts and photo scanning.
**Solution:** Position this as an extension of the AI Cart Assistant, not a standalone feature. Same backend, new input modality.

### 2. "Menu disambiguation across thousands of restaurants is too hard"
**Reality:** Valid concern — "cheeseburger" maps to different items at every restaurant.
**Solution:** Uber already solved this with their food knowledge graph and query2vec embeddings. The system doesn't need to be perfect — it needs to be good enough to propose a match, then let the user confirm. Our demo shows this pattern: AI proposes → user confirms at checkout.

### 3. "Allergy/dietary safety liability with misheard orders"
**Reality:** This is the biggest real blocker. A misheard "no nuts" could be life-threatening.
**Solution:** Never silently apply allergy-related modifications. The checkout confirmation screen is mandatory — the user always sees and confirms the final order. For known allergies, add a hard-block that flags items containing allergens with a warning, separate from taste preferences.

### 4. "Google Assistant already handles voice ordering"
**Reality:** Google Assistant integration exists but is limited and rarely used. It requires leaving the Uber Eats app, going through Google's flow, and losing the Uber Eats UX.
**Solution:** In-app voice is fundamentally different from third-party assistant integration. It's contextual (knows what screen you're on), has access to full order history and preferences, and stays in the Uber Eats experience.

### 5. "Building a voice stack is expensive"
**Reality:** It was in 2020. In 2026, with Whisper/Deepgram at $0.004-0.006/minute and GPT-4o for parsing, the cost per voice order is under $0.02.
**Solution:** Use the existing Gen AI Gateway (already deployed at Uber) to route voice transcription and parsing. No new infrastructure — just a new API consumer of existing services.

### 6. "Multi-turn voice conversations are complex to manage"
**Reality:** True — a full conversational ordering flow with back-and-forth is hard.
**Solution:** Don't build multi-turn. Our demo uses **single-turn voice + visual confirmation**. User speaks once → AI proposes → user confirms visually. This avoids dialogue state management entirely while still delivering the magic moment.
