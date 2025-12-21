// Helper function to get start and end of week (Monday to Sunday)
export const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Calculate difference to Monday (day 1, where Sunday is 0)
  const diff = day === 0 ? -6 : 1 - day;
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return { start: startOfWeek, end: endOfWeek };
};

// Helper function to get all 7 days of the week
export const getWeekDays = (date) => {
  const { start } = getWeekRange(date);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
};

// Helper function to check if date is on a specific day (ignoring time)
export const isSameDay = (dateString, dayDate) => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return (
      date.getDate() === dayDate.getDate() &&
      date.getMonth() === dayDate.getMonth() &&
      date.getFullYear() === dayDate.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

// Helper function to get start and end of month
export const getMonthRange = (date) => {
  const d = new Date(date);
  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  return { start: startOfMonth, end: endOfMonth };
};

// Helper function to check if date is within range
export const isDateInRange = (dateString, startDate, endDate) => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return date >= startDate && date <= endDate;
  } catch (error) {
    return false;
  }
};

// Helper function to format date range
export const formatDateRange = (start, end, type) => {
  if (type === "week") {
    const startStr = start.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    const endStr = end.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  } else {
    return start.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
};

// Helper function to get all days for calendar month view
export const getMonthDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  const days = [];
  
  // Add empty cells for days before month starts (from previous month)
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(prevYear, prevMonth, daysInPrevMonth - i);
    days.push({ date: day, isCurrentMonth: false });
  }
  
  // Add all days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    days.push({ date: dayDate, isCurrentMonth: true });
  }
  
  // Add empty cells for days after month ends (to fill calendar grid)
  const remainingCells = 42 - days.length; // 6 rows * 7 days = 42 cells
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dayDate = new Date(nextYear, nextMonth, day);
    days.push({ date: dayDate, isCurrentMonth: false });
  }
  
  return days;
};

