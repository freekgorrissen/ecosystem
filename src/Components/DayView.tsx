import FullCalendar from "@fullcalendar/react";
import listPlugin from "@fullcalendar/list";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import type { CalendarEvent, EventClickInfo } from "./Calendars";

interface DayViewProps {
  events: CalendarEvent[];
  onEventClick: (info: EventClickInfo) => void;
}

const DayView = ({ events, onEventClick }: DayViewProps) => (
  <FullCalendar
    plugins={[listPlugin, googleCalendarPlugin, bootstrap5Plugin]}
    eventTimeFormat={{
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }}
    initialView="listDay"
    headerToolbar={false}
    themeSystem="bootstrap5"
    events={events.map((ev) => ({
      id: ev.id,
      title: ev.summary,
      start: ev.start?.dateTime ?? ev.start?.date ?? "",
      end: ev.end?.dateTime ?? ev.end?.date ?? undefined,
      allDay: !!ev.start?.date && !ev.start?.dateTime,
      backgroundColor: ev.color,
    }))}
    height="auto"
    eventClick={onEventClick}
  />
);

export default DayView;
