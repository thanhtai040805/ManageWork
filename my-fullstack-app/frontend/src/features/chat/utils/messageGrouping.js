const TIME_GAP_THRESHOLD = 5 * 60 * 1000;

export const isNewDay = (currentMsg, prevMsg) => {
  if (!prevMsg) return true;
  const currentDate = new Date(currentMsg.created_at).toDateString();
  const prevDate = new Date(prevMsg.created_at).toDateString();
  return currentDate !== prevDate;
};

export const isFirstInGroup = (msg, index, messages) => {
  const prevMsg = messages[index - 1];
  if (!prevMsg) return true;
  
  if (isNewDay(msg, prevMsg)) return true;
  if (prevMsg.sender_id !== msg.sender_id) return true;
  
  const timeDiff = new Date(msg.created_at) - new Date(prevMsg.created_at);
  return timeDiff > TIME_GAP_THRESHOLD;
};

export const isLastInGroup = (msg, index, messages) => {
  const nextMsg = messages[index + 1];
  if (!nextMsg) return true;
  
  const currentDate = new Date(msg.created_at).toDateString();
  const nextDate = new Date(nextMsg.created_at).toDateString();
  
  if (currentDate !== nextDate) return true;
  if (nextMsg.sender_id !== msg.sender_id) return true;
  
  return false;
};

export const getMessageGroups = (messages) => {
  return messages.map((msg, index) => ({
    message: msg,
    showDateSeparator: isNewDay(msg, messages[index - 1]),
    isFirstInGroup: isFirstInGroup(msg, index, messages),
    isLastInGroup: isLastInGroup(msg, index, messages),
  }));
};