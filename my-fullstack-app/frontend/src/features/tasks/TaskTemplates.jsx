import React, { useState, useEffect } from "react";
import { Save, X, Trash2 } from "lucide-react";
import apiClient from "../../services/apiClient";
import { confirm } from "../../components/common/ConfirmModal";

const TEMPLATES_KEY = "task_templates";

export function TaskTemplates({ onApplyTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const saved = localStorage.getItem(TEMPLATES_KEY);
      if (saved) {
        setTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const saveTemplates = (newTemplates) => {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error("Error saving templates:", error);
    }
  };

  const saveAsTemplate = (template) => {
    const newTemplates = [...templates, { 
      ...template, 
      id: Date.now(), 
      createdAt: new Date().toISOString() 
    }];
    saveTemplates(newTemplates);
    setShowForm(false);
    setEditingTemplate(null);
  };

  const deleteTemplate = async (id) => {
    const ok = await confirm({
      title: "Delete Template",
      message: "Delete this template?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    
    const newTemplates = templates.filter(t => t.id !== id);
    saveTemplates(newTemplates);
  };

  const applyTemplate = (template) => {
    onApplyTemplate?.(template);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-600">Templates</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600"
        >
          <Save size={14} />
          Save current
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-slate-400">No templates saved</p>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition"
            >
              <div className="flex-1" onClick={() => applyTemplate(template)}>
                <div className="text-sm font-medium text-slate-700">{template.title}</div>
                {template.description && (
                  <div className="text-xs text-slate-500 line-clamp-1">{template.description}</div>
                )}
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${template.priority === 'high' ? 'bg-rose-100 text-rose-600' : template.priority === 'medium' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {template.priority}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteTemplate(template.id)}
                className="p-1 text-slate-400 hover:text-rose-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Save as Template</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Save the current task form as a template to reuse later.
            </p>
            <button
              onClick={() => saveAsTemplate({
                title: "New task from template",
                description: "",
                priority: "medium",
                status: "todo"
              })}
              className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Save Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}