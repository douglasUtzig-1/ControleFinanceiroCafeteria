import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Receipt,
  LayoutDashboard,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Coffee,
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  visiblePages?: string[];
  userLabel?: string;
  onLogout?: () => void;
}

const navItems = [
  { id: 'billing', icon: Receipt, label: 'Faturamento' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'reports', icon: BarChart3, label: 'Relatórios' },
  { id: 'settings', icon: Settings, label: 'Configurações' },
];

const AppSidebar = ({ activePage, onPageChange, visiblePages, userLabel, onLogout }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef<HTMLUListElement>(null);
  const [autoWidth, setAutoWidth] = useState<number | null>(null);

  useEffect(() => {
    if (navRef.current && !collapsed) {
      // Measure the natural width of nav items + padding (px-2 = 8px each side) + icon (18px) + gap (12px) + sidebar padding (16px each side)
      const items = navRef.current.querySelectorAll('span');
      let maxTextWidth = 0;
      items.forEach((span) => {
        maxTextWidth = Math.max(maxTextWidth, span.scrollWidth);
      });
      // icon(18) + gap(12) + text + button px(12*2) + sidebar px(8*2) + extra breathing room(24)
      const totalWidth = 18 + 12 + maxTextWidth + 24 + 16 + 24;
      setAutoWidth(Math.max(totalWidth, 140)); // min 140px
    }
  }, [collapsed]);

  const allowedItems = navItems.filter((item) => !visiblePages || visiblePages.includes(item.id));

  return (
    <aside
      className="flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0 relative"
      style={{ width: collapsed ? 68 : (autoWidth ?? 200) }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--gradient-primary)' }}>
          <Coffee className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sidebar-primary-foreground text-base tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Streetme Floripa
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        <ul ref={navRef} className="space-y-1 px-2">
          {allowedItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  title={item.label}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-sidebar-primary")} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-sidebar-foreground" />
            </div>
            {!collapsed && <span className="text-xs text-sidebar-foreground">{userLabel || "Usuário"}</span>}
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!collapsed && <span>Sair</span>}
            </button>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
};

export default AppSidebar;
