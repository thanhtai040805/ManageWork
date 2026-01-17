const messageService = require('../services/messageService');
const chatRoomServices = require('../services/chatRoomService')
const chatRoomMemberService = require('../services/chatRoomMemberService')


const getMessages = async (req, res) => {
    try {
        const { roomId, cursorMessageId, cursorCreatedAt } = req.body;
        let messages;
        if (!cursorMessageId || !cursorCreatedAt) {
            messages = await messageService.firsTimeGetMessages({ roomId, limit: 30});
        }
        messages = await messageService.getMessagesByCursor({
            roomId,
            cursorCreatedAt,
            cursorMessageId,
            limit: 30,
        })
        if (messages.length === 0) {
            return res.status(204).json({ messages: "No messages found"})
        }
        res.status(200).json({ messages});
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error"})
    }
}

const searchMessages = async (req, res) => {
    try {
        const { roomId, query } = req.body;
        const messages = await messageService.searchMessages({roomId, query});
        if ( messages.length === 0 ) {
            return res.status(204).json({ messages: "No messages found"})
        }
        res.status(200).json({messages})
    }
    catch (error) {
        console.error("Error searching messages:", error);
        res.status(500).json({ error: "Internal server error"})
    }
}

module.exports = {
  getMessages,
  searchMessages,
};

