"use client";

import { useEffect } from "react";
import { speak, stopSpeaking } from "@/lib/speak";

interface VoiceOverlayProps {
  isProcessing: boolean;
  aiResponse: string | null;
  hasValidOrder: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function VoiceOverlay({
  isProcessing,
  aiResponse,
  hasValidOrder,
  onConfirm,
  onCancel,
}: VoiceOverlayProps) {
  // Speak the AI response out loud when it appears
  useEffect(() => {
    if (aiResponse) {
      speak(aiResponse);
    }
    return () => stopSpeaking();
  }, [aiResponse]);

  if (!isProcessing && !aiResponse) return null;

  function handleCancel() {
    stopSpeaking();
    onCancel();
  }

  function handleConfirm() {
    stopSpeaking();
    onConfirm();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in-up">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 border-4 border-[#F6F6F6] border-t-[#06C167] rounded-full animate-spin-slow" />
            <p className="text-[#545454] text-[15px]">
              Preparing your order...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#06C167] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </div>
              <p className="text-[15px] text-black leading-relaxed">
                {aiResponse}
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleCancel}
                className={`py-3 px-4 rounded-full text-[15px] font-medium transition-colors ${
                  hasValidOrder
                    ? "flex-1 border border-gray-200 hover:bg-gray-50"
                    : "w-full bg-black text-white hover:bg-gray-800"
                }`}
              >
                {hasValidOrder ? "Cancel" : "Try Again"}
              </button>
              {hasValidOrder && (
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 rounded-full bg-black text-white text-[15px] font-medium hover:bg-gray-800 transition-colors"
                >
                  Confirm Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
