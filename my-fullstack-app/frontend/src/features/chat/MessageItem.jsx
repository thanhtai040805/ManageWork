import { useContext } from "react";
import { ThemeContext } from "@/context/themeContext";
import { AuthContext } from "@/context/authContext";

export const MessageItem = ({ message }) => {
  const { primaryColor } = useContext(ThemeContext);
  const { auth } = useContext(AuthContext);
  const currentUserId = auth?.user?.uid;
  const senderId = message?.sender_id ?? message?.senderId ?? message?.user_id;
  const isMe =
    typeof message?.isMe === "boolean"
      ? message.isMe
      : typeof message?.is_me === "boolean"
      ? message.is_me
      : senderId != null && currentUserId != null
      ? String(senderId) === String(currentUserId)
      : false;
  const content = message?.content || "";

  return (
    <div
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[74%] shadow-sm ${
          isMe
            ? "text-white rounded-br-md"
            : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
        }`}
        style={
          isMe
            ? {
                backgroundColor: primaryColor,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              }
            : {
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
              }
        }
      >
        {!isMe && (
          <span className="absolute -left-1 top-3 h-2.5 w-2.5 rotate-45 bg-white border-l border-b border-gray-100" />
        )}
        {isMe && (
          <span
            className="absolute -right-1 top-3 h-2.5 w-2.5 rotate-45"
            style={{ backgroundColor: primaryColor }}
          />
        )}
        <p className="relative z-10 break-words whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};
