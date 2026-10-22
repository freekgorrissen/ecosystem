export interface CalendarAlert {
  keyword: string;
  severity: "warning" | "info" | "success";
  message: string;
}

const calendarAlerts: CalendarAlert[] = [
  {
    keyword: "Blaf en Blij gesloten",
    severity: "warning",
    message: "Blaf en Blij is vandaag gesloten"
  },
  {
    keyword: "Birthday",
    severity: "success",
    message: "🥳 Er is vandaag een jarige! 🥳"
  }
];

export default calendarAlerts; 