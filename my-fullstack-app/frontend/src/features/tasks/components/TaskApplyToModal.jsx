export const TaskApplyToModal = ({
  show,
  isSaving,
  applyToOption,
  setApplyToOption,
  onCancel,
  onSave,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Apply changes to
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          This task is part of a recurring series. How would you like to apply
          these changes?
        </p>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
            <input
              type="radio"
              name="applyTo"
              value="this"
              checked={applyToOption === "this"}
              onChange={(e) => setApplyToOption(e.target.value)}
              className="h-4 w-4 accent-indigo-500"
            />
            <div>
              <div className="font-medium text-slate-900">This task only</div>
              <div className="text-xs text-slate-500">
                Only update this specific task
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
            <input
              type="radio"
              name="applyTo"
              value="future"
              checked={applyToOption === "future"}
              onChange={(e) => setApplyToOption(e.target.value)}
              className="h-4 w-4 accent-indigo-500"
            />
            <div>
              <div className="font-medium text-slate-900">
                This and future tasks
              </div>
              <div className="text-xs text-slate-500">
                Update this task and all future tasks in the series
              </div>
            </div>
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(applyToOption)}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
};
