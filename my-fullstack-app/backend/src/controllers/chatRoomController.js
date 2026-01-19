const chatRoomMemberService = require('../services/chatRoomMemberService');
const chatRoomService = require('../services/chatRoomService');

const createChatRoom = async (req, res) => {
  try {
    const { name, isGroup, memberIds = [] } = req.body;
    const creatorId = req.user.uid;
    const chatRoom = await chatRoomService.createChatRoom({
      name,
      isGroup,
      creatorId,
      memberIds,
    });
    res.status(200).json({ chatRoom });
  } catch (error) {
    console.error("Error creating chat room", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addMemberToChatRoom = async (req, res) => {
  try {
    const { roomId, memberId, role, requesterRole } = req.body;
    const member = await chatRoomMemberService.addMemberToChatRoom({
      roomId,
      memberId,
      role,
      requesterRole,
    });
    if (!member) {
      res
        .status(400)
        .json({
          error: "Failed to add member to chat room or member already exists",
        });
    }

    res.status(200).json({ member });
  } catch (error) {
    console.error("Error adding member to chat room", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMyChatRoom = async (req, res) => {
  try {
    const { userId } = req.user.uid;
    const chatRooms = await chatRoomService.getChatRoomsByUser({ userId });
    if (chatRooms.length === 0) return res.status(204).json();
    res.status(200).json({ member });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createChatRoom,
  addMemberToChatRoom,
  getMyChatRoom,
};