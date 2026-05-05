import { useState, useEffect, useContext } from "react";
import { Hash, MessageSquare, X, Users, Pin } from "lucide-react";
import { RoomList } from "@/features/chat/RoomList";
import { ChatPanel } from "@/features/chat";
import { ChannelSidebar } from "@/features/chat/ChannelSidebar";
import { ChannelView } from "@/features/chat/ChannelView";
import { useChatStore } from "@/stores/chat/chatStore";
import { useChannelStore } from "@/stores/chat/channelStore";
import { ThemeContext } from "@/context/themeContext";
import { getProjectsAPI } from "@/services/project.service";

export const Chat = () => {
  const { primaryColor } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "channels"
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const currentRoom = useChatStore((s) =>
    s.rooms.find((r) => r.room_id === s.currentRoomId),
  );

  const { currentChannel } = useChannelStore();

  useEffect(() => {
    getProjectsAPI().then((data) => {
      setProjects(data?.projects || data || []);
    });
  }, []);

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Tab Selector - Left Sidebar */}
      <div className="w-[60px] border-r border-gray-200/60 bg-gray-50 flex flex-col items-center py-4 gap-2">
        {/* Chat Tab */}
        <button
          onClick={() => { setActiveTab("chat"); setSelectedChannel(null); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTab === "chat"
              ? "text-white shadow-lg"
              : "text-gray-500 hover:bg-gray-200"
          }`}
          style={activeTab === "chat" ? { backgroundColor: primaryColor } : {}}
          title="Messages"
        >
          <MessageSquare size={20} />
        </button>

        {/* Channels Tab */}
        <button
          onClick={() => { setActiveTab("channels"); }}
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
      </div>

      {/* Sidebar */}
      {activeTab === "channels" ? (
        <ChannelSidebar 
          projectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          onChannelSelect={(channel) => setSelectedChannel(channel)}
          selectedChannel={selectedChannel}
        />
      ) : (
        <RoomList />
      )}

      {/* Main Content */}
      {activeTab === "channels" ? (
        selectedChannel ? (
          <ChannelView 
            channelId={selectedChannel.channel_id} 
            channelName={selectedChannel.name} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Hash size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400">Select a channel to view posts</p>
            </div>
          </div>
        )
      ) : (
        <ChatPanel />
      )}
    </div>
  );
};

export default Chat;