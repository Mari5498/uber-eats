"use client";

import { useEffect, useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import VoiceOverlay from "@/components/VoiceOverlay";
import RestaurantCard from "@/components/RestaurantCard";
import { Restaurant, ParsedOrder, CartItem } from "@/types";
import { seedDefaultMemory, getMemory, addPreference, getApplicableRemovals, addOrderToHistory } from "@/lib/preferences";
import { startListening, startWakeWordListener, isVoiceSupported } from "@/lib/voice";
import { parseVoiceOrder } from "@/lib/ai";
import { findRestaurant, findMenuItem, applyPreferenceRemovals } from "@/lib/menuMatcher";
import restaurantsData from "@/data/restaurants.json";

const restaurants = restaurantsData as Restaurant[];

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{
    restaurant: Restaurant;
    items: CartItem[];
  } | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    seedDefaultMemory();
  }, []);

  // Wake word listener
  useEffect(() => {
    if (!isVoiceSupported()) return;
    if (isListening || isProcessing) return;

    const stop = startWakeWordListener(() => {
      handleMicClick();
    });
    return stop;
  }, [isListening, isProcessing]);

  const handleMicClick = useCallback(() => {
    if (isListening) return;
    setIsListening(true);
    setTranscript("");

    const stop = startListening((text, isFinal) => {
      setTranscript(text);
      if (isFinal) {
        stop();
        setIsListening(false);
        processOrder(text);
      }
    });
  }, [isListening]);

  async function processOrder(text: string) {
    setIsProcessing(true);
    setAiResponse(null);

    try {
      const memory = getMemory();
      const restaurantNames = restaurants.map((r) => r.name);
      const parsed: ParsedOrder = await parseVoiceOrder(
        text,
        memory,
        restaurantNames
      );

      // Save any new preferences
      for (const pref of parsed.newPreferences) {
        addPreference(pref);
      }

      // Find restaurant
      const restaurant = findRestaurant(
        restaurants,
        parsed.restaurantName,
        parsed.excludeRestaurant,
        parsed.cuisineType
      );

      if (!restaurant) {
        setIsProcessing(false);
        setAiResponse("Hmm, couldn't find a restaurant matching that. Try again?");
        return;
      }

      // Match menu items and apply preferences
      const removals = getApplicableRemovals();
      const cartItems: CartItem[] = [];

      if (parsed.items.length === 0) {
        // Default to first item if no specific item mentioned
        const item = restaurant.menu[0];
        const { kept, removed } = applyPreferenceRemovals(item.modifiers, [
          ...removals,
          ...parsed.items.flatMap((i) => i.modifiersToRemove),
        ]);
        cartItems.push({
          menuItem: item,
          quantity: 1,
          removedModifiers: removed,
          addedModifiers: [],
        });
      } else {
        for (const orderItem of parsed.items) {
          const menuItem = findMenuItem(restaurant.menu, orderItem.name);
          if (menuItem) {
            const { removed } = applyPreferenceRemovals(menuItem.modifiers, [
              ...removals,
              ...orderItem.modifiersToRemove,
            ]);
            cartItems.push({
              menuItem,
              quantity: orderItem.quantity,
              removedModifiers: removed,
              addedModifiers: orderItem.modifiersToAdd,
            });
          }
        }
      }

      setOrderResult({ restaurant, items: cartItems });
      setIsProcessing(false);
      setAiResponse(parsed.aiResponse);
    } catch (err) {
      console.error("Order processing failed:", err);
      setIsProcessing(false);
      setAiResponse("Something went wrong. Give it another shot?");
    }
  }

  function handleConfirm() {
    if (orderResult) {
      addOrderToHistory({
        restaurantId: orderResult.restaurant.id,
        restaurantName: orderResult.restaurant.name,
        items: orderResult.items.map((i) => i.menuItem.name),
        date: new Date().toISOString().split("T")[0],
      });
    }
    setAiResponse(null);
    setOrderResult(null);
    setTranscript("");
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3000);
  }

  function handleCancel() {
    setAiResponse(null);
    setOrderResult(null);
    setTranscript("");
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white z-40 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[13px] text-[#545454]">Deliver now</p>
            <div className="flex items-center gap-1">
              <h1 className="text-[15px] font-medium">Current location</h1>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        <SearchBar
          transcript={transcript}
          isListening={isListening}
          onMicClick={handleMicClick}
        />
      </header>

      {/* Categories */}
      <div className="flex gap-3 px-4 py-4 overflow-x-auto">
        {["Shawarma", "Burgers", "Thai", "Pizza", "Sushi", "Healthy"].map(
          (cat) => (
            <div
              key={cat}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="w-14 h-14 bg-[#F6F6F6] rounded-full flex items-center justify-center text-xl">
                {cat === "Shawarma" && "🌯"}
                {cat === "Burgers" && "🍔"}
                {cat === "Thai" && "🍜"}
                {cat === "Pizza" && "🍕"}
                {cat === "Sushi" && "🍣"}
                {cat === "Healthy" && "🥗"}
              </div>
              <span className="text-[12px] text-[#545454]">{cat}</span>
            </div>
          )
        )}
      </div>

      {/* Restaurant List */}
      <div className="px-4 pb-8">
        <h2 className="text-[18px] font-bold mb-4">Nearby Restaurants</h2>
        <div className="flex flex-col gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </div>

      {/* Voice Overlay */}
      <VoiceOverlay
        isProcessing={isProcessing}
        aiResponse={aiResponse}
        hasValidOrder={orderResult !== null}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Order Confirmation Toast */}
      {orderPlaced && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#06C167] text-white px-6 py-3 rounded-full text-[15px] font-medium shadow-lg animate-fade-in-up z-50">
          Order placed! 🎉
        </div>
      )}

      {/* Checkout Preview (shown with AI response) */}
      {aiResponse && orderResult && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[480px] w-full bg-white border-t border-gray-200 p-4 z-40 animate-fade-in-up">
          <h3 className="text-[15px] font-bold mb-2">
            Order from {orderResult.restaurant.name}
          </h3>
          {orderResult.items.map((item, i) => (
            <div key={i} className="flex justify-between py-1.5 text-[14px]">
              <div>
                <span>
                  {item.quantity}x {item.menuItem.name}
                </span>
                {item.removedModifiers.length > 0 && (
                  <span className="text-[12px] text-[#06C167] block">
                    No {item.removedModifiers.join(", ")} (your preference)
                  </span>
                )}
              </div>
              <span className="text-[#545454]">
                ${(item.menuItem.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-2 border-t border-gray-100 font-medium text-[15px]">
            <span>Total</span>
            <span>
              $
              {orderResult.items
                .reduce(
                  (sum, item) => sum + item.menuItem.price * item.quantity,
                  0
                )
                .toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
