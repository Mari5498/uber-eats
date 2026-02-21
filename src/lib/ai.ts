import { UserMemory, ParsedOrder } from "@/types";

/**
 * Parses a voice transcript into a structured order.
 * Uses a mock engine by default so the demo works without any API key.
 * Set OPENAI_API_KEY in .env.local to use GPT-4o instead.
 */
export async function parseVoiceOrder(
  transcript: string,
  memory: UserMemory,
  restaurantNames: string[]
): Promise<ParsedOrder> {
  const res = await fetch("/api/parse-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, memory, restaurantNames }),
  });

  if (!res.ok) {
    throw new Error("Failed to parse order");
  }

  return res.json();
}
