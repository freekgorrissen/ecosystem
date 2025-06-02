import { useState } from "react";
import { useGoogleAuth } from "../useGoogleAuth";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Google as GoogleIcon } from '@mui/icons-material';


interface UserInfoType {
  picture?: string;
  [key: string]: unknown;
}

interface HeaderProps {
  user: UserInfoType | null;
  setUser: (user: UserInfoType | null) => void;
  setAccessToken: (token: string | null) => void;
}

const Header = ({ user, setUser, setAccessToken }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Extract user name (try name, fallback to email, else unknown)
  const userName = (user?.name as string) ?? (user?.email as string) ?? "Unknown";

  // useGoogleLogin for implicit flow
  const login = useGoogleAuth({ setUser, setAccessToken });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    handleMenuClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'teal',
        boxShadow: 1
      }}
    >
      <Toolbar>
        {/* <Box
          component="img"
          src="./nata_resize.jpg"
          alt="Nata"
          sx={{
            height: '60px',
            mr: 2
          }}
        /> */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 'bold',
            color: 'black'
          }}
        >
          Ecosystem Planner
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!user ? (
            <Button
              variant="contained"
              onClick={() => login()}
              startIcon={<GoogleIcon />}
              sx={{
                bgcolor: 'white',
                color: 'teal',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Login with Google
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Typography variant="body1" color="black">
                  {`Ingelogd als ${userName}`}
                </Typography>
              )}
              <Avatar
                src={user.picture as string}
                alt="User"
                onClick={handleMenuClick}
                sx={{ 
                  cursor: 'pointer',
                  width: 40,
                  height: 40
                }}
              />
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleLogout}>Log out</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
