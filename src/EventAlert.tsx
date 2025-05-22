import Alert from "@mui/material/Alert";
import type { CalendarEvent } from "./Calendar";
import type { AlertColor } from "@mui/material/Alert";

interface EventAlertProps {
  events: CalendarEvent[];
  keyword: string;
  severity: AlertColor;
  children: React.ReactNode;
}

function isEventToday(events: CalendarEvent[], keyword: string): boolean {
  const today = new Date();
  return events.some((event) => {
    if (!event.summary || typeof event.summary !== "string") return false;
    if (!event.start) return false;
    if (!event.summary.includes(keyword)) return false;
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (event.start.date) {
      startDate = new Date(event.start.date);
      endDate = event.end?.date ? new Date(event.end.date) : startDate;
      if (event.end?.date) endDate.setDate(endDate.getDate() - 1);
    } else if (event.start.dateTime) {
      startDate = new Date(event.start.dateTime);
      endDate = event.end?.dateTime ? new Date(event.end.dateTime) : startDate;
    }
    if (startDate && endDate) {
      const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
      const t0 = new Date(y, m, d);
      const t1 = new Date(y, m, d + 1);
      return startDate < t1 && endDate >= t0;
    }
    return false;
  });
}

const EventAlert = ({ events, keyword, severity, children }: EventAlertProps) => {
  if (!isEventToday(events, keyword)) return null;
  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {children}
    </Alert>
  );
};

export default EventAlert;
