import {
  HomeIcon,
  LogOutIcon,
  HelpCircleIcon,
  SettingsIcon,
  WorkflowIcon,
  FolderKanban,
  MessageCircleIcon,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { ThemeContext } from "../../context/themeContext";

export const VerticalNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/my-task", label: "My Tasks", icon: WorkflowIcon },
    { href: "/chat", label: "DMs", icon: MessageCircleIcon },
    { href: "/help", label: "Help", icon: HelpCircleIcon },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
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
      className="group flex flex-col justify-between h-full bg-primary w-16"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex-1 flex flex-col">
        {/* user info */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <img
            src={auth.user?.avatarUrl || ""}
            className="h-10 w-10 rounded-full object-cover border border-white/30"
          />
        </div>

        {/* menu */}
        <ul className="block items-center gap-2 flex-1 overflow-y-auto">
          {menu.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <NavLink
                  to={href}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg
                        ${active ? "bg-white/20" : "hover:bg-white/10"}`}
                >
                  <Icon size={20} className="text-white mb-1" />

                  <span className="text-white text-[11px] leading-tight whitespace-nowrap">
                    {label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* logout luôn nằm cuối */}
      <div
        onClick={() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          localStorage.removeItem("theme_color");
          navigate("/login");
        }}
        className="
    flex flex-col items-center justify-center
    py-4 cursor-pointer
    text-white hover:bg-white/10
  "
      >
        <LogOutIcon size={20} />
        <span className="text-[11px] mt-1">Logout</span>
      </div>
    </nav>
  );
};

