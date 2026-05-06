import { useState, useEffect } from "react";
import { Users, Search, Mail, User as UserIcon, Loader2, MessageSquare, ExternalLink } from "lucide-react";
import { getUsersAPI } from "../../services/auth.service";
import { notificationService } from "../../services/notification.service";
import { useNavigate, useSearchParams } from "react-router-dom";

export const PeopleDirectory = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersAPI();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      notificationService.error("Failed to load people directory");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.full_name || "").toLowerCase().includes(query) ||
      (user.username || "").toLowerCase().includes(query) ||
      (user.email || "").toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50/50 p-4 sm:p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">People</h1>
          <p className="text-slate-500 mt-1">Directory of all team members</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search people by name, username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-[40px]! pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-sm"
          />
        </div>

        {/* Directory Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition group relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 w-full h-1" 
                  style={{ backgroundColor: user.theme_color || '#6366f1' }}
                />
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-inner"
                      style={{ backgroundColor: user.theme_color || '#6366f1' }}
                    >
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        (user.full_name || user.username || "?")[0].toUpperCase()
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 truncate w-full">
                    {user.full_name || user.username}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium truncate w-full mb-1">
                    @{user.username}
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                    <Mail size={12} />
                    <span className="truncate max-w-[150px]">{user.email}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => navigate(`/chat?user=${user.user_id}`)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition"
                    >
                      <MessageSquare size={14} />
                      Chat
                    </button>
                    <button 
                      onClick={() => notificationService.info("User profile feature coming soon")}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold text-indigo-700 transition"
                    >
                      <UserIcon size={14} />
                      Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
