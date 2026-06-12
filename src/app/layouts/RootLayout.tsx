import "@patternfly/react-styles/css/components/DragDrop/drag-drop.css";
import { css } from "@patternfly/react-styles";
import dragDropStyles from "@patternfly/react-styles/css/components/DragDrop/drag-drop";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RhUiCatalogAltIcon from "@patternfly/react-icons/dist/esm/icons/rh-ui-catalog-alt-icon";
import GripVerticalIcon from "@patternfly/react-icons/dist/esm/icons/grip-vertical-icon";
import RhUiUsersIcon from "@patternfly/react-icons/dist/esm/icons/rh-ui-users-icon";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import svgPaths from "../../imports/svg-uh8wdes5mv";
import imgImageRedHat from "@/assets/704f152a63b0b4badd89509f0db23ae863ffdf9b.png";
import { AlertsPanel } from "../components/AlertsPanel";
import { BottomPanel } from "../components/BottomPanel";
import { IconButton, SearchInput } from "../../imports/UIComponents";
import { ConceptualLabel } from "../../imports/ConceptualLabel-1";
import { SigningKeyStatusBanner } from "../components/SigningKeyStatusBanner";
import { AppToastProvider } from "../contexts/AppToastContext";
import { NavigationPreferencesProvider, useNavigationPreferences } from "../contexts/NavigationPreferencesContext";
import { NavFavoriteStar } from "../components/NavFavoriteStar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";

const navControlFadeClassName =
  "opacity-0 transition-opacity duration-150 ease-in group-hover:opacity-100 group-hover:duration-500 group-hover:ease-out focus-visible:opacity-100";
import {
  getOrderedFavoriteNavItems,
  NAV_ITEMS_WITHOUT_FAVORITE,
  useNavFavoriteLabels,
  writeNavFavoriteLabels,
} from "../navigation/navFavorites";
import { getNavDisplayIcon } from "../navigation/navAddonIcons";
import { useInstalledAddons } from "../addons/installedAddons";

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

        {/* Logo + product name → title page */}
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0 rounded-[var(--radius)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <div className="flex items-center justify-center size-[32px]">
            <img alt="Red Hat" className="size-full object-contain" src={imgImageRedHat} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--foreground)',
            }}
          >
            Red Hat OpenShift Management Engine
          </span>
        </Link>

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

function NavSeparator({ section = false }: { section?: boolean }) {
  return (
    <div
      className={`h-px shrink-0 bg-border ${section ? "my-[16px]" : ""}`}
    />
  );
}

const navSectionLabelStyle = {
  fontFamily: "var(--font-family-text)",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--font-weight-medium)",
  letterSpacing: "0.02em",
} as const;

