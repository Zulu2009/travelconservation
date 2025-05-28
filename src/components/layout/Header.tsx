import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Home,
  Search,
  Psychology,
  Analytics,
  Close,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleMenuClose();
  };

  const navigationItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Directory', path: '/directory', icon: <Search /> },
    { label: 'Persona Planner', path: '/persona-planner', icon: <Psychology /> },
    { label: 'Nerd Mode', path: '/nerd-mode', icon: <Analytics /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <AppBar position="fixed" elevation={1}>
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 0,
              mr: 4,
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            TravelConservation
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                    borderBottom: isActive(item.path) ? 2 : 0,
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    px: 2,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* User Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {currentUser ? (
                <>
                  <IconButton
                    size="large"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    {currentUser.photoURL ? (
                      <Avatar
                        src={currentUser.photoURL}
                        alt={currentUser.displayName}
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <AccountCircle />
                    )}
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                  >
                    <MenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleSignOut}>
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={() => navigate('/auth/signin')}>
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/auth/signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 280, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 2 }}>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          
          <List>
            {navigationItems.map((item) => (
              <ListItem
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isActive(item.path) ? 'primary.light' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>

          {/* Mobile User Section */}
          <Box sx={{ px: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {currentUser ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {currentUser.photoURL ? (
                    <Avatar
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      sx={{ width: 40, height: 40 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {currentUser.displayName.charAt(0)}
                    </Avatar>
                  )}
                  <Typography variant="body1" fontWeight={600}>
                    {currentUser.displayName}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleNavigation('/profile')}
                  sx={{ mb: 1 }}
                >
                  Profile
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleNavigation('/auth/signin')}
                  sx={{ mb: 1 }}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleNavigation('/auth/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
