import { useState, useEffect } from "react";
import { editTaskByIDAPI } from "../../../services/task.service";
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
  });

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    start_date: task?.start_date || "",
    due_date: task?.due_date || "",
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
      });
    }
  }, [task]);

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
        assignedUserId: task.assigned_to || null,
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
