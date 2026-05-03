import { useState, useEffect, useContext } from "react";
import { Hash, MessageSquare, Plus } from "lucide-react";
import { RoomList } from "@/features/chat/RoomList";
import { ChatPanel } from "@/features/chat";
import { ChannelSidebar } from "@/features/chat/ChannelSidebar";
import { useChatStore } from "@/stores/chat/chatStore";
import { ThemeContext } from "@/context/themeContext";
import { getProjectsAPI } from "@/services/project.service";

export const Chat = () => {
  const { primaryColor } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("channels"); // "channels" | "direct"
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    getProjectsAPI().then((data) => {
      setProjects(data?.projects || data || []);
      if (data?.projects?.length > 0 || (data && data.length > 0)) {
        const firstProject = data.projects?.[0] || data[0];
        setSelectedProjectId(firstProject.project_id);
      }
    });
  }, []);

  const currentRoom = useChatStore((s) =>
    s.rooms.find((r) => r.room_id === s.currentRoomId),
  );

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Tab Selector */}
      <div className="w-[60px] border-r border-gray-200/60 bg-gray-50 flex flex-col items-center py-4 gap-2">
        <button
          onClick={() => setActiveTab("channels")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "channels"
              ? "text-white shadow-lg"
              : "text-gray-500 hover:bg-gray-200"
          }`}
          style={activeTab === "channels" ? { backgroundColor: primaryColor } : {}}
          title="Channels"
        >
          <Hash size={20} />
        </button>
        <button
          onClick={() => setActiveTab("direct")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "direct"
              ? "text-white shadow-lg"
              : "text-gray-500 hover:bg-gray-200"
          }`}
          style={activeTab === "direct" ? { backgroundColor: primaryColor } : {}}
          title="Direct Messages"
        >
          <MessageSquare size={20} />
        </button>
      </div>

      {/* Sidebar */}
      {activeTab === "channels" ? (
        <ChannelSidebar 
          projectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      ) : (
        <RoomList />
      )}

      {/* Chat Panel */}
      <ChatPanel />
    </div>
  );
};

export default Chat;