import { NextRequest, NextResponse } from "next/server";
import { UserMemory, ParsedOrder } from "@/types";

interface RequestBody {
  transcript: string;
  memory: UserMemory;
  restaurantNames: string[];
}

export async function POST(req: NextRequest) {
  const { transcript, memory, restaurantNames }: RequestBody = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  // If OpenAI key is configured and not the placeholder, use GPT-4o
  if (apiKey && apiKey !== "your-api-key-here") {
    return handleWithOpenAI(transcript, memory, restaurantNames, apiKey);
  }

  // Otherwise, use the mock engine
  return NextResponse.json(mockParseOrder(transcript, memory, restaurantNames));
}

// ---------------------------------------------------------------------------
// Mock engine — makes the demo work without any API key
// ---------------------------------------------------------------------------

function mockParseOrder(
  transcript: string,
  memory: UserMemory,
  restaurantNames: string[]
): ParsedOrder {
  const lower = transcript.toLowerCase();
  const preferenceRemovals = memory.preferences
    .filter((p) => p.type === "remove")
    .map((p) => p.ingredient);

  // --- Detect exclusions ---
  let excludeRestaurant: string | null = null;
  // Match patterns: "not from shelby's", "but not shelby", "skip shelby's", "no shelby"
  const excludePatterns = [
    /not from ([\w\s']+?)(?:\.|,|$| and| but)/,
    /(?:skip|avoid|no|not|don't want|without) ([\w\s']+?)(?:\.|,|$| and| but| today)/,
  ];
  for (const pattern of excludePatterns) {
    const match = lower.match(pattern);
    if (match) {
      const candidate = match[1].trim();
      // Check if it matches a known restaurant name (fuzzy)
      for (const name of restaurantNames) {
        if (
          name.toLowerCase().includes(candidate) ||
          candidate.includes(name.toLowerCase().split(" ")[0].replace("'s", ""))
        ) {
          excludeRestaurant = name;
          break;
        }
      }
      // Even if not an exact match, store the raw text
      if (!excludeRestaurant && candidate.length > 2) {
        excludeRestaurant = candidate;
      }
      if (excludeRestaurant) break;
    }
  }

  // --- Detect cuisine type ---
  let cuisineType: string | null = null;
  const cuisineMap: Record<string, string> = {
    shawarma: "shawarma", shwarma: "shawarma", "shao warma": "shawarma",
    burger: "burger", burgers: "burger", hamburger: "burger",
    thai: "thai", "pad thai": "thai", noodle: "thai", noodles: "thai",
    lebanese: "lebanese", mediterranean: "lebanese",
    chicken: "chicken", "fried chicken": "chicken",
    pizza: "pizza",
    mexican: "mexican", taco: "mexican", burrito: "mexican",
    wrap: "shawarma", wraps: "shawarma",
    falafel: "shawarma", kebab: "shawarma",
    grill: "lebanese", grilled: "lebanese",
  };
  for (const [keyword, cuisine] of Object.entries(cuisineMap)) {
    if (lower.includes(keyword)) {
      cuisineType = cuisine;
      break;
    }
  }

  // --- Detect recommendation request ---
  const requestRecommendation =
    lower.includes("recommend") ||
    lower.includes("suggest") ||
    lower.includes("new spot") ||
    lower.includes("new place") ||
    lower.includes("somewhere else") ||
    lower.includes("somewhere new") ||
    lower.includes("find me") ||
    lower.includes("find a") ||
    lower.includes("try something") ||
    lower.includes("different") ||
    excludeRestaurant !== null; // excluding a restaurant implies wanting an alternative

  // --- Detect specific restaurant name ---
  let restaurantName: string | null = null;
  for (const name of restaurantNames) {
    const nameLower = name.toLowerCase();
    const firstName = nameLower.split(/[\s']/)[0];
    if (lower.includes(nameLower) || lower.includes(firstName)) {
      // Don't match if this is the excluded restaurant
      if (excludeRestaurant && name === excludeRestaurant) continue;
      restaurantName = name;
      break;
    }
  }

  // --- Detect "the usual" / "my regular" / "same as last time" ---
  const wantsUsual =
    lower.includes("usual") ||
    lower.includes("regular") ||
    lower.includes("same as") ||
    lower.includes("same thing") ||
    lower.includes("last time") ||
    lower.includes("again");

  // If they want the usual, pull from memory
  if (wantsUsual && !restaurantName && memory.usualSpots.length > 0) {
    const spot = memory.usualSpots[0];
    restaurantName = spot.restaurantName;
    if (!cuisineType) cuisineType = spot.cuisine;
  }

  // --- FALLBACK: If nothing specific detected, use memory context ---
  if (!restaurantName && !cuisineType && !requestRecommendation) {
    // Check if ANY food-related word is in the transcript
    const foodWords = ["order", "food", "eat", "hungry", "get me", "want", "grab", "deliver"];
    const isFoodRelated = foodWords.some((w) => lower.includes(w));

    if (isFoodRelated && memory.usualSpots.length > 0) {
      // Default to their usual cuisine
      cuisineType = memory.usualSpots[0].cuisine;
    } else if (isFoodRelated) {
      // No memory — just pick the top restaurant
      cuisineType = "shawarma";
    }
  }

  // --- Detect specific items ---
  const items: ParsedOrder["items"] = [];
  const itemKeywords = [
    "chicken shawarma", "beef shawarma", "lamb shawarma", "shawarma",
    "wrap", "plate", "falafel", "hummus",
    "cheeseburger", "smashburger", "burger", "chicken sandwich",
    "pad thai", "green curry", "curry",
    "fries", "salad", "fattoush",
    "kebab", "mixed grill", "grill",
    "mango sticky rice",
  ];
  for (const kw of itemKeywords) {
    if (lower.includes(kw)) {
      items.push({
        name: kw,
        quantity: 1,
        modifiersToRemove: [...preferenceRemovals],
        modifiersToAdd: [],
      });
      break;
    }
  }

  // If no specific item but we have context, default to a sensible item
  if (items.length === 0) {
    const defaultItem = cuisineType === "burger" ? "burger"
      : cuisineType === "thai" ? "pad thai"
      : "shawarma";
    items.push({
      name: defaultItem,
      quantity: 1,
      modifiersToRemove: [...preferenceRemovals],
      modifiersToAdd: [],
    });
  }

  // --- Detect new preferences ---
  const newPreferences: ParsedOrder["newPreferences"] = [];
  const prefPatterns = [
    /(?:i hate|no more|never|don't want|hold the|can't stand|allergic to|remove the) (\w+)/,
    /no (\w+) (?:ever|again|please|on anything)/,
  ];
  for (const pattern of prefPatterns) {
    const match = lower.match(pattern);
    if (match && !preferenceRemovals.includes(match[1])) {
      newPreferences.push({
        type: "remove",
        ingredient: match[1],
        scope: "global",
      });
      break;
    }
  }

  // --- Build response ---
  const aiResponse = buildMockResponse({
    excludeRestaurant,
    cuisineType,
    requestRecommendation,
    restaurantName,
    preferenceRemovals,
    memory,
    wantsUsual,
  });

  return {
    restaurantName,
    excludeRestaurant,
    requestRecommendation,
    cuisineType,
    items,
    newPreferences,
    aiResponse,
  };
}

function buildMockResponse(ctx: {
  excludeRestaurant: string | null;
  cuisineType: string | null;
  requestRecommendation: boolean;
  restaurantName: string | null;
  preferenceRemovals: string[];
  memory: UserMemory;
  wantsUsual: boolean;
}): string {
  const pickleNote =
    ctx.preferenceRemovals.length > 0
      ? ` No ${ctx.preferenceRemovals.join(", ")}, obviously.`
      : "";

  if (ctx.wantsUsual && ctx.memory.usualSpots.length > 0) {
    const spot = ctx.memory.usualSpots[0];
    return `The usual from ${spot.restaurantName}? You got it.${pickleNote}`;
  }

  if (ctx.excludeRestaurant && ctx.requestRecommendation) {
    return `Okay, ditching ${ctx.excludeRestaurant} today — bold move. Found 'Beirut Grill,' 4.8 stars, people are obsessed. Want me to place the order?${pickleNote}`;
  }

  if (ctx.excludeRestaurant) {
    return `No ${ctx.excludeRestaurant}? Fine, I found you something better — Beirut Grill, 4.8 stars.${pickleNote}`;
  }

  if (ctx.requestRecommendation) {
    return `I found a spot you'll love — Beirut Grill, 4.8 stars and the reviews are fire. Ready to order?${pickleNote}`;
  }

  if (ctx.restaurantName) {
    return `${ctx.restaurantName}, great choice. I've got your order ready.${pickleNote}`;
  }

  if (ctx.cuisineType) {
    return `Got it, ${ctx.cuisineType} it is. I picked the best-rated spot for you.${pickleNote}`;
  }

  return `Alright, I've got something lined up for you.${pickleNote} Want me to place the order?`;
}

// ---------------------------------------------------------------------------
// OpenAI GPT-4o engine — optional, requires OPENAI_API_KEY in .env.local
// ---------------------------------------------------------------------------

async function handleWithOpenAI(
  transcript: string,
  memory: UserMemory,
  restaurantNames: string[],
  apiKey: string
) {
  const systemPrompt = `You are the AI brain behind an Uber Eats voice ordering assistant. You are witty, humorous, and brief — 1-2 sentences max. You know the user personally.

USER MEMORY:
- Preferences: ${JSON.stringify(memory.preferences)}
- Usual spots: ${JSON.stringify(memory.usualSpots)}
- Recent orders: ${JSON.stringify(memory.orderHistory.slice(0, 5))}

AVAILABLE RESTAURANTS: ${restaurantNames.join(", ")}

TASK: Parse the user's voice command and return a JSON object. Always apply their stored preferences (e.g., if they hate pickles, remove pickles automatically and mention it casually).

Respond ONLY with valid JSON matching this schema:
{
  "restaurantName": string | null,
  "excludeRestaurant": string | null,
  "requestRecommendation": boolean,
  "cuisineType": string | null,
  "items": [{ "name": string, "quantity": number, "modifiersToRemove": string[], "modifiersToAdd": string[] }],
  "newPreferences": [{ "type": "remove" | "add", "ingredient": string, "scope": "global" }],
  "aiResponse": string
}

The aiResponse should be humorous and short. Reference their preferences naturally (e.g., "No pickles, obviously."). If they want a recommendation, pick from the available restaurants and be opinionated about it.

If the user says something like "the usual" or "my regular", look at their order history and usual spots.
If they exclude a restaurant, recommend an alternative from the same cuisine.
If they mention a new preference ("I hate X", "no X ever", "always add Y"), include it in newPreferences.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json(
      { error: "OpenAI API error", details: err },
      { status: 502 }
    );
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: content },
      { status: 500 }
    );
  }
}
