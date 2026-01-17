const chatRoomModel =  require("../models/chatRoom");
const chatRoomMemberModel = require("../models/chatRoomMember");

const createChatRoom = async ({name , isGroup, createdBy, members = []}) => {
    const chatRoom = await chatRoomModel.create({name , isGroup, createdBy});

    // Add the creator as a admin of the chat room
    await chatRoomMemberModel.addMember(chatRoom.roomId, createdBy, 'admin');
    
    // Add other members
    for (const memberId of members) {
        if ( memberId === createdBy) continue;
        await chatRoomMemberModel.addMember(
            chatRoom.roomId,
            memberId
        )
    }
    return chatRoom;
}

const getChatRoomsByUser = async (userId) => {
    const chatRooms = await chatRoomModel.getRoomsByUser(userId);
    return chatRooms;
}

const getChatRoomById = async (roomId) => {
    const chatRoom = await chatRoomModel.getRoomById(roomId);
    return chatRoom;
}

const getLastMessageId = async (roomId) => {
    const lastMessageId = await chatRoomModel.getLastMessageId(roomId);
    return lastMessageId;
}

module.exports = {
  createChatRoom,
  getChatRoomsByUser,
  getChatRoomById,
  getLastMessageId,
};