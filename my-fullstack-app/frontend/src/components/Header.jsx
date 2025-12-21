import { BellIcon, Calendar, SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/theme.context";

export const Header = () => {
    const date = new Date();
    const { primaryColor } = useContext(ThemeContext);

    const formatted = date.toLocaleDateString("vi-VN"); 
    const weekday = date.toLocaleDateString("en", { weekday: "long" });

  return (
    <div className="w-full flex p-5 z-40 bg-[#F8F8FB] transition-all duration-300 items-center justify-around">
      <div className="container flex items-center justify-between">
        <Link to="/">
          <span className="text-3xl font-bold">
            Dash<span style={{ color: primaryColor }}>Board</span>
          </span>
        </Link>
        <div className="flex w-[60%] items-center shadow-md rounded bg-white">
          <input
            name="search"
            className="px-3 py-5 w-full rounded focus:outline-none transition-colors"
            style={{
              "--tw-ring-color": primaryColor,
            }}
            type="text"
            placeholder="Search your task here..."
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "";
            }}
          />
          <div 
            className="p-3 rounded text-white cursor-pointer transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <SearchIcon size={22} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <BellIcon />
          <Calendar />
          <div className="flex flex-col ml-6">
            <span className="font-medium">{weekday}</span>
            <span className="text-[#3ABEFF]">{formatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
