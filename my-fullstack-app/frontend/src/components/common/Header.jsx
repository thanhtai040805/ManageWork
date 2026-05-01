import { Bell, Calendar, Search, LogOut, Settings, User, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { notificationService } from "../../services/notification.service";
import { ThemeContext } from "../../context/themeContext";
import { AuthContext } from "../../context/authContext";

export const Header = () => {
  const { primaryColor } = useContext(ThemeContext);
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 1) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notifsRes, countRes] = await Promise.all([
          notificationService.getNotificationsAPI({ limit: 10 }),
          notificationService.getUnreadCountAPI()
        ]);
        setNotifications(notifsRes?.data || []);
        setUnreadCount(countRes?.data?.unreadCount || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsReadAPI();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsReadAPI(id);
      setNotifications(notifications.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await apiClient.get(`/v1/api/search?query=${searchQuery}`);
      const resultsData = response?.results;

      // Handle both array and object formats from backend
      let results = [];
      if (Array.isArray(resultsData)) {
        // Backend returns flat array with type field
        results = resultsData;
      } else if (resultsData && typeof resultsData === 'object') {
        // Backend returns object with separate arrays (legacy format)
        if (resultsData.projects?.length) results.push(...resultsData.projects.map(p => ({ ...p, type: 'project' })));
        if (resultsData.tasks?.length) results.push(...resultsData.tasks.map(t => ({ ...t, type: 'task' })));
        if (resultsData.users?.length) results.push(...resultsData.users.map(u => ({ ...u, type: 'user' })));
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result) => {
    setSearchQuery("");
    setSearchResults([]);
    if (result.type === 'project') navigate(`/projects/${result.project_id || result.id}`);
    if (result.type === 'task') navigate(`/tasks/${result.task_id}`);
    if (result.type === 'user') navigate(`/profile/${result.user_id || result.id}`);
  };

  return (
    <header className="sticky top-0 w-full z-50 glass border-b border-slate-200/50 px-8 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-xl font-black">M</span>
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-900">
          Manage<span style={{ color: primaryColor }}>Work</span>
        </span>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-12">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search projects, tasks, or members..."
            className="w-full pl-[40px]! bg-slate-100/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {(isSearching || searchResults.length > 0) && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {isSearching ? "Searching..." : "Search Results"}
                </span>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {searchResults.length}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {searchResults.map((result) => {
                  const typeColors = {
                    project: { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: '📁' },
                    task: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: '✓' },
                    user: { bg: 'bg-amber-100', text: 'text-amber-600', icon: '👤' }
                  };
                  const colors = typeColors[result.type] || typeColors.task;

                  return (
                    <button
                      key={`${result.type}-${result.project_id || result.task_id || result.user_id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group border-b border-slate-50 last:border-b-0"
                    >
                      <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center text-sm ${colors.text}`}>
                        {colors.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {result.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                            {result.type}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </button>
                  );
                })}

                {!isSearching && searchResults.length === 0 && searchQuery.length > 1 && (
                  <div className="py-8 px-4 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      No results found for "<span className="text-slate-700">{searchQuery}</span>"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 pr-6 border-r border-slate-200">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors relative active:scale-90"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute top-full right-0 mt-3 w-80 glass rounded-[32px] shadow-2xl border border-white/40 p-2 animate-in fade-in slide-in-from-top-4 duration-200 z-10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100/50 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-tight"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto custom-scrollbar p-2">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.notification_id}
                          onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
                          className={`p-4 rounded-2xl mb-1 transition-colors cursor-pointer ${n.is_read ? 'hover:bg-slate-50/50' : 'bg-indigo-50/50 hover:bg-indigo-50'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.is_read ? 'bg-slate-200' : 'bg-indigo-600'}`} />
                            <div>
                              <p className={`text-xs ${n.is_read ? 'text-slate-600' : 'text-slate-900 font-bold'}`}>{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(n.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <Bell size={24} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium italic px-8">You're all caught up! No new notifications.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-100/50">
                    <button className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em] transition-colors">
                      View All Activity
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <Calendar size={20} />
          </button>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pl-4 bg-slate-100/50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all active:scale-95"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900">{auth?.user?.username || "Guest User"}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{auth?.user?.role || "Member"}</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              {auth?.user?.username?.charAt(0).toUpperCase() || "G"}
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-0" onClick={() => setShowProfileMenu(false)}></div>
              <div className="absolute top-full right-0 mt-3 w-56 glass rounded-[24px] shadow-2xl border border-white/40 p-2 animate-in fade-in slide-in-from-top-4 duration-200 z-10 overflow-hidden">
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                    <User size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-sm font-bold text-slate-700">My Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                    <Settings size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-sm font-bold text-slate-700">Settings</span>
                  </button>
                  <div className="h-px bg-slate-100 mx-2 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-3 hover:bg-rose-50 rounded-xl transition-colors text-left group"
                  >
                    <LogOut size={18} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-rose-600 transition-colors">Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
