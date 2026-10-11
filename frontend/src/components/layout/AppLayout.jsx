import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BedDouble,
  DoorOpen,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  Users,
  X,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/allotments', label: 'Room Allotment', icon: DoorOpen },
  { to: '/fees', label: 'Fees & Payments', icon: IndianRupee },
  { to: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
];

const TITLES = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/rooms': 'Rooms',
  '/allotments': 'Room Allotment',
  '/fees': 'Fees & Payments',
  '/complaints': 'Complaints',
};

function SidebarContent({ collapsed = false, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex h-16 items-center gap-2.5 border-b border-slate-100 ${
          collapsed ? 'justify-center px-0' : 'px-5'
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <BedDouble size={19} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-[15px] font-bold tracking-tight text-slate-900">HostelMS</p>
            <p className="text-[11px] font-medium text-slate-400">Management System</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
            Menu
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-0' : 'px-3'
              } ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={`shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                />
                {!collapsed && item.label}
                {!collapsed && isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700"
              title={user?.username}
            >
              {initials(user?.username || 'A')}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {initials(user?.username || 'A')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.username}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {user?.role || 'Admin'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500"
              >
                <LogOut size={17} />
              </button>
            </div>
            <p className="pb-1 pt-2 text-center text-[10px] font-medium tracking-wide text-slate-300">
              HostelMS v1.0.0
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const title = TITLES[location.pathname] || 'Dashboard';

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(true);
    } else {
      setCollapsed((c) => !c);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`print-hidden hidden shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200 lg:block ${
          collapsed ? 'w-[74px]' : 'w-60'
        }`}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'tween', duration: 0.18 }}
              className="fixed inset-y-0 left-0 z-50 w-60 bg-white lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="print-hidden sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={handleMenuClick}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Toggle menu"
            title="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[11px] font-medium text-slate-400">
              <Link to="/" className="hover:text-brand-600 hover:underline">
                Home
              </Link>
              <span className="mx-1.5 text-slate-300">/</span>
              <span className="text-slate-500">{title}</span>
            </p>
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">{title}</h1>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3 text-xs font-medium text-slate-400">
            <span className="hidden md:inline">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="hidden h-4 w-px bg-slate-200 md:inline-block" />
            <span className="inline-flex items-center gap-1.5">
              <KeyRound size={13} />
              <span className="hidden sm:inline">Admin Console</span>
            </span>
          </div>
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
