import { Restaurant } from "@/types";
import Link from "next/link";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-[#F6F6F6]">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-3 left-3 bg-white rounded-full px-2.5 py-1 text-xs font-medium shadow-sm">
          {restaurant.deliveryTime}
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-medium text-black">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 bg-[#F6F6F6] rounded-full px-2 py-0.5">
            <span className="text-xs font-medium">{restaurant.rating}</span>
          </div>
        </div>
        <p className="text-[13px] text-[#545454] mt-0.5">
          ${restaurant.deliveryFee.toFixed(2)} Delivery Fee
        </p>
        <p className="text-[13px] text-[#545454]">
          {restaurant.categories.join(" · ")}
        </p>
      </div>
    </Link>
  );
}
