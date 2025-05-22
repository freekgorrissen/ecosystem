import { useEffect, useState } from "react";
import { Box, Alert, CircularProgress, Tooltip } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import 'bootstrap/dist/css/bootstrap.css';
import '~bootstrap-icons/font/bootstrap-icons.css';
import EventAlert from "./EventAlert";

interface CalendarList {
  id: string;
  summary: string;
  backgroundColor: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  color: string;
  calendarName: string;
}

interface CalendarsProps {
  accessToken: string;
}

const ECOSYSTEM_CALENDAR_ID = import.meta.env.VITE_CALENDAR_ECOSYSTEM_ID;

interface EventClickInfo {
  event: {
    id: string;
  };
  jsEvent: MouseEvent;
}

const Calendars: React.FC<CalendarsProps> = ({ accessToken }) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    // Fetch all user calendars
    fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch calendars");
        return res.json();
      })
      .then(async (data) => {
        // Exclude calendars with names containing Forecast, Weather, or Tasks
        const calendars: CalendarList[] = (data.items || []).filter(
          (cal: CalendarList) => !/forecast|weather|tasks|project/i.test(cal.summary)
        );
        setHasAccess(calendars.some((cal) => cal.id === ECOSYSTEM_CALENDAR_ID));
        
        // Fetch events from all included calendars
        const now = new Date();
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        const allEvents: CalendarEvent[] = [];
        
        await Promise.all(
          calendars.map(async (cal) => {
            try {
              const res = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
                  cal.id
                )}/events?&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(
                  startOfPrevMonth.toISOString()
                )}&timeMax=${encodeURIComponent(endOfNextMonth.toISOString())}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );
              if (!res.ok) return;
              const data = await res.json();
              if (data.items) allEvents.push(...data.items.map((item: CalendarEvent) => ({...item, color: cal.backgroundColor, calendarName: cal.summary})));
            } catch {
              // Ignore errors for individual calendars
            }
          })
        );
        setEvents(allEvents);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [accessToken]);

  const formatEventTime = (event: CalendarEvent) => {
    const formatTime = (dateStr?: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const isAllDay = !!event.start?.date && !event.start?.dateTime;
    const startDate = event.start?.dateTime || event.start?.date;
    const endDate = event.end?.dateTime || event.end?.date;

    if (!startDate) return '';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    
    // For all-day events, subtract one day from end date as Google Calendar end dates are exclusive
    if (isAllDay) {
      end.setDate(end.getDate() - 1);
    }

    const isSameDay = start.toDateString() === end.toDateString();

    if (isAllDay) {
      if (isSameDay) {
        return formatDate(startDate);
      } else {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
    } else {
      if (isSameDay) {
        return `${formatTime(startDate)} - ${formatTime(endDate)}`;
      } else {
        return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`;
      }
    }
  };

  const handleEventClick = (info: EventClickInfo) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setTooltipPosition({
        x: info.jsEvent.clientX,
        y: info.jsEvent.clientY
      });
    }
  };

  const handleTooltipClose = () => {
    setSelectedEvent(null);
    setTooltipPosition(null);
  };

  if (!accessToken) return null;
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error}</Alert>;
  if (hasAccess === false)
    return (
      <Alert severity="warning">
        You do not have access to the Ecosystem calendar.
      </Alert>
    );

  return (
    <Box>
      <EventAlert
        events={events}
        keyword="Blaf en Blij gesloten"
        severity="warning"
      >
        Blaf en Blij is vandaag gesloten
      </EventAlert>
      <EventAlert
        events={events}
        keyword="Maya kinderdagverblijf"
        severity="info"
      >
        Maya gaat vandaag naar Onder de Boompjes 🌳
      </EventAlert>

      <EventAlert events={events} keyword="Birthday" severity="success">
        🥳 Er is vandaag een jarige! 🥳
      </EventAlert>

      <Box sx={{ mt: 4 }}>
        <FullCalendar
          plugins={[
            listPlugin,
            googleCalendarPlugin,
            bootstrap5Plugin
          ]}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          initialView="listDay"
          headerToolbar={false}
          themeSystem="bootstrap5"
          events={events.map(ev => ({
            id: ev.id,
            title: ev.summary,
            start: ev.start?.dateTime ?? ev.start?.date ?? '',
            end: ev.end?.dateTime ?? ev.end?.date ?? undefined,
            allDay: !!ev.start?.date && !ev.start?.dateTime,
            backgroundColor: ev.color,
          }))}
          height="auto"
          eventClick={handleEventClick}
        />

        <FullCalendar
          plugins={[
            dayGridPlugin,
            bootstrap5Plugin
          ]}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'title prev,next today',
            right: ''
          }}
          themeSystem="bootstrap5"
          events={events.map(ev => ({
            id: ev.id,
            title: ev.summary,
            start: ev.start?.dateTime ?? ev.start?.date ?? '',
            end: ev.end?.dateTime ?? ev.end?.date ?? undefined,
            allDay: !!ev.start?.date && !ev.start?.dateTime,
            backgroundColor: ev.color,
            calendarName: ev.calendarName
          }))}
          height="auto"
          eventClick={handleEventClick}
        />

        {selectedEvent && tooltipPosition && (
          <Tooltip
            open={!!selectedEvent}
            onClose={handleTooltipClose}
            title={
              <Box sx={{ p: 1 }}>
                <Box sx={{ fontWeight: 'bold', mb: 1 }}>{selectedEvent.summary}</Box>
                <Box>{selectedEvent.calendarName}</Box>
                <Box>{formatEventTime(selectedEvent)}</Box>
              </Box>
            }
            arrow
            PopperProps={{
              anchorEl: {
                getBoundingClientRect: () => ({
                  top: tooltipPosition.y,
                  left: tooltipPosition.x,
                  right: tooltipPosition.x,
                  bottom: tooltipPosition.y,
                  width: 0,
                  height: 0,
                  x: tooltipPosition.x,
                  y: tooltipPosition.y,
                  toJSON: () => ({})
                })
              }
            }}
          >
            <Box />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default Calendars; 