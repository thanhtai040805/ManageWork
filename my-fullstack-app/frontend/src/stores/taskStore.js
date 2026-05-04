import { create } from 'zustand';

export const useTaskStore = create((set, get) => ({
  projectTasks: {},
  userTasks: [],
  
  setProjectTasks: (projectId, tasks) => set((state) => ({
    projectTasks: {
      ...state.projectTasks,
      [projectId]: tasks,
    },
  })),
  
  getProjectTasks: (projectId) => get().projectTasks[projectId] || [],
  
  setUserTasks: (tasks) => set({ userTasks: tasks }),
  
  getUserTasks: () => get().userTasks,
  
  updateTask: (taskId, updates) => set((state) => {
    const updatedProjectTasks = {};
    Object.keys(state.projectTasks).forEach((projectId) => {
      const tasks = state.projectTasks[projectId];
      if (Array.isArray(tasks)) {
        updatedProjectTasks[projectId] = tasks.map((task) =>
          task.task_id === taskId ? { ...task, ...updates } : task
        );
      } else {
        updatedProjectTasks[projectId] = tasks;
      }
    });
    
    return {
      projectTasks: updatedProjectTasks,
      userTasks: Array.isArray(state.userTasks) 
        ? state.userTasks.map((task) =>
            task.task_id === taskId ? { ...task, ...updates } : task
          )
        : state.userTasks,
    };
  }),
  
  addTask: (task) => set((state) => {
    if (!task.project_id) return state;
    const projectTasks = { ...state.projectTasks };
    if (projectTasks[task.project_id]) {
      projectTasks[task.project_id] = [task, ...projectTasks[task.project_id]];
    }
    
    return {
      projectTasks,
      userTasks: [task, ...state.userTasks],
    };
  }),
  
  removeTask: (taskId, projectId) => set((state) => {
    const updatedProjectTasks = { ...state.projectTasks };
    if (projectId && updatedProjectTasks[projectId]) {
      updatedProjectTasks[projectId] = updatedProjectTasks[projectId].filter(
        (task) => task.task_id !== taskId
      );
    }
    
    return {
      projectTasks: updatedProjectTasks,
      userTasks: state.userTasks.filter((task) => task.task_id !== taskId),
    };
  }),
  
  clearProjectTasks: (projectId) => set((state) => {
    const updatedProjectTasks = { ...state.projectTasks };
    delete updatedProjectTasks[projectId];
    return { projectTasks: updatedProjectTasks };
  }),
  
  clearUserTasks: () => set({ userTasks: [] }),
}));

export default useTaskStore;