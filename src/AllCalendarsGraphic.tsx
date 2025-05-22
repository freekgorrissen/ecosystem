import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import Alert from "@mui/material/Alert";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

interface CalendarList {
  id: string;
  summary: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end?: string;
  allDay?: boolean;
  calendarId?: string;
}

interface AllCalendarsGraphicProps {
  accessToken: string;
}

const AllCalendarsGraphic: React.FC<AllCalendarsGraphicProps> = ({ accessToken }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    // Fetch all calendars
    fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch calendars");
        return res.json();
      })
      .then(async (data) => {
        // Exclude calendars where the name includes "Forecast", "Weather", or "Tasks"
        const calendars: CalendarList[] = (data.items || []).filter(
          (cal: CalendarList) =>
            !cal.summary?.includes("Forecast") &&
            !cal.summary?.includes("Weather") &&
            !cal.summary?.includes("Tasks")
        );
        // Fetch events for each calendar
        const allEvents: CalendarEvent[] = [];
        await Promise.all(
          calendars.map(async (cal) => {
            // Calculate the first day of the current month in ISO format
            const now = new Date();
            const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const timeMin = firstOfMonth.toISOString();
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}`;
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) return;
            const eventData = await res.json();
            (eventData.items || []).forEach((ev: {
              id: string;
              summary: string;
              start?: { dateTime?: string; date?: string };
              end?: { dateTime?: string; date?: string };
            }) => {
              allEvents.push({
                id: ev.id,
                summary: ev.summary,
                start: ev.start?.dateTime ?? ev.start?.date ?? '',
                end: ev.end?.dateTime ?? ev.end?.date ?? undefined,
                allDay: !!ev.start?.date && !ev.start?.dateTime,
                calendarId: cal.id,
              });
            });
          })
        );
        setEvents(allEvents);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (!accessToken) return null;
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error}</Alert>;

  return (
    <Box>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events.map(ev => ({
          id: ev.id,
          title: ev.summary,
          start: ev.start,
          end: ev.end,
          allDay: ev.allDay,
        }))}
        height="auto"
      />
    </Box>
  );
};

export default AllCalendarsGraphic;
