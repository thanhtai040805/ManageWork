import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AtSign } from "lucide-react";

export function MentionInput({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  members = [],
  disabled = false,
}) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const filteredMembers = members.filter((m) =>
    m.full_name?.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    m.name?.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const showAllOption = mentionSearch === "" || "all".includes(mentionSearch.toLowerCase());

  useEffect(() => {
    if (showMentions) {
      setSelectedMentionIndex(0);
    }
  }, [mentionSearch]);

  const updateDropdownPosition = () => {
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      const dropdownHeight = 200;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      let top;
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        top = rect.top - dropdownHeight - 8;
      } else {
        top = rect.top - 8;
      }
      
      setDropdownPos({
        top: top,
        left: rect.left
      });
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
      if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
        setShowMentions(true);
        setMentionSearch(textAfterAt);
        setMentionPosition(lastAtPos);
        setTimeout(updateDropdownPosition, 0);
      }
    } else {
      setShowMentions(false);
    }

    onChange(val);
  };

  const insertMention = (member) => {
    const cursorPos = textareaRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    const newValue =
      textBeforeCursor.slice(0, lastAtPos) +
      `@${member.full_name || member.name} ` +
      textAfterCursor;

    onChange(newValue);
    setShowMentions(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const insertAll = () => {
    const cursorPos = textareaRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    const newValue =
      textBeforeCursor.slice(0, lastAtPos) + "@all " + textAfterCursor;

    onChange(newValue);
    setShowMentions(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showMentions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMentionIndex((prev) =>
          Math.min(prev + 1, filteredMembers.length + (showAllOption ? 0 : 0))
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMentionIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        if (showAllOption && selectedMentionIndex === 0) {
          insertAll();
        } else if (filteredMembers.length > 0) {
          const adjustIndex = showAllOption ? selectedMentionIndex - 1 : selectedMentionIndex;
          if (adjustIndex >= 0) {
            insertMention(filteredMembers[adjustIndex]);
          }
        }
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend?.();
    }
  };

  const mentionList = showAllOption 
    ? [{ user_id: "@all", full_name: "@all", isAll: true }, ...filteredMembers]
    : filteredMembers;

  const dropdown = showMentions && mentionList.length > 0 && (
    <div 
      className="fixed w-64 bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-y-auto z-[99999]"
      style={{ 
        top: dropdownPos.top, 
        left: dropdownPos.left 
      }}
    >
      {mentionList.map((member, idx) => (
        <button
          type="button"
          key={member.user_id || member.id}
          onClick={() => member.isAll ? insertAll() : insertMention(member)}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${idx === selectedMentionIndex ? "bg-gray-100" : ""
            }`}
        >
          {member.isAll ? (
            <>
              <AtSign size={14} className="text-gray-500" />
              <span className="font-medium">@all</span>
              <span className="text-xs text-gray-400">Notify all</span>
            </>
          ) : (
            <>
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name || member.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {(member.full_name || member.name)?.[0]?.toUpperCase()}
                </div>
              )}
              <span>{member.full_name || member.name}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none placeholder:text-gray-400"
        rows={2}
      />

      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}

export default MentionInput;