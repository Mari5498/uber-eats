# Chat Summary — Uber Eats Voice Feature MVP

A transcript summary of the key prompts and decisions that shaped this build.

---

## 1. The Initial Concept

> *"Let's plan on building a voice-to-text feature for Uber Eats with a memory context. For example, if I were to say no pickles on an order, then it should remember that it should automatically remove pickles from anything I order on Uber Eats."*

**Impact:** Defined the core feature — voice input + persistent, invisible preference memory. The "no pickles" example became the north star for the entire memory system design.

---

## 2. Defining the Money Demo

> *"I would essentially say to the voice to text, I want to order a shawarma, but not from Shelby's. Now Shelby's is a shawarma place, that's what I order from usually. Please recommend a new spot to order from and place the order. And it should reply in a humorous tone. It should just be funny, but the response should not be long."*

**Impact:** Locked in the exact demo script that drove everything — a single voice command that demonstrates three things at once: the AI knows your usual spot, can find alternatives, and remembers your preferences. Also established the personality requirement: witty, short responses.

---

## 3. Voice UX Decisions

> *"The voice-to-text button shouldn't be floating, it should only be on the search bar. On top of that, let's make it compliant with when you say 'Hey Uber Eats', it should automatically pop up."*

**Impact:** Moved the mic from a floating button to inside the search bar (matching real product conventions), and introduced the wake word — making the feature feel like a real product instead of a demo hack.

---

## 4. Engineering Excellence Standards

> *"We should avoid over-engineering at all costs, considering this is just an MVP. All the code being checked in should be simple, and beyond that, we also want to make sure that the code coming in is compliant with Uber Eats' tech stack."*

**Impact:** Produced `ENGINEERING_EXCELLENCE.md` — the code quality rulebook for the project. Led to a deliberate stack compliance table mapping every MVP choice to Uber's real infrastructure (Michelangelo, Palette, gRPC, Elasticsearch).

---

## 5. The Uber Engineer Implementation Plan

> *"I want a specific implementation plan for how an engineer at Uber could potentially leverage what we have in this repository to incorporate this feature. I want you to directly address reasons why they're unable to introduce this feature just yet, and you should automatically provide solutions."*

**Impact:** Produced `UBER_ENGINEER_IMPLEMENTATION_PLAN.md` — a 5-step port guide mapping our MVP to Uber's real stack, plus 6 blockers with solutions (allergy liability, menu disambiguation, cost concerns, the Google Assistant question, etc.).

---

## 6. No API Key for the Demo

> *"We don't want to use the OpenAI API key, but you can keep that as a proposed implementation."*

**Impact:** Built a full mock NLP engine in `api/parse-order/route.ts` that handles intent parsing, restaurant exclusion, cuisine detection, preference memory, and witty response generation — zero API keys required. GPT-4o is an optional upgrade.

---

## 7. Text-to-Speech

> *"It would be nice if when it responds, the AI also says out loud what it's about to do."*

**Impact:** Added `lib/speak.ts` — the AI response is now spoken aloud using the Web Speech Synthesis API with voice pre-loading to prioritize the most natural-sounding available voice (macOS Premium/Enhanced voices).

---

## 8. UX Polish — Confirm Button Logic

> *"If the keyword is not being matched properly, that's fine, but you're still showing the confirm order button. You should just say cancel."*

**Impact:** `VoiceOverlay` now checks `hasValidOrder` — if no restaurant was matched, only a "Try Again" button is shown. The "Confirm Order" button only appears when there's actually something to confirm.

---

## 9. Wake Word Fix

> *"When I say 'Hey Uber Eats' it should START the voice to text."*

**Impact:** Fixed a bug in `lib/voice.ts` where the wake word listener was restarting itself after a successful trigger (via the `onend` handler), conflicting with the actual voice capture session. Added a `triggered` flag to prevent the restart after a successful wake word detection.

---

## The Build Workflow

```
Idea → Research (Feature Builder agent on Uber's tech stack)
     → Plan (demo script, architecture, UI decisions)
     → Engineering Excellence doc
     → Implementation Plan for Uber Engineers
     → Build (Next.js scaffold, mock data, lib files, UI components)
     → Iterate (mock engine, TTS, wake word, confirm button logic)
     → Docs (README, IMPLEMENTATION_PLAN, CHAT_SUMMARY)
```

## Final Deliverables

| File | Purpose |
|------|---------|
| `src/` | The working Next.js app |
| `README.md` | Series context, setup guide, stack overview |
| `IMPLEMENTATION_PLAN.md` | What we built and why |
| `ENGINEERING_EXCELLENCE.md` | Code standards + Uber stack compliance |
| `UBER_ENGINEER_IMPLEMENTATION_PLAN.md` | How Uber engineers could adopt this |
| `CHAT_SUMMARY.md` | This file — the story of how it was built |
