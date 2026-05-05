import { useState, useEffect } from "react";
import { editTaskByIDAPI } from "../../../services/task.service";
import { getProjectMembersAPI } from "../../../services/project.service";
import { parseDateTimeLocal } from "./useTaskForm";
import { notificationService } from "../../../services/notification.service";

export const useTaskDetail = (task, onUpdate) => {
  const [isEditing, setIsEditing] = useState({
    title: false,
    description: false,
    status: false,
    priority: false,
    startDate: false,
    dueDate: false,
    assignee: false,
  });

  const [projectMembers, setProjectMembers] = useState([]);

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    start_date: task?.start_date || "",
    due_date: task?.due_date || "",
    assigned_to: task?.assigned_to || null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showApplyToModal, setShowApplyToModal] = useState(false);
  const [applyToOption, setApplyToOption] = useState("this");

  const isRecurringTask =
    task?.recurring_task_id !== null && task?.recurring_task_id !== undefined;

  const fieldsThatTriggerModal = [
    "title",
    "description",
    "priority",
    "start_date",
    "due_date",
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        start_date: task.start_date || "",
        due_date: task.due_date || "",
        assigned_to: task.assigned_to || null,
      });
    }
  }, [task]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (task?.project_id) {
        try {
          const members = await getProjectMembersAPI(task.project_id);
          setProjectMembers(members || []);
        } catch (error) {
          console.error("Error fetching project members:", error);
        }
      }
    };
    fetchMembers();
  }, [task?.project_id]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (applyTo = "this", overrideData = null) => {
    if (!task?.task_id) return;

    const dataToSave = overrideData || formData;

    setIsSaving(true);
    try {
      const updateData = {
        title: dataToSave.title,
        description: dataToSave.description,
        status: dataToSave.status,
        priority: dataToSave.priority,
        startDate: dataToSave.start_date
          ? parseDateTimeLocal(dataToSave.start_date)
          : null,
        dueDate: dataToSave.due_date
          ? parseDateTimeLocal(dataToSave.due_date)
          : null,
        assignedUserId: dataToSave.assigned_to || null,
      };

      const updatedTask = await editTaskByIDAPI(
        task.task_id,
        updateData,
        applyTo
      );

      setIsEditing({
        title: false,
        description: false,
        status: false,
        priority: false,
        startDate: false,
        dueDate: false,
        assignee: false,
      });

      if (onUpdate) {
        onUpdate(updatedTask);
      }

      setShowApplyToModal(false);
    } catch (error) {
      console.error("Error updating task:", error);
      notificationService.error(error.response?.data?.message || "Failed to update task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldBlur = (field) => {
    const taskFieldMap = {
      title: "title",
      description: "description",
      status: "status",
      priority: "priority",
      start_date: "start_date",
      due_date: "due_date",
      assigned_to: "assigned_to",
    };

    const taskField = taskFieldMap[field] || field;
    const originalValue = task?.[taskField] || "";
    const currentValue = formData[field];

    let hasChanges = false;
    if (field === "start_date" || field === "due_date") {
      const originalISO = task?.[taskField]
        ? new Date(task[taskField]).toISOString()
        : "";
      const currentISO = currentValue ? parseDateTimeLocal(currentValue) : "";
      hasChanges = originalISO !== currentISO;
    } else {
      hasChanges = originalValue !== currentValue;
    }

    if (hasChanges) {
      if (isRecurringTask && fieldsThatTriggerModal.includes(field)) {
        setShowApplyToModal(true);
      } else {
        handleSave("this");
      }
    }

    const editingFieldMap = {
      title: "title",
      description: "description",
      status: "status",
      priority: "priority",
      start_date: "startDate",
      due_date: "dueDate",
      assigned_to: "assignee",
    };

    const editingField = editingFieldMap[field] || field;
    setIsEditing((prev) => ({
      ...prev,
      [editingField]: false,
    }));
  };

  const handleFieldFocus = (field) => {
    const editingFieldMap = {
      title: "title",
      description: "description",
      status: "status",
      priority: "priority",
      startDate: "startDate",
      dueDate: "dueDate",
      assigned_to: "assignee",
    };

    const editingField = editingFieldMap[field] || field;
    setIsEditing((prev) => ({
      ...prev,
      [editingField]: true,
    }));
  };

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    projectMembers,
    isSaving,
    showApplyToModal,
    setShowApplyToModal,
    applyToOption,
    setApplyToOption,
    isRecurringTask,
    handleFieldChange,
    handleFieldBlur,
    handleFieldFocus,
    handleSave,
  };
};
