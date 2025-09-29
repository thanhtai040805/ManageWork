import {
  HomeIcon,
  LogOutIcon,
  HelpCircleIcon,
  SettingsIcon,
  WorkflowIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export const VerticalNav = () => {
  const menu = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/my-tasktask", label: "My Tasks", icon: WorkflowIcon },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
    { href: "/help", label: "Help", icon: HelpCircleIcon },
  ];

  return (
    <nav className="flex flex-col justify-between w-56 bg-primary shadow-lg py-6 px-3 h-full">
      <div className="flex-1 flex flex-col">
        {/* user info */}
        <div className="mb-8 flex items-center justify-center flex-col">
          <img
            src="/logo192.png"
            alt="Logo"
            className="h-12 w-12 rounded-full mb-2"
          />
          <span className="text-white text-lg font-medium">User name</span>
          <span className="text-white text-xs opacity-80">user@email.com</span>
        </div>

        {/* menu */}
        <ul className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {menu.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <NavLink
                to={href}
                className={({ isActive }) =>
                  `group flex text-base items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white text-primary shadow-sm"
                      : "text-white hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="mr-3" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* logout luôn nằm cuối */}
      <div className="group flex text-base items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 cursor-pointer border-t border-white/10 pt-4">
        <LogOutIcon
          size={20}
          stroke="currentColor"
          className="mr-3"
        />
        <span>Logout</span>
      </div>
    </nav>
  );
};
