import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Hash, MessageSquare, ArrowLeft } from "lucide-react";
import { RoomList } from "@/features/chat/RoomList";
import { ChatPanel } from "@/features/chat";
import { ChannelSidebar } from "@/features/chat/ChannelSidebar";
import { ChannelView } from "@/features/chat/ChannelView";
import { useChatStore } from "@/stores/chat/chatStore";
import { useChannelStore } from "@/stores/chat/channelStore";
import { useChatRooms } from "@/hooks/chat_hook/useChatRooms";
import { ThemeContext } from "@/context/themeContext";
import { getProjectsAPI } from "@/services/project.service";

export const Chat = () => {
  const { primaryColor } = useContext(ThemeContext);
  const { channelId, roomId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const { currentRoomId, setCurrentRoom, setRooms, setLoadingRooms } = useChatStore();
  const { currentChannel } = useChannelStore();
  const { rooms, fetchRooms } = useChatRooms();

  useEffect(() => {
    getProjectsAPI().then((data) => {
      setProjects(data?.projects || data || []);
    });
  }, []);

  useEffect(() => {
    if (channelId) {
      setActiveTab("channels");
    } else if (roomId) {
      setActiveTab("chat");
    }
  }, [channelId, roomId]);

  useEffect(() => {
    if (channelId && activeTab === "channels" && !selectedChannel) {
      useChannelStore.getState().fetchChannels().then(() => {
        const channels = useChannelStore.getState().channels;
        const found = channels.find(c => c.channel_id === channelId);
        if (found) {
          setSelectedChannel(found);
        }
      });
    }
  }, [channelId, activeTab]);

  useEffect(() => {
    if (roomId && activeTab === "chat" && !currentRoomId && rooms.length > 0) {
      const found = rooms.find(r => r.room_id === roomId);
      if (found) {
        setCurrentRoom(roomId);
      }
    }
  }, [roomId, activeTab, rooms, currentRoomId]);

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    navigate(`/chat/channels/${channel.channel_id}`);
  };

  const handleChannelBack = () => {
    setSelectedChannel(null);
    navigate("/chat");
  };

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      {/* Tab Selector - Left Sidebar */}
      <div className="w-[60px] border-r border-gray-200/60 bg-gray-50 flex flex-col items-center py-4 gap-2">
        {/* Chat Tab */}
        <button
          onClick={() => { setActiveTab("chat"); setSelectedChannel(null); navigate("/chat"); }}
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
          onClick={() => { setActiveTab("channels"); navigate("/chat"); }}
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
          onChannelSelect={handleChannelSelect}
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
            onBack={handleChannelBack}
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