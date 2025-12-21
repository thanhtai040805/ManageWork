import {
  HomeIcon,
  LogOutIcon,
  HelpCircleIcon,
  SettingsIcon,
  WorkflowIcon,
  FolderKanban,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { ThemeContext } from "../context/theme.context";

export const VerticalNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/my-task", label: "My Tasks", icon: WorkflowIcon },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
    { href: "/help", label: "Help", icon: HelpCircleIcon },
  ];

  const { auth } = useContext(AuthContext);
  const { primaryColor } = useContext(ThemeContext);

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav
      className="flex flex-col justify-between w-56 shadow-lg py-6 px-3 h-full transition-colors duration-300"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex-1 flex flex-col">
        {/* user info */}
        <div className="mb-8 flex items-center justify-center flex-col">
          <img
            src={auth.user?.avatarUrl || "/logo192.png"}
            alt="User avatar"
            className="h-12 w-12 rounded-full mb-2 object-cover border-2 border-white/20"
            onError={(e) => {
              e.target.src = "/logo192.png";
            }}
          />
          <span className="text-white text-lg font-medium">
            {auth.user?.fullName || auth.user?.name || "User"}
          </span>
          <span className="text-white text-xs opacity-80">
            {auth.user?.email || ""}
          </span>
        </div>

        {/* menu */}
        <ul className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {menu.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <NavLink
                  to={href}
                  className={`group flex text-base items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-white shadow-sm"
                      : "text-white hover:bg-white/10 hover:text-white"
                  }`}
                  style={{ color: active ? primaryColor : "white" }}
                >
                  <Icon
                    size={20}
                    className="mr-3"
                    style={{ color: active ? primaryColor : "white" }}
                  />
                  <span>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* logout luôn nằm cuối */}
      <div className="group flex text-base items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 cursor-pointer border-t border-white/10 pt-4">
        <LogOutIcon size={20} stroke="currentColor" className="mr-3" />
        <span
          onClick={() => {
            // Clear all user-related data from localStorage
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            localStorage.removeItem("theme_color"); // Clear theme color when logout
            navigate("/login");
          }}
        >
          Logout
        </span>
      </div>
    </nav>
  );
};
