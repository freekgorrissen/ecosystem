import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  Tooltip,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import type { Page } from "../usePage";

export const SIDEBAR_WIDTH = 64;

const items: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: "calendar", label: "Calendar", icon: <CalendarIcon /> },
  { page: "commute", label: "Commute", icon: <MapIcon /> },
];

interface SidebarProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar = ({ page, onNavigate }: SidebarProps) => (
  <Drawer
    variant="permanent"
    sx={{
      width: SIDEBAR_WIDTH,
      flexShrink: 0,
      "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box" },
    }}
  >
    {/* Spacer so the items start below the fixed header */}
    <Toolbar />
    <List>
      {items.map((item) => (
        <Tooltip key={item.page} title={item.label} placement="right">
          <ListItemButton
            selected={page === item.page}
            onClick={() => onNavigate(item.page)}
            aria-label={item.label}
            sx={{ justifyContent: "center", py: 1.5 }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                color: page === item.page ? "teal" : "text.secondary",
              }}
            >
              {item.icon}
            </ListItemIcon>
          </ListItemButton>
        </Tooltip>
      ))}
    </List>
  </Drawer>
);

export default Sidebar;
