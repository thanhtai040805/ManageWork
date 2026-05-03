const ProjectTemplate = require("./template.model");

const getTemplates = async (req, res, next) => {
  try {
    const templates = await ProjectTemplate.getAll();
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

const getTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const template = await ProjectTemplate.getById(templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
};

const createTemplate = async (req, res, next) => {
  try {
    const { name, description, category, tasks } = req.body;
    const template = await ProjectTemplate.create({ name, description, category, tasks });
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

const deleteTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    await ProjectTemplate.delete(templateId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getTaskTemplates = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const tasks = await ProjectTemplate.getTaskTemplates(templateId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const createTaskTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { title, description, priority, status } = req.body;
    const task = await ProjectTemplate.createTaskTemplate({ templateId, title, description, priority, status });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  deleteTemplate,
  getTaskTemplates,
  createTaskTemplate
};