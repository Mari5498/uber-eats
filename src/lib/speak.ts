let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

// Pre-load voices as soon as this module is imported
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickBestVoice();
    voicesLoaded = true;
  };
  // Also try immediately (some browsers have voices ready synchronously)
  const immediate = pickBestVoice();
  if (immediate) {
    cachedVoice = immediate;
    voicesLoaded = true;
  }
}

function pickBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Priority list — most natural-sounding English voices across platforms
  // macOS Premium/Enhanced voices are the closest to AI assistant quality
  const priority = [
    // macOS Sequoia+ premium voices (very natural)
    "Zoe (Premium)",
    "Ava (Premium)",
    "Evan (Premium)",
    "Tom (Premium)",
    "Samantha (Premium)",
    "Allison (Premium)",
    "Susan (Premium)",
    // macOS Enhanced voices (good quality)
    "Zoe (Enhanced)",
    "Ava (Enhanced)",
    "Evan (Enhanced)",
    "Tom (Enhanced)",
    "Samantha (Enhanced)",
    "Allison (Enhanced)",
    // Google voices (Chrome — decent quality)
    "Google US English",
    "Google UK English Female",
    // macOS standard (still okay)
    "Samantha",
    "Ava",
    "Tom",
  ];

  for (const name of priority) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }

  // Fallback: any Premium or Enhanced English voice
  const premium = voices.find(
    (v) => (v.name.includes("(Premium)") || v.name.includes("(Enhanced)")) && v.lang.startsWith("en")
  );
  if (premium) return premium;

  // Last resort: any English voice
  return voices.find((v) => v.lang.startsWith("en")) || null;
}

export function speak(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  utterance.volume = 1;

  // Use cached voice, or try to pick one now
  const voice = cachedVoice || pickBestVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}
