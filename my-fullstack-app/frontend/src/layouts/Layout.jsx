// src/layouts/Layout.jsx
import { useState } from "react";
import { Header } from "../components/common";
import { VerticalNav } from "../components/navigation";
import { Outlet } from "react-router-dom";
import { TaskDetail } from "../features/tasks";

export const Layout = () => {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        onTaskSelect={setSelectedTask}
      />
      <div className="flex flex-1">
        <VerticalNav />
        <main className="flex-1 bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => setSelectedTask(null)}
        />
      )}
    </div>
  );
};
