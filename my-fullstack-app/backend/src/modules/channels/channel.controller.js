const Channel = require("./channel.model");
const ChannelCategory = require("./channelCategory.model");

// ============ CATEGORIES ============

const createCategory = async (req, res, next) => {
  try {
    const { name, project_id, position } = req.body;
    const userId = req.user.uid;

    const category = await ChannelCategory.create({
      name,
      projectId: project_id,
      createdBy: userId,
      position: position || 0,
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const getCategoriesByProject = async (req, res, next) => {
  try {
    const { project_id } = req.query;
    
    if (!project_id) {
      return res.status(400).json({ message: "project_id is required" });
    }

    const categories = await ChannelCategory.getByProject(project_id);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, position } = req.body;

    const category = await ChannelCategory.update(categoryId, { name, position });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    await ChannelCategory.delete(categoryId);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ============ CHANNELS ============

const createChannel = async (req, res, next) => {
  try {
    const { name, project_id, is_public, description } = req.body;
    const userId = req.user.uid;

    const channel = await Channel.create({
      name,
      projectId: project_id,
      isPublic: is_public !== false,
      description: description || null,
      createdBy: userId,
    });

    // Auto-add creator as admin
    await Channel.addMember(channel.channel_id, userId, 'admin');

    res.status(201).json(channel);
  } catch (error) {
    next(error);
  }
};

const getChannelsByProject = async (req, res, next) => {
  try {
    const { project_id } = req.query;
    const userId = req.user.uid;

    if (!project_id) {
      return res.status(400).json({ message: "project_id is required" });
    }

    const channels = await Channel.getUserChannels(userId, project_id);
    res.json(channels);
  } catch (error) {
    next(error);
  }
};

const getMyChannels = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { project_id } = req.query;

    const channels = await Channel.getUserChannels(userId, project_id || null);
    res.json(channels);
  } catch (error) {
    next(error);
  }
};

const getChannelById = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.getById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const members = await Channel.getMembers(channelId);
    res.json({ ...channel, member_list: members });
  } catch (error) {
    next(error);
  }
};

const updateChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { name, description, is_public } = req.body;

    const channel = await Channel.update(channelId, {
      name,
      description,
      isPublic: is_public,
    });

    res.json(channel);
  } catch (error) {
    next(error);
  }
};

const deleteChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    await Channel.delete(channelId);
    res.json({ message: "Channel deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ============ MEMBERS ============

const addChannelMember = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { user_id, role } = req.body;

    const member = await Channel.addMember(channelId, user_id, role || 'member');
    res.json(member);
  } catch (error) {
    next(error);
  }
};

const removeChannelMember = async (req, res, next) => {
  try {
    const { channelId, userId } = req.params;
    await Channel.removeMember(channelId, userId);
    res.json({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
};

const getChannelMembers = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const members = await Channel.getMembers(channelId);
    res.json(members);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Categories
  createCategory,
  getCategoriesByProject,
  updateCategory,
  deleteCategory,
  // Channels
  createChannel,
  getChannelsByProject,
  getMyChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
  // Members
  addChannelMember,
  removeChannelMember,
  getChannelMembers,
};