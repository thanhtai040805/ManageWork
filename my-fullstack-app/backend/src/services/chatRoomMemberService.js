const { use } = require("react");
const chatRoomMemberModel = require("../models/chatRoomMember");

const addMemberToChatRoom = async({roomId, userId, role, requesterRole}) => {
    if ( requesterRole !== 'admin') {
        throw new Error('Only admin can add members');
    }
    const member = await chatRoomMemberModel.addMember(roomId, userId, role);
    return member;
}


const getMembersOfChatRoom = async(roomId) => {
    const members = await chatRoomMemberModel.getMembersByRoom(roomId);
    return members;
}

const isMemberOfChatRoom = async ({roomId, userId}) => {
    const isMember = await chatRoomMemberModel.isMember(roomId, userId);
    return isMember;
}

const leaveChatRoom = async ({roomId, userId}) => {
    const sucess = await chatRoomMemberModel.leaveRoom(roomId, userId);
    return sucess;
}

const getMemberRole = async ({roomId, userId}) => {
    const role = await chatRoomMemberModel.getRole(roomId, userId);
    return role;
}

const updateMemberRole = async ({roomId, userId, newRole}) => {
    const role = await chatRoomMemberModel.updateRole(roomId, userId, newRole);
    return role;
}

const markMessagesAsRead = async ({roomId, userId, messagesId}) => {
    const result = await chatRoomMemberModel.markAsRead(roomId, userId, messagesId);
    return result;
}

const getUnreadMessagesCount = async ({roomId, userId}) => {
    const count = await chatRoomMemberModel.getUnreadCount(roomId, userId);
    return count;
}

module.exports = {
  addMemberToChatRoom,
  getMemberRole,
  getMembersOfChatRoom,
  getUnreadMessagesCount,
  isMemberOfChatRoom,
  leaveChatRoom,
  updateMemberRole,
  markMessagesAsRead,
};
