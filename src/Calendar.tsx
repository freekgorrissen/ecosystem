import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import EventAlert from "./EventAlert";
import AllCalendarsGraphic from "./AllCalendarsGraphic";

interface CalendarList {
  id: string;
  summary: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

interface CalendarProps {
  accessToken: string;
}

const ECOSYSTEM_CALENDAR_ID = import.meta.env.VITE_CALENDAR_ECOSYSTEM_ID;

const Calendar: React.FC<CalendarProps> = ({ accessToken }) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          (cal: CalendarList) => !/forecast|weather|tasks/i.test(cal.summary)
        );
        setHasAccess(calendars.some((cal) => cal.id === ECOSYSTEM_CALENDAR_ID));
        // Fetch today's events from all included calendars
        const today = new Date();
        const y = today.getFullYear(),
          m = today.getMonth(),
          d = today.getDate();
        const t0 = new Date(y, m, d).toISOString();
        const t1 = new Date(y, m, d + 1).toISOString();
        const allEvents: CalendarEvent[] = [];
        await Promise.all(
          calendars.map(async (cal) => {
            try {
              const res = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
                  cal.id
                )}/events?maxResults=20&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(
                  t0
                )}&timeMax=${encodeURIComponent(t1)}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );
              if (!res.ok) return;
              const data = await res.json();
              if (data.items) allEvents.push(...data.items);
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

  if (!accessToken) return null;
  if (loading) return <Typography>Loading calendars...</Typography>;
  if (error) return <Alert severity="error">Error: {error}</Alert>;
  if (hasAccess === false)
    return (
      <Alert severity="warning">
        You do not have access to the EcoSystem calendar.
      </Alert>
    );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Events today
      </Typography>

      <EventAlert
        events={events}
        keyword="Blaf en Blij gesloten"
        severity="error"
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
      <List>
        {events
          .filter((event) => {
            // Only show events for today
            const today = new Date();
            let startDate: Date | null = null;
            let endDate: Date | null = null;
            if (event.start?.date) {
              startDate = new Date(event.start.date);
              endDate = event.end?.date ? new Date(event.end.date) : startDate;
              if (event.end?.date) endDate.setDate(endDate.getDate() - 1);
            } else if (event.start?.dateTime) {
              startDate = new Date(event.start.dateTime);
              endDate = event.end?.dateTime
                ? new Date(event.end.dateTime)
                : startDate;
            }
            if (startDate && endDate) {
              const y = today.getFullYear(),
                m = today.getMonth(),
                d = today.getDate();
              const t0 = new Date(y, m, d);
              const t1 = new Date(y, m, d + 1);
              return startDate < t1 && endDate >= t0;
            }
            return false;
          })
          .map((event) => {
            const isAllDay = !!event.start?.date && !event.start?.dateTime;
            let secondary = "";
            if (isAllDay && event.start?.date && event.end?.date) {
              const startDate = new Date(event.start.date);
              const endDate = new Date(event.end.date);
              endDate.setDate(endDate.getDate() - 1);
              const showEnd = startDate.getTime() !== endDate.getTime();
              secondary = event.start.date;
              if (showEnd) {
                secondary += ` — ${endDate.toISOString().slice(0, 10)}`;
              }
            } else if (event.start?.dateTime && event.end?.dateTime) {
              const startDate = new Date(event.start.dateTime);
              const endDate = new Date(event.end.dateTime);
              const showEndDate =
                startDate.toDateString() !== endDate.toDateString();
              secondary = new Date(event.start.dateTime).toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
              if (showEndDate) {
                secondary += ` - ${endDate.toLocaleString()}`;
              } else {
                secondary += ` - ${endDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;
              }
            } else if (event.start?.dateTime) {
              secondary = new Date(event.start.dateTime).toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
            } else if (isAllDay && event.start?.date) {
              secondary = event.start.date;
            }
            return (
              <ListItem key={event.id} divider>
                <ListItemText
                  primary={event.summary}
                  secondary={secondary}
                  slotProps={{ secondary: { style: { color: "#fff" } } }}
                />
              </ListItem>
            );
          })}
      </List>
      <AllCalendarsGraphic accessToken={accessToken} />
    </Box>
  );
};

export default Calendar;
