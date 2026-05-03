import { useState, useEffect } from "react";
import { Copy, Plus, Trash2, Folder, X } from "lucide-react";
import { templateService } from "../../services/template.service";
import { confirm } from "../../components/common/ConfirmModal";

export const TemplateSettings = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "", category: "" });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templateService.getTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const template = await templateService.createTemplate(newTemplate);
      setTemplates([...templates, template]);
      setShowCreate(false);
      setNewTemplate({ name: "", description: "", category: "" });
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleDelete = async (templateId) => {
    const ok = await confirm({
      title: "Delete Template",
      message: "Delete this template?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    
    try {
      await templateService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.template_id !== templateId));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const defaultTemplates = [
    { name: "Kanban Board", description: "Simple kanban workflow", category: "Workflow" },
    { name: "Product Launch", description: "Launch product to market", category: "Marketing" },
    { name: "Sprint Planning", description: "Agile sprint board", category: "Development" }
  ];

  const createDefault = async (tpl) => {
    try {
      const template = await templateService.createTemplate(tpl);
      setTemplates([...templates, template]);
    } catch (error) {
      console.error("Error creating default template:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Templates</h1>
          <p className="text-sm text-slate-500">Project & task templates for quick start</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus size={18} />
          Add Template
        </button>
      </div>

      {/* Quick Start Templates */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultTemplates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => createDefault(tpl)}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{tpl.name}</p>
                  <p className="text-xs text-slate-500">{tpl.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* My Templates */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">My Templates</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Loading...</div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No templates yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.template_id}
                className="p-4 rounded-xl border border-slate-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{tpl.name}</p>
                    <p className="text-sm text-slate-500">{tpl.description}</p>
                    {tpl.category && (
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded mt-2 inline-block">
                        {tpl.category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(tpl.template_id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Create Template</h2>
              <button onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    placeholder="e.g., Marketing, Development, HR"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
              >
                Create Template
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};