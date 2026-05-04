import { useEffect, useRef } from "react";
import { useSocket } from "../../../context/socketContext";
import { useTaskStore } from "../../../stores/taskStore";

export const useTaskRealtime = ({ 
  projectId, 
  userId,
  onTaskUpdated, 
  onTaskReordered,
}) => {
  const socket = useSocket();
  const updateTask = useTaskStore((state) => state.updateTask);
  const addTask = useTaskStore((state) => state.addTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const callbacksRef = useRef({ onTaskUpdated, onTaskReordered });

  callbacksRef.current = { onTaskUpdated, onTaskReordered };

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdated = (data) => {
      if (data.status === 'deleted') {
        removeTask(data.taskId, data.projectId);
      } else {
        updateTask(data.taskId, {
          status: data.status,
          updatedAt: data.updatedAt,
        });
      }
      
      if (callbacksRef.current.onTaskUpdated) {
        callbacksRef.current.onTaskUpdated(data);
      }
    };

    const handleTaskReordered = (data) => {
      if (callbacksRef.current.onTaskReordered) {
        callbacksRef.current.onTaskReordered(data);
      }
    };

    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:reordered", handleTaskReordered);

    return () => {
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:reordered", handleTaskReordered);
    };
  }, [socket, updateTask, addTask, removeTask]);

  return { socket };
};

export default useTaskRealtime;