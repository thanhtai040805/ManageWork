import React, { useMemo, useState, useEffect } from "react";
import { TaskDetail } from "../components/TaskDetail";
import { AddTask } from "../components/AddTask";
import { MyTasksHeader } from "../components/MyTasksHeader";
import { WeekView } from "../components/WeekView";
import { MonthView } from "../components/MonthView";
import { getTasksAPI } from "../util/taskAPI";
import { getWeekRange, getMonthRange, isDateInRange } from "../utils/dateHelpers";

export const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [viewType, setViewType] = useState("week"); // "week" or "month"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null); // For task detail modal
  const [showAddTask, setShowAddTask] = useState(false); // For add task modal

  // Fetch tasks
  useEffect(() => {
    getTasksAPI()
      .then((response) => {
        setTasks(response);
      })
      .catch((error) => console.log(error));
  }, []);

  // Get date range based on view type
  const dateRange = useMemo(() => {
    if (viewType === "week") {
      return getWeekRange(currentDate);
    } else {
      return getMonthRange(currentDate);
    }
  }, [viewType, currentDate]);

  // Filter tasks by date range (based on due_date)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return isDateInRange(task.due_date, dateRange.start, dateRange.end);
    });
  }, [tasks, dateRange]);

  // Navigate to previous week/month
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next week/month
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Handle view type change
  const handleViewTypeChange = (type) => {
    setViewType(type);
    setCurrentDate(new Date()); // Reset to current date when changing view
  };

  // Handle task actions
  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prev) => prev.filter((task) => task.task_id !== deletedTaskId));
    if (selectedTask?.task_id === deletedTaskId) {
      setSelectedTask(null);
    }
  };

  const handleTaskEdited = (editedTaskData) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === editedTaskData.task_id ? editedTaskData : task
      )
    );
    // Update selected task if it was edited
    if (selectedTask?.task_id === editedTaskData.task_id) {
      setSelectedTask(editedTaskData);
    }
  };

  // Handle task status change
  const handleTaskStatusChange = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.task_id === updatedTask.task_id ? updatedTask : t))
    );
    // Update selected task if it was updated
    if (selectedTask?.task_id === updatedTask.task_id) {
      setSelectedTask(updatedTask);
    }
  };

  // Handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  // Handle add task
  const handleAddTask = () => {
    setShowAddTask(true);
  };

  // Handle task added successfully
  const handleTaskAdded = (responseData) => {
    // Response có thể là single task object hoặc object với tasks array
    // Luôn refresh từ API để đảm bảo sync (bao gồm cả recurring tasks)
    getTasksAPI()
      .then((response) => {
        setTasks(response);
      })
      .catch((error) => {
        console.error("Error refreshing tasks:", error);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header with View Toggle and Navigation */}
      <MyTasksHeader
        viewType={viewType}
        onViewTypeChange={handleViewTypeChange}
        currentDate={currentDate}
        dateRange={dateRange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onAddTask={handleAddTask}
      />

      {/* Tasks Display */}
      {viewType === "week" ? (
        <WeekView
          currentDate={currentDate}
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onTaskDelete={handleTaskDeleted}
          onTaskStatusChange={handleTaskStatusChange}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
            handleTaskEdited(updatedTask);
            setSelectedTask(updatedTask);
          }}
        />
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTask
          onClose={() => setShowAddTask(false)}
          onAddSuccess={handleTaskAdded}
        />
      )}
    </div>
  );
};