function NavCollapsibleSection({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-[var(--radius)] px-[12px] pb-[4px] pt-[8px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          aria-expanded={isOpen}
        >
          <span style={navSectionLabelStyle}>{label}</span>
          <svg
            className={`size-[12px] shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-[8px] pt-[4px]">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

const FAVORITES_DROP_ZONE_ID = "nav-favorites";

type NavReorderProps = {
  isDragging: boolean;
};

function FavoriteSortableRow({
  id,
  children,
}: {
  id: string;
  children: (reorderProps: NavReorderProps) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={css(
        "cursor-grab active:cursor-grabbing",
        isDragging && dragDropStyles.droppable,
        isDragging && dragDropStyles.modifiers.dragging,
      )}
      {...attributes}
      {...listeners}
    >
      {children({ isDragging })}
    </div>
  );
}

function FavoriteNavDroppable({
  items,
  renderItem,
}: {
  items: NavItem[];
  renderItem: (item: NavItem, reorderProps: NavReorderProps) => ReactNode;
}) {
  const itemIds = useMemo(() => items.map((item) => item.label), [items]);
  const { setNodeRef } = useDroppable({ id: FAVORITES_DROP_ZONE_ID });

  return (
    <SortableContext
      items={itemIds}
      strategy={verticalListSortingStrategy}
      id={FAVORITES_DROP_ZONE_ID}
    >
      <div ref={setNodeRef}>
        {items.map((item) => (
          <FavoriteSortableRow key={`${item.label}-favorite-drag`} id={item.label}>
            {(reorderProps) => renderItem(item, reorderProps)}
          </FavoriteSortableRow>
        ))}
      </div>
    </SortableContext>
  );
}

function FavoriteDragOverlayRow({
  label,
  isActive,
}: {
  label: string;
  isActive: boolean;
}) {
  return (
    <div
      className={css(
        dragDropStyles.draggable,
        dragDropStyles.modifiers.dragging,
        `flex h-[40px] w-full items-center gap-[12px] rounded-[var(--radius)] px-[12px] ${
          isActive ? "bg-primary text-primary-foreground" : "bg-card"
        }`,
      )}
      style={
        {
          "--pf-v6-c-draggable--m-dragging--BackgroundColor": isActive
            ? "var(--primary)"
            : "var(--pf-t--global--background--color--floating--default)",
        } as React.CSSProperties
      }
    >
      <div className="flex size-[20px] shrink-0 items-center justify-center">
        <GripVerticalIcon
          style={{
            width: "1rem",
            height: "1rem",
            color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
          }}
          aria-hidden
        />
      </div>
      <span className="min-w-0 flex-1 truncate pr-6">{label}</span>
    </div>
  );
}

function DraggableFavoriteNavItems({
  items,
  userId,
  renderItem,
  isItemActive,
}: {
  items: NavItem[];
  userId: string;
  renderItem: (item: NavItem, reorderProps: NavReorderProps) => ReactNode;
  isItemActive: (item: NavItem) => boolean;
}) {
  const favoriteSetSignature = [...items.map((item) => item.label)]
    .sort()
    .join("\0");
  const [orderedIds, setOrderedIds] = useState(() => items.map((item) => item.label));
  const orderedIdsRef = useRef(orderedIds);
  orderedIdsRef.current = orderedIds;
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setOrderedIds(items.map((item) => item.label));
  }, [userId]);

  useEffect(() => {
    setOrderedIds((current) => {
      const nextLabels = items.map((item) => item.label);
      if (current.length !== nextLabels.length) {
        return nextLabels;
      }

      const currentSet = new Set(current);
      if (!nextLabels.every((label) => currentSet.has(label))) {
        return nextLabels;
      }

      return current;
    });
  }, [favoriteSetSignature, items]);

  const orderedItems = useMemo(() => {
    const itemsByLabel = new Map(items.map((item) => [item.label, item]));
    return orderedIds
      .map((label) => itemsByLabel.get(label))
      .filter((item): item is NavItem => item != null);
  }, [orderedIds, items]);

  const activeItem = orderedItems.find((item) => item.label === activeId);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) {
        return;
      }

      const current = orderedIdsRef.current;
      const oldIndex = current.indexOf(String(active.id));
      const newIndex = current.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const next = arrayMove(current, oldIndex, newIndex);
      setOrderedIds(next);
      writeNavFavoriteLabels(userId, next);
    },
    [userId],
  );

  return (
    <DndContext
      id={FAVORITES_DROP_ZONE_ID}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <FavoriteNavDroppable items={orderedItems} renderItem={renderItem} />
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <FavoriteDragOverlayRow
            label={activeItem.label}
            isActive={isItemActive(activeItem)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function NavigationItem({
  label,
  path,
  icon,
  badge,
  isActive,
  disabled,
  userId,
  showReorderHandle = false,
  reorderProps,
}: NavItem & {
  isActive: boolean;
  userId: string;
  showReorderHandle?: boolean;
  reorderProps?: NavReorderProps;
}) {
  const showFavorite = !NAV_ITEMS_WITHOUT_FAVORITE.has(label);

  const rowClassName = `w-full flex items-center gap-[12px] px-[12px] h-[40px] rounded-[var(--radius)] transition-colors ${
    isActive
      ? "bg-primary text-primary-foreground"
      : disabled
        ? ""
        : "hover:bg-secondary"
  }`;

  const iconSlot =
    showReorderHandle && reorderProps ? (
      <div
        className="grid size-[20px] shrink-0 place-items-center [&>*]:col-start-1 [&>*]:row-start-1"
        aria-label={`Reorder ${label}`}
        aria-grabbed={reorderProps.isDragging}
      >
        <div className="flex size-[20px] items-center justify-center transition-opacity duration-150 ease-in group-hover:opacity-0 group-hover:duration-500 group-hover:ease-out">
          {icon}
        </div>
        <div
          className={`pointer-events-none flex size-[20px] items-center justify-center ${navControlFadeClassName}`}
          aria-hidden
        >
          <GripVerticalIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: isActive
                ? "var(--primary-foreground)"
                : "var(--foreground)",
            }}
          />
        </div>
      </div>
    ) : (
      <div className="flex size-[20px] shrink-0 items-center justify-center">
        {icon}
      </div>
    );

  const labelContent = (
    <span className={`flex-1 truncate text-left ${showFavorite ? "pr-6" : ""}`}>
      {label}
    </span>
  );

  const badgeContent =
    badge !== undefined && badge > 0 ? (
      <span className="bg-destructive text-destructive-foreground text-xs px-[6px] py-[2px] rounded-full min-w-[20px] text-center">
        {badge}
      </span>
    ) : null;

  if (showReorderHandle && reorderProps && !disabled) {
    return (
      <div className="group relative w-full">
        <div className={rowClassName}>
          {iconSlot}
          <Link
            to={path}
            className="min-w-0 flex-1 truncate text-left"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            {label}
          </Link>
          {badgeContent}
        </div>
        {showFavorite ? (
          <NavFavoriteStar label={label} userId={userId} isActive={isActive} />
        ) : null}
      </div>
    );
  }

  const rowContent = (
    <>
      {iconSlot}
      {labelContent}
      {badgeContent}
    </>
  );

  return (
    <div className="group relative w-full">
      {disabled ? (
        <button type="button" className={rowClassName} disabled>
          {rowContent}
        </button>
      ) : (
        <Link to={path} className={rowClassName}>
          {rowContent}
        </Link>
      )}
      {showFavorite ? (
        <NavFavoriteStar label={label} userId={userId} isActive={isActive} />
      ) : null}
    </div>
  );
}

function Navigation({ currentUser }: { currentUser: User }) {
  const location = useLocation();
  const { isNavItemVisible } = useNavigationPreferences();
  const installedAddons = useInstalledAddons();
  
  const mainNavItems: NavItem[] = [
    {
      label: 'Overview',
      path: '/overview',
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
      label: 'Configuration',
      path: '/applications',
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path d={svgPaths.pdb17300} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.833)" />
          <path d={svgPaths.p2f6e8c0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.833)" />
          <path d={svgPaths.p32c0b4c0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.833)" />
        </svg>
      ),
    },
    {
      label: 'Virtualization',
      path: '/virtual-machines',
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
      icon: (
        <svg fill="none" viewBox="0 0 20 20" className="size-full">
          <path d={svgPaths.p3f3d8e00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" transform="scale(0.833)" />
        </svg>
      ),
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
    {
      label: 'User Management',
      path: '/user-management',
      icon: (
        <RhUiUsersIcon
          style={{
            width: "1.25rem",
            height: "1.25rem",
          }}
          aria-hidden
        />
      ),
    },
  ];

  const settingsNavItems: NavItem[] = [
    {
      label: 'Settings',
      path: '/settings',
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
    {
      label: 'Catalog',
      path: '/catalog',
      icon: (
        <RhUiCatalogAltIcon
          style={{
            width: "1.25rem",
            height: "1.25rem",
          }}
          aria-hidden
        />
      ),
    },
  ];

  // Filter navigation items based on user role
  // Sara SecOps only sees: Overview, Governance, Security, Observability, Settings, Documentation, Catalog
  const saraAllowedItems = [
    'Overview',
    'Configuration',
    'Virtualization',
    'Governance',
    'Security',
    'Observability',
    'Settings',
    'Documentation',
    'Catalog',
  ];
  
  const roleFilteredMainNavItems = mainNavItems.filter((item) => {
    if (item.label === "User Management") {
      return currentUser.id === "adi";
    }
    if (currentUser.id === "sara") {
      return saraAllowedItems.includes(item.label);
    }
    return true;
  });

  const roleFilteredSettingsNavItems = currentUser.id === 'sara'
    ? settingsNavItems.filter(item => saraAllowedItems.includes(item.label))
    : settingsNavItems;

  const filteredMainNavItems = roleFilteredMainNavItems.filter((item) =>
    isNavItemVisible(item.label),
  );

  const filteredSettingsNavItems = roleFilteredSettingsNavItems.filter((item) =>
    isNavItemVisible(item.label),
  );

  const favoriteLabels = useNavFavoriteLabels(currentUser.id);
  const favoriteNavItems = getOrderedFavoriteNavItems(
    filteredMainNavItems,
    favoriteLabels,
  );

  const isMainNavItemActive = (item: NavItem) =>
    location.pathname === item.path ||
    (item.path !== "/" &&
      item.path !== "/overview" &&
      location.pathname.startsWith(item.path));

  const renderNavigationItem = (
    item: NavItem,
    keySuffix = "",
    options?: {
      showReorderHandle?: boolean;
      reorderProps?: NavReorderProps;
    },
  ) => {
    const isActive = isMainNavItemActive(item);

    return (
    <NavigationItem
      key={`${item.label}${keySuffix}`}
      {...item}
      icon={getNavDisplayIcon(item.label, item.icon, installedAddons, isActive)}
      userId={currentUser.id}
      isActive={isActive}
      showReorderHandle={options?.showReorderHandle}
      reorderProps={options?.reorderProps}
    />
    );
  };

  return (
    <nav className="flex h-full w-[256px] flex-col border-r border-border bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto p-[16px]">
        <div className="flex flex-col gap-[8px]">
          {filteredMainNavItems
            .filter((item) => item.label === "Overview")
            .map((item) => renderNavigationItem(item))}

          {favoriteNavItems.length > 0 ? (
            <>
              <NavSeparator />
              <NavCollapsibleSection label="Favorites">
                <DraggableFavoriteNavItems
                  items={favoriteNavItems}
                  userId={currentUser.id}
                  isItemActive={isMainNavItemActive}
                  renderItem={(item, reorderProps) =>
                    renderNavigationItem(item, "-favorite", {
                      showReorderHandle: true,
                      reorderProps,
                    })
                  }
                />
              </NavCollapsibleSection>
              <NavCollapsibleSection label="All">
                {filteredMainNavItems
                  .filter((item) => item.label !== "Overview")
                  .map((item) => renderNavigationItem(item))}
              </NavCollapsibleSection>
            </>
          ) : (
            filteredMainNavItems
              .filter((item) => item.label !== "Overview")
              .map((item) => renderNavigationItem(item))
          )}
        </div>
      </div>

      <div className="shrink-0 p-[16px]">
        <NavSeparator section />

        <div className="flex flex-col gap-[8px]">
          {filteredSettingsNavItems.map((item) => (
            <NavigationItem
              key={item.label}
              {...item}
              userId={currentUser.id}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export function RootLayout() {
  const location = useLocation();
  const isTitlePage =
    location.pathname === '/' || location.pathname.startsWith('/day-one');

  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(users[0]);

  return (
    <AppToastProvider>
      <NavigationPreferencesProvider userId={currentUser.id}>
      {isTitlePage ? (
        <div className="h-screen flex flex-col bg-background">
          <main className="flex flex-1 min-h-0 flex-col overflow-y-auto">
            <Outlet />
          </main>
          <ConceptualLabel />
        </div>
      ) : (
        <div className="h-screen flex flex-col bg-background">
          <Header
            onNotificationsClick={() => setIsAlertsPanelOpen(!isAlertsPanelOpen)}
            currentUser={currentUser}
            onUserChange={setCurrentUser}
          />
          <SigningKeyStatusBanner />
          <div className="flex-1 flex overflow-hidden">
            <Navigation currentUser={currentUser} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-y-auto">
                <Outlet />
              </main>
              <BottomPanel />
            </div>
          </div>
          <AlertsPanel
            isOpen={isAlertsPanelOpen}
            onClose={() => setIsAlertsPanelOpen(false)}
          />
          <ConceptualLabel />
        </div>
      )}
      </NavigationPreferencesProvider>
    </AppToastProvider>
  );
}