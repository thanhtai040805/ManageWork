import { useState } from "react";
import { toast } from "react-toastify";
import { X, Search } from "lucide-react";
import { addChannelMemberAPI, removeChannelMemberAPI } from "@/services/channel.service";

export function ChannelMembersModal({
  isOpen,
  onClose,
  channelId,
  currentUserId,
  members = [],
  availableUsers = [],
  onMembersChange,
}) {
  const [search, setSearch] = useState("");

  const filteredUsers = availableUsers.filter(
    (u) => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = async (userId) => {
    try {
      await addChannelMemberAPI(channelId, userId, "member");
      const user = availableUsers.find((u) => u.user_id === userId);
      if (user) {
        onMembersChange([...members, { ...user, role: "member" }]);
      }
      toast.success("Member added");
    } catch (error) {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeChannelMemberAPI(channelId, userId);
      onMembersChange(members.filter((m) => m.user_id !== userId));
      toast.success("Member removed");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[400px] max-h-[500px] flex flex-col shadow-2xl">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Channel Members</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Current Members */}
        <div className="border-b">
          <div className="px-4 py-2 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500">Current Members ({members.length})</p>
          </div>
          <div className="max-h-[180px] overflow-y-auto p-2">
            {members.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No members yet</p>
            ) : (
              <div className="space-y-1">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                    <div className="flex items-center gap-2">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.full_name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          {member.full_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{member.full_name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 capitalize">{member.role}</span>
                      {member.user_id !== currentUserId && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Members */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-2 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500">Add Members</p>
          </div>

          <div className="px-4 py-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredUsers.length > 0 ? (
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          {user.full_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user.user_id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                {search ? "No users found" : "No more users to add"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelMembersModal;