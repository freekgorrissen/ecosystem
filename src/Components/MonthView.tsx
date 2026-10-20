import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import type { CalendarEvent, EventClickInfo } from "./Calendars";

interface MonthViewProps {
  events: CalendarEvent[];
  onEventClick: (info: EventClickInfo) => void;
}

const MonthView = ({ events, onEventClick }: MonthViewProps) => (
  <FullCalendar
    plugins={[dayGridPlugin, bootstrap5Plugin]}
    eventTimeFormat={{
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }}
    initialView="dayGridMonth"
    headerToolbar={{
      left: "title prev,next today",
      right: "",
    }}
    themeSystem="bootstrap5"
    events={events.map((ev) => ({
      id: ev.id,
      title: ev.summary,
      start: ev.start?.dateTime ?? ev.start?.date ?? "",
      end: ev.end?.dateTime ?? ev.end?.date ?? undefined,
      allDay: !!ev.start?.date && !ev.start?.dateTime,
      backgroundColor: ev.color,
      calendarName: ev.calendarName,
    }))}
    height="auto"
    eventClick={onEventClick}
  />
);

export default MonthView;
