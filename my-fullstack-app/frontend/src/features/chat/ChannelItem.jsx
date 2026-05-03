import { useContext } from "react";
import { ThemeContext } from "@/context/themeContext";

export function ChannelItem({ channel, active, onClick }) {
  const { primaryColor } = useContext(ThemeContext);

  return (
    <div
      onClick={onClick}
      className={`relative px-4 py-2.5 cursor-pointer rounded-xl transition-all duration-200 group select-none ${
        active 
          ? "bg-gray-100" 
          : "hover:bg-gray-50"
      }`}
    >
      {active && (
        <div 
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
          style={{ backgroundColor: primaryColor }}
        />
      )}

      <div className="flex items-center gap-3">
        <div className={`text-[14px] ${active ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
          {channel.is_public ? (
            <span className="opacity-70">#</span>
          ) : (
            <span className="opacity-50">🔒</span>
          )}
        </div>
        <span className={`text-[13px] truncate ${active ? "font-semibold text-gray-900" : "text-gray-700 font-medium"}`}>
          {channel.name}
        </span>
      </div>
    </div>
  );
}

export default ChannelItem;