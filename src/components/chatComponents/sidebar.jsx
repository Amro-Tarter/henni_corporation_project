import {
    HiOutlineChatBubbleBottomCenterText,
    HiUserGroup,
    HiOutlineArchiveBox,
    HiOutlineCog6Tooth,
    HiOutlineHeart
  } from "react-icons/hi2";
  
  const sidebarItems = [
    { icon: HiOutlineChatBubbleBottomCenterText, label: "לא נקרא" },
    { icon: HiUserGroup, label: "קבוצות" },
    { icon: HiOutlineArchiveBox, label: "ארכיון" },
    { icon: HiOutlineCog6Tooth, label: "הגדרות" },
    { icon: HiOutlineHeart, label: "fav" }//favorite icon in Hebrew
  ];
  
  export default function Sidebar(
    { elementColors } // Added elementColors prop
  ) {
    // Refactored sidebar component with elementColors props
return (
  <div 
    className={`mt-16 w-12 hover:w-48 transition-all duration-300 bg-[${elementColors.light}] border-l border-gray-200 flex flex-col items-start py-4 gap-2 overflow-hidden`}
    style={{ backgroundColor: elementColors.light }}
  >
    {sidebarItems.map((item, idx) => (
      <div
        key={idx}
        className={`group flex items-center gap-3 w-full px-3 py-2 cursor-pointer hover:bg-[${elementColors.light}] text-gray-800`}
        style={{ 
          '&:hover': { 
            backgroundColor: `${elementColors.light}99` // Adding alpha for lighter hover effect
          }
        }}
      >
        <item.icon className="text-2xl min-w-[24px]" />
        <span className="transition-opacity duration-300 text-sm whitespace-nowrap">
          {item.label}
        </span>
      </div>
    ))}
  </div>
);
  }
  