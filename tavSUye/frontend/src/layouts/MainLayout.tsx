import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  ListItemButton,
  Container,
  AppBar,
  Toolbar,
  ListItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School,
  Person,
  Book,
  Assignment,
  ExitToApp,
  Settings,
  Dashboard,
  AccountCircle,
  Login,
  AdminPanelSettings,
} from '@mui/icons-material';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const pages = [
  { name: 'Dashboard', path: '/', icon: <Dashboard /> },
  { name: 'Courses', path: '/courses', icon: <Book /> },
  { name: 'Instructors', path: '/instructors', icon: <Person /> },
  { name: 'Programs', path: '/programs', icon: <School /> },
];

const settings = [
  { name: 'Profile', path: '/profile', icon: <AccountCircle /> },
  { name: 'Logout', action: 'logout', icon: <ExitToApp /> },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isAdmin = user?.role === 'ADMIN';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSettingClick = (setting: { name: string; path?: string; action?: string }) => {
    handleCloseUserMenu();
    if (setting.action === 'logout') {
      authApi.logout().then(() => {
        dispatch(logout());
        navigate('/login');
      });
    } else if (setting.path) {
      navigate(setting.path);
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/images/tavsuye-high-resolution-logo-transparent.png" 
          alt="tavSUye" 
          style={{ 
            height: '40px', 
            cursor: 'pointer',
            objectFit: 'contain'
          }}
          onClick={() => navigate('/')}
        />
      </Box>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItemButton
            key={page.name}
            onClick={() => {
              navigate(page.path);
              if (isMobile) {
                handleDrawerToggle();
              }
            }}
            selected={location.pathname === page.path}
          >
            <ListItemIcon>{page.icon}</ListItemIcon>
            <ListItemText primary={page.name} />
          </ListItemButton>
        ))}
        {isAdmin && (
          <ListItemButton
            onClick={() => {
              navigate('/admin');
              if (isMobile) {
                handleDrawerToggle();
              }
            }}
            selected={location.pathname.startsWith('/admin')}
          >
            <ListItemIcon><AdminPanelSettings /></ListItemIcon>
            <ListItemText primary="Admin Dashboard" />
          </ListItemButton>
        )}
      </List>
      {isAuthenticated ? (
        <>
          <Divider />
          <List>
            {settings.map((setting) => (
              <ListItemButton
                key={setting.name}
                onClick={() => {
                  if (setting.action === 'logout') {
                    authApi.logout().then(() => {
                      dispatch(logout());
                      navigate('/login');
                    });
                  } else if (setting.path) {
                    navigate(setting.path);
                    if (isMobile) handleDrawerToggle();
                  }
                }}
              >
                <ListItemIcon>{setting.icon}</ListItemIcon>
                <ListItemText primary={setting.name} />
              </ListItemButton>
            ))}
          </List>
        </>
      ) : (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate('/login')}
            startIcon={<Login />}
          >
            Login
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          /* Desktop drawer */
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {/* Mobile header with menu button */}
        {isMobile && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            bgcolor: 'background.paper',
          }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <img 
              src="/images/tavsuye-high-resolution-logo-transparent.png" 
              alt="tavSUye" 
              style={{ 
                height: '32px', 
                width: 'auto',
                objectFit: 'contain'
              }} 
            />
          </Box>
        )}

        {/* Content area */}
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%',
        }}>
          <Container maxWidth="lg" sx={{ 
            py: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
          }}>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
} 