export const MessageItem = ({ message }) => {
  const isMe = message.isMe;

  return (
    <div
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`
          px-4 py-2 rounded-2xl text-sm max-w-[70%]
          shadow-sm
          ${
            isMe
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-100 text-gray-800 rounded-bl-md"
          }
        `}
      >
        {message.content}
      </div>
    </div>
  );
};
