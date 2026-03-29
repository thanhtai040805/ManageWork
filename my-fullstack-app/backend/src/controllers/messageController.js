const messageService = require("../services/messageService");

const getMessages = async (req, res) => {
  try {
    const { roomId, cursorMessageId, cursorCreatedAt } = req.query;

    let messages;

    if (!cursorMessageId || !cursorCreatedAt) {
      messages = await messageService.firsTimeGetMessages({
        roomId,
        limit: 30,
      });
    } else {
      messages = await messageService.getMessagesByCursor({
        roomId,
        cursorCreatedAt,
        cursorMessageId,
        limit: 30,
      });
    }

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchMessages = async (req, res) => {
  try {
    const { roomId, query } = req.query; 

    const messages = await messageService.searchMessages({ roomId, query });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getMessages,
  searchMessages,
};
