import { X } from "lucide-react";

export const TaskDetailHeader = ({
  formData,
  isEditing,
  isSaving,
  onClose,
  handleFieldChange,
  handleFieldBlur,
  handleFieldFocus,
  setIsEditing,
  task,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        {isEditing.title ? (
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            onBlur={() => handleFieldBlur("title")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.target.blur();
              }
              if (e.key === "Escape") {
                handleFieldChange("title", task?.title || "");
                setIsEditing((prev) => ({ ...prev, title: false }));
              }
            }}
            className="text-xl font-semibold text-slate-900 w-full border-2 border-indigo-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            autoFocus
          />
        ) : (
          <h2
            className="text-xl font-semibold text-slate-900 cursor-text hover:bg-slate-50 rounded px-2 py-1 -mx-2 transition truncate"
            onClick={() => handleFieldFocus("title")}
            title={formData.title || "Untitled Task"}
          >
            {formData.title || "Untitled Task"}
          </h2>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {isSaving && (
          <span className="text-xs text-slate-500">Saving...</span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};