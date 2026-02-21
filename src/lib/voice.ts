type VoiceCallback = (transcript: string, isFinal: boolean) => void;
type WakeWordCallback = () => void;

let recognition: SpeechRecognition | null = null;
let wakeWordRecognition: SpeechRecognition | null = null;

function createRecognition(): SpeechRecognition | null {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  return new SpeechRecognition();
}

export function isVoiceSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startListening(onResult: VoiceCallback): () => void {
  recognition = createRecognition();
  if (!recognition) {
    console.error("Speech recognition not supported");
    return () => {};
  }

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let transcript = "";
    let isFinal = false;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    onResult(transcript, isFinal);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.start();

  return () => {
    recognition?.stop();
    recognition = null;
  };
}

export function startWakeWordListener(onWakeWord: WakeWordCallback): () => void {
  wakeWordRecognition = createRecognition();
  if (!wakeWordRecognition) return () => {};

  wakeWordRecognition.continuous = true;
  wakeWordRecognition.interimResults = true;
  wakeWordRecognition.lang = "en-US";

  let triggered = false;

  wakeWordRecognition.onresult = (event: SpeechRecognitionEvent) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript.toLowerCase().trim();
      if (text.includes("hey uber eats") || text.includes("hey uber eat") || text.includes("hey uber")) {
        triggered = true;
        wakeWordRecognition?.stop();
        onWakeWord();
        return;
      }
    }
  };

  wakeWordRecognition.onend = () => {
    // Only restart if it stopped unexpectedly (browser timeout), not after trigger
    if (wakeWordRecognition && !triggered) {
      try {
        wakeWordRecognition.start();
      } catch {
        // Already started, ignore
      }
    }
  };

  wakeWordRecognition.onerror = (event) => {
    if (event.error === "no-speech" || event.error === "aborted") return;
    console.error("Wake word error:", event.error);
  };

  wakeWordRecognition.start();

  return () => {
    const ref = wakeWordRecognition;
    wakeWordRecognition = null;
    ref?.stop();
  };
}
