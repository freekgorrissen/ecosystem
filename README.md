# EcoSystem

EcoSystem is a React + Vite application that provides seamless Google authentication and Google Calendar integration with a modern Material UI interface. Users can:

- Log in securely with their Google account (OAuth2, no password required)
- Stay logged in with automatic access token refresh
- View their Google profile information
- See a list of all their Google Calendars (excluding "Forecast", "Weather", and "Tasks" calendars)
- Display all events for today from all their calendars, with clear formatting for all-day and timed events
- Get special banners for important events (e.g., "Blaf en Blij gesloten", "Maya kinderdagverblijf")
- View all events from all calendars in a graphical calendar view (FullCalendar)
- Enjoy a responsive, Material UI-based design

---

# Future 

The next step for development is commute times. It will add a page where the users can see commute times for themselves and their partner, commuting by car (using the Google Maps API) and public transport (through the NS API). For this, the client will call an ecosystem API, which hosts the API keys and proxies the NS and GMaps APIs

I will store the work and home locations in the backend environment variables, so I don't have to deal with a database. The app is only intended for me and my family.
