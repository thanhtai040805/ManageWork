const userModel = require("../../modules/users/user.model");
const Notification = require("../../modules/notifications/notification.model");
const socketEmitter = require("../sockets/socketEmitter");

/**
 * Extracts usernames from a string with @mentions
 * @param {string} text 
 * @returns {string[]}
 */
const extractMentions = (text) => {
  if (!text) return [];
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  if (!matches) return [];
  return matches.map(m => m.substring(1));
};

/**
 * Notifies mentioned users in a piece of content
 * @param {string} text 
 * @param {string} senderId 
 * @param {string} type 
 * @param {string} message 
 */
const notifyMentions = async (text, senderId, type, message) => {
  const usernames = extractMentions(text);
  if (usernames.length === 0) return;

  for (const username of usernames) {
    try {
      const user = await userModel.findByUsername(username);
      if (user && String(user.user_id) !== String(senderId)) {
        const notification = await Notification.create({
          userId: user.user_id,
          type: type || 'system',
          message: message || 'You were mentioned'
        });
        socketEmitter.emitNotification(user.user_id, notification);
      }
    } catch (error) {
      console.error(`Error notifying mention for ${username}:`, error);
    }
  }
};

module.exports = {
  extractMentions,
  notifyMentions
};
