const chatRoomService = require("./chat.service");

const createChatRoom = async (req, res, next) => {
  try {
    const { room_name, is_group, member_ids = [] } = req.body;
    const createdBy = req.user.uid;
    const chatRoom = await chatRoomService.createChatRoom({
      name: room_name,
      isGroup: is_group,
      createdBy,
      members: member_ids,
    });
    return res.status(200).json(chatRoom);
  } catch (error) {
    next(error);
  }
};

const addMemberToChatRoom = async (req, res, next) => {
  try {
    const { roomId, memberId, role, requesterRole } = req.body;
    const member = await chatRoomService.addMemberToChatRoom({
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

    return res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

const getMyChatRoom = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const chatRooms = await chatRoomService.getChatRoomsByUser(userId);
    return res.status(200).json(chatRooms || []);
  } catch (error) {
    next(error);
  }
};

const getChatRoomByNameAndUserName = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { keyword } = req.query;
    const results = await chatRoomService.searchChatRoomsAndUsers(
      keyword,
      userId,
    );
    if (!results || results.length === 0) return res.status(204).json([]);
    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { roomId, cursorMessageId, cursorCreatedAt } = req.query;

    let messages;

    if (!cursorMessageId || !cursorCreatedAt) {
      messages = await chatRoomService.firsTimeGetMessages({
        roomId,
        limit: 30,
      });
    } else {
      messages = await chatRoomService.getMessagesByCursor({
        roomId,
        cursorCreatedAt,
        cursorMessageId,
        limit: 30,
      });
    }

    return res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

const searchMessages = async (req, res, next) => {
  try {
    const { roomId, query } = req.query; 

    const messages = await chatRoomService.searchMessages({ roomId, query });

    return res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

const getPinnedMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const messages = await chatRoomService.getPinnedMessages(roomId);
    return res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

const updateChatRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { room_name, avatar_url, description } = req.body;
    
    // Check if user is admin
    const userId = req.user.uid;
    const role = await chatRoomService.getMemberRole({ roomId, userId });
    if (role !== 'admin') {
        return res.status(403).json({ error: "Only admins can update room info" });
    }

    const updatedRoom = await chatRoomService.updateChatRoom(roomId, {
        name: room_name,
        avatarUrl: avatar_url,
        description
    });
    
    return res.status(200).json(updatedRoom);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChatRoom,
  addMemberToChatRoom,
  getMyChatRoom,
  getChatRoomByNameAndUserName,
  getMessages,
  searchMessages,
  getPinnedMessages,
  updateChatRoom,
};
