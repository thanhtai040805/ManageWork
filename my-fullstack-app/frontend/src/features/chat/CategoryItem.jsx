import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { ChannelItem } from "./ChannelItem";

export function CategoryItem({ category, activeChannelId, onChannelClick }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const channels = category.channels || [];

  return (
    <div className="mb-1">
      <div 
        className="flex items-center justify-between px-3 py-1.5 group cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1">
          <span className="text-gray-400">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            {category.name}
          </span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity">
          <MoreHorizontal size={12} className="text-gray-500" />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-0.5 ml-2">
          {channels.map((channel) => (
            <ChannelItem
              key={channel.channel_id}
              channel={channel}
              active={activeChannelId === channel.channel_id}
              onClick={() => onChannelClick(channel)}
            />
          ))}
          {channels.length === 0 && (
            <div className="px-4 py-2 text-[11px] text-gray-400 italic">
              No channels yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryItem;