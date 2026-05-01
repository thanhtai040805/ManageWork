import React from "react";

export const RecurrenceSection = ({
  form,
  setForm,
  handleOnChange,
  toggleRepeatDay,
  getMaxRepeatUntilDate,
  calculateTaskCount,
  isSameDayString,
}) => {
  return (
    <div className="grid gap-4">
      {/* Repeat Toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="enable_repeat"
          checked={form.repeat_type !== "none"}
          onChange={(e) => {
            setForm((prev) => ({
              ...prev,
              repeat_type: e.target.checked ? "weekly" : "none",
              repeat_days:
                e.target.checked && prev.repeat_type === "custom"
                  ? prev.repeat_days
                  : [],
              repeat_until: e.target.checked ? prev.repeat_until : "",
            }));
          }}
          className="h-4 w-4 accent-indigo-500"
        />
        <label
          htmlFor="enable_repeat"
          className="text-sm font-medium text-slate-600"
        >
          Repeat this task
        </label>
      </div>

      {/* Repeat Options */}
      {form.repeat_type !== "none" && (
        <div className="grid gap-4 pl-7 border-l-2 border-indigo-200">
          {/* Repeat Type Selection */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-600">
              Repeat frequency
            </label>
            <select
              name="repeat_type"
              value={form.repeat_type}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  repeat_type: e.target.value,
                  repeat_days:
                    e.target.value === "custom" ? prev.repeat_days : [],
                }));
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="weekly">Weekly (same weekday)</option>
              <option value="custom">Custom (select weekdays)</option>
            </select>
          </div>

          {/* Custom Day Selection */}
          {form.repeat_type === "custom" && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-600">
                Select weekdays
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 0, label: "Sun" },
                  { value: 1, label: "Mon" },
                  { value: 2, label: "Tue" },
                  { value: 3, label: "Wed" },
                  { value: 4, label: "Thu" },
                  { value: 5, label: "Fri" },
                  { value: 6, label: "Sat" },
                ].map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleRepeatDay(day.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      form.repeat_days?.includes(day.value)
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {form.repeat_days?.length === 0 && (
                <p className="text-xs text-rose-500">
                  Please select at least one weekday
                </p>
              )}
            </div>
          )}

          {/* Repeat Until Date */}
          <div className="grid gap-2">
            <label
              htmlFor="repeat_until"
              className="text-sm font-medium text-slate-600"
            >
              Repeat until <span className="text-rose-500">*</span>
            </label>
            <input
              id="repeat_until"
              type="date"
              name="repeat_until"
              value={form.repeat_until}
              onChange={handleOnChange}
              min={form.due_date ? form.due_date.split("T")[0] : ""}
              max={getMaxRepeatUntilDate()}
              required={form.repeat_type !== "none"}
              className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-xs text-slate-500">
              Tasks will be created from the due date until the end date
              (maximum 12 weeks, up to 100 tasks)
            </p>
            {form.repeat_until && form.due_date && (
              <p className="text-xs text-slate-400">
                Duration:{" "}
                {Math.ceil(
                  (new Date(form.repeat_until + "T23:59:59") -
                    new Date(form.due_date)) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </p>
            )}
          </div>

          {/* Preview number of tasks */}
          {form.repeat_type !== "none" &&
            form.repeat_until &&
            form.due_date &&
            isSameDayString(form.start_date, form.due_date) && (
              <div
                className={`p-3 rounded-lg border ${
                  calculateTaskCount() > 100
                    ? "bg-rose-50 border-rose-200"
                    : "bg-indigo-50 border-indigo-200"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    calculateTaskCount() > 100
                      ? "text-rose-900"
                      : "text-indigo-900"
                  }`}
                >
                  Approximately {calculateTaskCount()} tasks will be created
                  {calculateTaskCount() > 100 && (
                    <span className="block text-xs text-rose-600 mt-1">
                      ⚠️ Exceeds the limit of 100 tasks. Please choose a
                      shorter time range.
                    </span>
                  )}
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
