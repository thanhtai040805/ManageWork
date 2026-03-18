export const TypingIndicator = () => {
  const isTyping = false; // socket event

  if (!isTyping) return null;

  return <p className="text-xs text-gray-400 italic">Someone is typing...</p>;
};
