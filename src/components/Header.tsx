import { useState } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import { Button } from '@/components/ui/button';
import { Stethoscope, Home, LogIn, MapPin, Menu, X, User, LogOut } from 'lucide-react';
import LocationModal from '@/components/LocationModal';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const routerLocation = useRouterLocation();
  const { location, isLocationSet } = useLocation();
  const { user, profile, signOut } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  
  const isActive = (path: string) => routerLocation.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/clinics', label: 'Clinics', icon: MapPin },
    { path: '/admin', label: 'Veterinary Software', icon: Stethoscope },
  ];


  return (
    <>
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-auto md:h-20 py-3 md:py-0">
            <Link to="/" className="flex items-center gap-1 md:gap-3 group shrink-0">
              <img 
                src={pawtectorsLogo} 
                alt="Pawtectors Logo" 
                className="w-12 md:w-16 h-12 md:h-16 object-contain group-hover:scale-110 transition-transform" 
              />
              <span className="font-display font-bold text-lg md:text-2xl text-foreground hidden sm:block">
                Paw<span className="text-primary">tectors</span>
              </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                    isActive(link.path) 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center gap-2">
              {isLocationSet && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-primary hidden md:flex"
                  onClick={() => setShowLocationModal(true)}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{location}</span>
                </Button>
              )}
              {/* User Authentication */}
              {user && profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{profile.full_name || 'Profile'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{profile.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.email_address}
                        </p>
                        {profile.city && (
                          <p className="text-xs text-muted-foreground">
                            📍 {profile.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="w-full cursor-pointer">
                        <Home className="w-4 h-4 mr-2" />
                        My Pet Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-muted-foreground hover:text-primary"
                 onClick={() => navigate("/login")}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              )}
              
              {/* Burger Menu Button for Mobile - Moved to Right Corner */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-md">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 text-sm font-medium transition-colors px-3 py-3 rounded-lg ${
                      isActive(link.path) 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
                {isLocationSet && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-3 text-muted-foreground hover:text-primary justify-start px-3 py-3 h-auto"
                    onClick={() => {
                      setShowLocationModal(true);
                      setShowMobileMenu(false);
                    }}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>{location}</span>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>


      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />

    </>
  );
};

export default Header;
