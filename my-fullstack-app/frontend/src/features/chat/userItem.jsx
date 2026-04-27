import { useContext } from "react";
import { ThemeContext } from "@/context/themeContext";

export const UserItem = ({ user, onClick }) => {
  const { primaryColor } = useContext(ThemeContext);

  return (
    <div
      onClick={onClick}
      className="px-3 py-3 cursor-pointer border-b border-gray-100 hover:bg-[#f5f6f6] transition"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full text-white text-sm font-semibold flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          {(user.full_name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{user.full_name}</p>
          <p className="text-xs text-gray-500">Start private chat</p>
        </div>
      </div>
    </div>
  );
};
