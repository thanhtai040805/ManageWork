const chatRoomMemberService = require('../services/chatRoomMemberService');
const chatRoomService = require('../services/chatRoomService');

const createChatRoom = async (req, res) => {
  try {
    const { room_name, is_group, member_ids = [] } = req.body;
    const createdBy = req.user.uid;
    const chatRoom = await chatRoomService.createChatRoom({
      name: room_name,
      isGroup: is_group,
      createdBy,
      members: member_ids,
    });
    res.status(200).json(chatRoom);
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
      return res.status(400).json({
        error: "Failed to add member to chat room or member already exists",
      });
    }

    res.status(200).json(member);
  } catch (error) {
    console.error("Error adding member to chat room", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMyChatRoom = async (req, res) => {
  try {
    const userId = req.user.uid;
    const chatRooms = await chatRoomService.getChatRoomsByUser(userId);
    if (chatRooms.length === 0) return res.status(200).json([]);
    res.status(200).json(chatRooms);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getChatRoomByNameAndUserName = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { keyword } = req.query;
    const results = await chatRoomService.searchChatRoomsAndUsers(
      keyword,
      userId,
    );
    if (results.length === 0) return res.status(204).json([]);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createChatRoom,
  addMemberToChatRoom,
  getMyChatRoom,
  getChatRoomByNameAndUserName,
};