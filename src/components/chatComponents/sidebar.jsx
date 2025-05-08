import {
  HiOutlineChatBubbleBottomCenterText,
  HiUserGroup,
  HiMiniUsers,
  HiMiniHome
} from "react-icons/hi2";
import { useState } from "react";

export default function Sidebar({ elementColors, onTabChange, userElement }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // Default to all chats

  const sidebarItems = [
    { icon: HiMiniHome, label: "All", type: "all" },
    { icon: HiOutlineChatBubbleBottomCenterText, label: "Private", type: "direct" },
    { icon: HiMiniUsers, label: "Groups", type: "groups" },
    { icon: HiUserGroup, label: `${userElement} Community`, type: "community" }
  ];

  const handleTabClick = (tabType) => {
    setActiveTab(tabType);
    onTabChange(tabType);
  };

  return (
    <div
      className="mt-16 w-12 hover:w-48 transition-all duration-300 border-l border-gray-200 flex flex-col items-start py-4 gap-2 overflow-hidden"
      style={{ backgroundColor: elementColors.light }}
    >
      {sidebarItems.map((item, idx) => {
        const isHovered = hoveredIndex === idx;
        const isActive = activeTab === item.type;
        
        return (
          <div
            key={idx}
            className="flex items-center gap-3 w-full px-3 py-2 cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleTabClick(item.type)}
            style={{
              backgroundColor: isActive 
                ? elementColors.primary 
                : isHovered 
                  ? elementColors.hover 
                  : elementColors.light,
              color: isActive || isHovered ? "white" : "black"
            }}
          >
            <item.icon
              className="text-2xl min-w-[24px]"
              style={{
                color: isActive || isHovered ? "white" : "black"
              }}
            />
            <span
              className="text-sm whitespace-nowrap transition-opacity duration-300"
              style={{
                color: isActive || isHovered ? "white" : "black"
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