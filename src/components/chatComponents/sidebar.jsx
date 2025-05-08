import {
  HiOutlineChatBubbleBottomCenterText,
  HiUserGroup,
  HiOutlineArchiveBox,
  HiOutlineCog6Tooth,
  HiOutlineHeart
} from "react-icons/hi2";
import { useState } from "react";

const sidebarItems = [
  { icon: HiOutlineChatBubbleBottomCenterText, label: "לא נקרא" },
  { icon: HiUserGroup, label: "קבוצות" },
  { icon: HiOutlineArchiveBox, label: "ארכיון" },
  { icon: HiOutlineCog6Tooth, label: "הגדרות" },
  { icon: HiOutlineHeart, label: "fav" }
];

export default function Sidebar({ elementColors }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className="mt-16 w-12 hover:w-48 transition-all duration-300 border-l border-gray-200 flex flex-col items-start py-4 gap-2 overflow-hidden"
      style={{ backgroundColor: elementColors.light }}
    >
      {sidebarItems.map((item, idx) => {
        const isHovered = hoveredIndex === idx;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 w-full px-3 py-2 cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              backgroundColor: isHovered ? elementColors.darkHover : elementColors.light,
              color: isHovered ? "white" : "black"
            }}
          >
            <item.icon
              className="text-2xl min-w-[24px]"
              style={{
                color: isHovered ? "white" : "black"
              }}
            />
            <span
              className="text-sm whitespace-nowrap transition-opacity duration-300"
              style={{
                color: isHovered ? "white" : "black"
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
