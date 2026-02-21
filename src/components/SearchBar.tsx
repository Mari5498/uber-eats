"use client";

interface SearchBarProps {
  transcript: string;
  isListening: boolean;
  onMicClick: () => void;
}

export default function SearchBar({
  transcript,
  isListening,
  onMicClick,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="flex items-center bg-[#F6F6F6] rounded-full px-4 py-3 gap-3">
        <svg
          className="w-5 h-5 text-[#545454] shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <div className="flex-1 text-[15px] min-h-[20px]">
          {isListening && transcript ? (
            <span className="text-black">{transcript}</span>
          ) : isListening ? (
            <span className="text-[#545454] animate-pulse">Listening...</span>
          ) : (
            <span className="text-[#545454]">
              Food, groceries, drinks, etc
            </span>
          )}
        </div>

        <button
          onClick={onMicClick}
          className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
            isListening
              ? "bg-[#06C167] text-white mic-active"
              : "bg-transparent text-[#545454] hover:bg-gray-200"
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
