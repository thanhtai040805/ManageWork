import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Clock3, AlertCircle } from "lucide-react";
import { updateTaskStatusAPI, reorderTasksAPI } from "../../services/task.service";
import { getPriorityBadge, getPriorityLabel } from "../../utils/taskColors";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const KANBAN_COLUMNS = [
  { id: "todo", label: "To Do", color: "bg-rose-500" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "review", label: "Review", color: "bg-amber-500" },
  { id: "on_hold", label: "On Hold", color: "bg-slate-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
];

const normalizeTasks = (tasks) => {
  const result = {
    tasks: {},
    columns: {},
    taskToColumn: {},
  };

  KANBAN_COLUMNS.forEach((col) => {
    result.columns[col.id] = [];
  });

  tasks.forEach((task) => {
    result.tasks[task.task_id] = task;
    const col = task.status || "todo";
    const targetCol = result.columns[col] ? col : "todo";
    result.columns[targetCol].push(task.task_id);
    result.taskToColumn[task.task_id] = targetCol;
  });

  Object.keys(result.columns).forEach((colId) => {
    result.columns[colId].sort((a, b) => {
      const taskA = result.tasks[a];
      const taskB = result.tasks[b];
      return (taskA?.order_index || 0) - (taskB?.order_index || 0);
    });
  });

  return result;
};

const TaskCard = React.memo(function TaskCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.task_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onClick(task)}>
        <h4 className="text-sm font-semibold text-slate-900 truncate">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityBadge(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          {isOverdue && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white flex items-center gap-1">
              <AlertCircle size={10} /> Overdue
            </span>
          )}
        </div>
        {task.due_date && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${isOverdue ? "text-red-500" : "text-slate-400"}`}>
            <Clock3 size={12} />
            {formatDate(task.due_date)}
          </div>
        )}
      </div>
    </div>
  );
});

function KanBanColumn({ id, label, color, taskIds, tasks, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "column" } });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] flex flex-col rounded-xl bg-slate-50 border ${
        isOver ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 p-3 border-b border-slate-200">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs text-slate-400 ml-auto">{taskIds.length}</span>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {taskIds.map((taskId) => (
            <TaskCard key={taskId} task={tasks[taskId]} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {taskIds.length === 0 && (
          <div className="text-center text-xs text-slate-400 py-4">No tasks</div>
        )}
      </div>
    </div>
  );
}

export const KanBanView = ({ tasks, onTaskClick, onTaskStatusChange, onTaskDelete }) => {
  const [activeId, setActiveId] = useState(null);
  const [board, setBoard] = useState({ tasks: {}, columns: {} });
  const [initialLoad, setInitialLoad] = useState(true);
  const [localUpdate, setLocalUpdate] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!localUpdate) {
      const normalized = normalizeTasks(tasks);
      setBoard(normalized);
    }
    setInitialLoad(false);
  }, [tasks, localUpdate]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const calculateNewOrderIndex = useCallback((columnTasks, toIndex) => {
    const prev = toIndex > 0 ? columnTasks[toIndex - 1] : null;
    const next = toIndex < columnTasks.length ? columnTasks[toIndex] : null;

    const prevOrder = prev?.order_index ?? 0;
    const nextOrder = next?.order_index ?? prevOrder + 1000;

    return (prevOrder + nextOrder) / 2;
  }, []);

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const sourceColId = board.taskToColumn[active.id];
    if (!sourceColId) return;

    let destColId;
    if (over.data?.current?.type === "column") {
      destColId = over.id;
    } else {
      destColId = board.taskToColumn[over.id] || sourceColId;
    }

    if (!destColId) return;

    const sourceCol = [...board.columns[sourceColId]];
    const destCol = sourceColId === destColId ? sourceCol : [...board.columns[destColId]];

    const fromIndex = sourceCol.indexOf(active.id);
    const overIndex = destColId === sourceColId 
      ? sourceCol.indexOf(over.id)
      : destCol.indexOf(over.id);

    if (fromIndex === -1) return;

    const toIndex = overIndex === -1 ? destCol.length : overIndex;

    const prevBoard = {
      tasks: { ...board.tasks },
      columns: Object.fromEntries(
        Object.entries(board.columns).map(([k, v]) => [k, [...v]])
      ),
      taskToColumn: { ...board.taskToColumn },
    };

    let newBoard;
    let apiCall = null;

    if (sourceColId === destColId) {
      const newTaskIds = arrayMove(sourceCol, fromIndex, toIndex);
      
      const updatedTasks = { ...board.tasks };
      newTaskIds.forEach((taskId, idx) => {
        updatedTasks[taskId] = {
          ...updatedTasks[taskId],
          order_index: (idx + 1) * 1000,
        };
      });

      newBoard = {
        ...board,
        tasks: updatedTasks,
        columns: {
          ...board.columns,
          [sourceColId]: newTaskIds,
        },
      };
      setBoard(newBoard);
      setLocalUpdate(true);
      setTick(v => v + 1);

      const orderData = newTaskIds.map((taskId, idx) => ({
        taskId: taskId,
        orderIndex: (idx + 1) * 1000,
      }));
      apiCall = reorderTasksAPI(orderData);
    } else {
      const [movedTaskId] = sourceCol.splice(fromIndex, 1);
      destCol.splice(toIndex, 0, movedTaskId);

      const destTasks = destCol.map(id => board.tasks[id]);
      const newOrderIndex = calculateNewOrderIndex(destTasks, toIndex);

      newBoard = {
        ...board,
        tasks: {
          ...board.tasks,
          [movedTaskId]: {
            ...board.tasks[movedTaskId],
            status: destColId,
            order_index: newOrderIndex,
          },
        },
        columns: {
          ...board.columns,
          [sourceColId]: sourceCol,
          [destColId]: destCol,
        },
        taskToColumn: {
          ...board.taskToColumn,
          [movedTaskId]: destColId,
        },
      };
      setBoard(newBoard);
      setLocalUpdate(true);
      setTick(v => v + 1);

      apiCall = updateTaskStatusAPI(movedTaskId, destColId, sourceColId);
    }

    if (apiCall) {
      try {
        await apiCall;
        onTaskStatusChange?.(active.id, destColId);
      } catch (error) {
        console.error("Error:", error);
        setBoard(prevBoard);
      }
    }
  }, [board, calculateNewOrderIndex, onTaskStatusChange]);

  const activeTask = activeId ? board.tasks[activeId] : null;

  if (initialLoad) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 sm:gap-3 w-full min-h-[calc(100vh-280px)]">
        {KANBAN_COLUMNS.map((col) => (
          <KanBanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            color={col.color}
            taskIds={board.columns[col.id] || []}
            tasks={board.tasks}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="w-[250px] rounded-xl border border-indigo-500 bg-white p-3 shadow-xl opacity-90">
            <h4 className="text-sm font-semibold text-slate-900">{activeTask.title}</h4>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};