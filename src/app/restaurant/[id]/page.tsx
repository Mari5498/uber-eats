"use client";

import { use } from "react";
import Link from "next/link";
import { Restaurant } from "@/types";
import { getApplicableRemovals } from "@/lib/preferences";
import { applyPreferenceRemovals } from "@/lib/menuMatcher";
import MenuItemCard from "@/components/MenuItem";
import restaurantsData from "@/data/restaurants.json";

const restaurants = restaurantsData as Restaurant[];

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const restaurant = restaurants.find((r) => r.id === id);
  const removals = getApplicableRemovals();

  if (!restaurant) {
    return (
      <div className="max-w-[480px] mx-auto p-8 text-center">
        <p className="text-[#545454]">Restaurant not found</p>
        <Link href="/" className="text-[#06C167] mt-2 inline-block">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[200px] bg-[#F6F6F6]">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <Link
          href="/"
          className="absolute top-4 left-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>

      {/* Restaurant Info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <h1 className="text-[22px] font-bold">{restaurant.name}</h1>
        <div className="flex items-center gap-2 mt-1 text-[14px] text-[#545454]">
          <span className="font-medium text-black">{restaurant.rating} ★</span>
          <span>·</span>
          <span>{restaurant.deliveryTime}</span>
          <span>·</span>
          <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
        </div>
        <p className="text-[13px] text-[#545454] mt-1">
          {restaurant.categories.join(" · ")}
        </p>
      </div>

      {/* Menu */}
      <div className="px-4 py-4">
        <h2 className="text-[18px] font-bold mb-2">Menu</h2>
        {restaurant.menu.map((item) => {
          const { removed } = applyPreferenceRemovals(
            item.modifiers,
            removals
          );
          return (
            <MenuItemCard
              key={item.id}
              item={item}
              removedModifiers={removed}
            />
          );
        })}
      </div>
    </div>
  );
}
