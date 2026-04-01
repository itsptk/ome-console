import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import svgPaths from "../../imports/svg-uh8wdes5mv";
import imgImageRedHat from "@/assets/704f152a63b0b4badd89509f0db23ae863ffdf9b.png";
import { AlertsPanel } from "../components/AlertsPanel";
import { BottomPanel } from "../components/BottomPanel";
import { IconButton, SearchInput } from "../../imports/UIComponents";
import { ConceptualLabel } from "../../imports/ConceptualLabel-1";

// User type
type User = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

const users: User[] = [
  { id: 'adi', name: 'Adi Cluster Admin', role: 'Cluster Admin', initials: 'AC' },
  { id: 'sara', name: 'Sara SecOps', role: 'Security Operations', initials: 'SS' }
];

// Header Components
function HamburgerIcon() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full">
      {[1/2, 1/4, 3/4].map((position, idx) => (
        <div key={idx} className="absolute left-[16.67%] right-[16.67%]" style={{ bottom: `${(1 - position) * 100}%`, top: `${position * 100}%` }}>
          <div className="absolute inset-[-0.83px_-6.25%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 1.66667">
              <path d="M0.833333 0.833333H14.1667" stroke="var(--foreground)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

function Header({ 
  onNotificationsClick, 
  currentUser, 
  onUserChange 
}: { 
  onNotificationsClick: () => void;
  currentUser: User;
  onUserChange: (user: User) => void;
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-card h-[64px]" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center h-full px-6 gap-6">
        {/* Menu button */}
        <IconButton aria-label="Menu">
          <HamburgerIcon />
        </IconButton>

        {/* Logo */}
        <div className="flex items-center justify-center size-[32px]">
          <img alt="Red Hat" className="size-full object-contain" src={imgImageRedHat} />
        </div>

        {/* Product Name */}
        <div className="flex items-center">
          <span style={{ 
            fontFamily: 'var(--font-family-display)', 
            fontSize: 'var(--text-base)', 
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--foreground)'
          }}>
            Red Hat OpenShift Management Engine
          </span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-[768px]">
          <SearchInput
            placeholder="Find a resource or describe a task... (e.g., 'Deploy a production cluster' or 'Find security policies')"
            icon={
              <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                <path d={svgPaths.p107a080} stroke="var(--muted-foreground)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d="M14 14L11.1333 11.1333" stroke="var(--muted-foreground)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </svg>
            }
          />
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2 ml-auto">
          <IconButton aria-label="Theme toggle">
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p9bfa300} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </IconButton>
          
          <IconButton aria-label="Notifications" className="relative" onClick={onNotificationsClick}>
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p1c3efea0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p25877f40} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
            <div className="absolute top-[6px] right-[6px] size-[8px] bg-primary rounded-full" />
          </IconButton>

          <IconButton aria-label="Help">
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7.5 7.5C7.5 7.5 7.5 5 10 5C12.5 5 12.5 6.5 12.5 7.5C12.5 8.5 11.5 9 10 9.5V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <circle cx="10" cy="13.5" r="0.5" fill="currentColor" />
            </svg>
          </IconButton>

          <div className="h-[24px] w-px bg-border mx-2" />

          {/* User Menu */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 h-[40px] hover:bg-secondary transition-colors"
              style={{ borderRadius: 'var(--radius)' }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="bg-primary rounded-full size-[24px] flex items-center justify-center">
                <span className="text-primary-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                  {currentUser.initials}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {currentUser.name}
                </span>
                <span style={{ fontFamily: 'var(--font-family-text)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                  {currentUser.role}
                </span>
              </div>
              <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsUserMenuOpen(false)}
                />
                
                {/* Menu */}
                <div
                  className="absolute right-0 mt-2 w-[280px] bg-card border z-20"
                  style={{
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                    borderWidth: '1px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div 
                    className="p-2"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-family-text)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--muted-foreground)',
                        padding: 'var(--spacing-2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Switch User
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onUserChange(user);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary transition-colors ${
                          currentUser.id === user.id ? 'bg-secondary' : ''
                        }`}
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <div 
                          className="rounded-full size-[32px] flex items-center justify-center"
                          style={{
                            backgroundColor: currentUser.id === user.id ? 'var(--primary)' : 'var(--secondary)'
                          }}
                        >
                          <span 
                            style={{ 
                              fontSize: 'var(--text-xs)', 
                              fontWeight: 'var(--font-weight-medium)',
                              color: currentUser.id === user.id ? 'var(--primary-foreground)' : 'var(--foreground)'
                            }}
                          >
                            {user.initials}
                          </span>
                        </div>
                        <div className="flex flex-col items-start flex-1">
                          <span 
                            style={{ 
                              fontFamily: 'var(--font-family-text)', 
                              fontSize: 'var(--text-sm)', 
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--foreground)'
                            }}
                          >
                            {user.name}
                          </span>
                          <span 
                            style={{ 
                              fontFamily: 'var(--font-family-text)', 
                              fontSize: 'var(--text-xs)', 
                              color: 'var(--muted-foreground)' 
                            }}
                          >
                            {user.role}
                          </span>
                        </div>
                        {currentUser.id === user.id && (
                          <svg className="size-4" fill="none" viewBox="0 0 16 16">
                            <path 
                              d="M3 8L6 11L13 4" 
                              stroke="var(--primary)" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Navigation Components
type NavItem = {
  label: string;
  path: string;
  icon: JSX.Element;
  badge?: number;
  disabled?: boolean;
};

function NavigationItem({ label, path, icon, badge, isActive, disabled }: NavItem & { isActive: boolean }) {
  const content = (
    <button
      className={`w-full flex items-center gap-[12px] px-[12px] h-[40px] rounded-[var(--radius)] transition-colors ${
        isActive ? 'bg-primary text-primary-foreground' : disabled ? '' : 'hover:bg-secondary'
      }`}
      disabled={disabled}
    >
      <div className="size-[20px]">{icon}</div>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-destructive text-destructive-foreground text-xs px-[6px] py-[2px] rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </button>
  );

  if (disabled) {
    return content;
  }

  return <Link to={path}>{content}</Link>;
}

function Navigation({ currentUser }: { currentUser: User }) {
  const location = useLocation();
  
  const mainNavItems: NavItem[] = [
    {
      label: 'Overview',
      path: '/',
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: 'Deployments',
      path: '/deployments',
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path d="M10 3L15 8H12V15H8V8H5L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Applications',
      path: '/applications',
      disabled: true,
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path d={svgPaths.pdb17300} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.833)" />
          <path d={svgPaths.p2f6e8c0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.833)" />
          <path d={svgPaths.p32c0b4c0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.833)" />
        </svg>
      ),
    },
    {
      label: 'Virtual Machines',
      path: '/virtual-machines',
      disabled: true,
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <rect x="3" y="4" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 7 H17" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="5" cy="5.5" r="0.5" fill="currentColor" />
          <circle cx="6.5" cy="5.5" r="0.5" fill="currentColor" />
          <circle cx="8" cy="5.5" r="0.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'Clusters',
      path: '/clusters',
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <rect x="3" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="5" r="0.75" fill="currentColor" />
          <circle cx="14" cy="5" r="0.75" fill="currentColor" />
          <circle cx="6" cy="15" r="0.75" fill="currentColor" />
          <circle cx="14" cy="15" r="0.75" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'Governance',
      path: '/governance',
      disabled: true,
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path d={svgPaths.p3f3d8e00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.833)" />
        </svg>
      ),
      badge: 3,
    },
    {
      label: 'Security',
      path: '/security',
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path
            d="M10 2L3 5v5c0 4.5 3 7 7 8.5 4-1.5 7-4 7-8.5V5l-7-3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M7 10 L9 12 L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Observability',
      path: '/observability',
      disabled: true,
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path
            d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: 'Automation',
      path: '/automation',
      disabled: true,
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path
            d="M10 2v3m0 10v3m8-8h-3M5 10H2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M14.5 5.5l-1.5 1.5m-6 6l-1.5 1.5m9 0l-1.5-1.5m-6-6L5.5 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const settingsNavItems: NavItem[] = [
    {
      label: 'Settings',
      path: '/settings',
      disabled: true,
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path d={svgPaths.p1f3cfb80} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.92)" />
          <path d={svgPaths.p2314a170} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="translate(7, 7)" />
        </svg>
      ),
    },
    {
      label: 'Documentation',
      path: '/documentation',
      disabled: true,
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path d="M4 4h12M4 8h12M4 12h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
          <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  // Filter navigation items based on user role
  // Sara SecOps only sees: Overview, Governance, Security, Observability, Settings, Documentation
  const saraAllowedItems = ['Overview', 'Governance', 'Security', 'Observability', 'Settings', 'Documentation'];
  
  const filteredMainNavItems = currentUser.id === 'sara' 
    ? mainNavItems.filter(item => saraAllowedItems.includes(item.label))
    : mainNavItems;

  const filteredSettingsNavItems = currentUser.id === 'sara'
    ? settingsNavItems.filter(item => saraAllowedItems.includes(item.label))
    : settingsNavItems;

  return (
    <nav className="w-[256px] bg-card border-r border-border h-full flex flex-col">
      <div className="flex-1 p-[16px] overflow-y-auto">
        <div className="flex flex-col gap-[8px]">
          {filteredMainNavItems.map((item) => (
            <NavigationItem 
              key={item.label} 
              {...item} 
              isActive={
                location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path))
              }
            />
          ))}
        </div>

        <div className="h-px bg-border my-[16px]" />

        <div className="flex flex-col gap-[8px]">
          {filteredSettingsNavItems.map((item) => (
            <NavigationItem 
              key={item.label} 
              {...item}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export function RootLayout() {
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(users[0]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header 
        onNotificationsClick={() => setIsAlertsPanelOpen(!isAlertsPanelOpen)} 
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
      <div className="flex-1 flex overflow-hidden">
        <Navigation currentUser={currentUser} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <BottomPanel />
        </div>
      </div>
      <AlertsPanel isOpen={isAlertsPanelOpen} onClose={() => setIsAlertsPanelOpen(false)} />
      <ConceptualLabel />
    </div>
  );
}