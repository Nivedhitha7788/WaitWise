function parseAppointmentDate(dateInput) {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) {
    const d = new Date(dateInput);
    d.setHours(12, 0, 0, 0);
    return d;
  }
  if (typeof dateInput === 'string' && dateInput.includes('-')) {
    const parts = dateInput.split('T')[0].split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
  }
  const d = new Date(dateInput);
  d.setHours(12, 0, 0, 0);
  return d;
}

function getDayRange(dateInput) {
  const mid = parseAppointmentDate(dateInput);
  const start = new Date(mid);
  start.setHours(0, 0, 0, 0);
  const end = new Date(mid);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getDayName(dateInput) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = parseAppointmentDate(dateInput);
  return days[d.getDay()];
}

module.exports = { parseAppointmentDate, getDayRange, getDayName };

