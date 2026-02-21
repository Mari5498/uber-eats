import { MenuItem as MenuItemType } from "@/types";

interface MenuItemProps {
  item: MenuItemType;
  removedModifiers?: string[];
}

export default function MenuItemCard({ item, removedModifiers = [] }: MenuItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      <div className="flex-1">
        <h4 className="text-[15px] font-medium text-black">{item.name}</h4>
        <p className="text-[13px] text-[#545454] mt-1 line-clamp-2">
          {item.description}
        </p>
        <p className="text-[15px] mt-2">${item.price.toFixed(2)}</p>
        {removedModifiers.length > 0 && (
          <p className="text-[12px] text-[#06C167] mt-1">
            ✓ Removed: {removedModifiers.join(", ")} (your preference)
          </p>
        )}
      </div>
      <div className="w-[120px] h-[100px] rounded-xl overflow-hidden bg-[#F6F6F6] shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
