import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Database,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState<string>('Loading...');
  const [role, setRole] = useState<string>('user'); // Default ke user

  const fetchProfile = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfileName(data.username || 'User');
      setRole(data.role || 'user');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isAdmin = role === 'admin';

  const menuItems = [
    ...(isAdmin ? [{
      title: 'Dashboard Utama',
      path: '/dashboard',
      icon: LayoutDashboard,
      isGroup: false
    }] : []),

    {
      title: 'Manajemen Paket',
      isGroup: true,
      children: [
        ...(isAdmin ? [
          { title: 'Input Paket', path: '/dashboard/input', icon: Package },
          { title: 'Data Paket', path: '/dashboard/data', icon: Database },
        ] : []),
        { title: 'Cari Paket', path: '/dashboard/search', icon: Search }
      ]
    }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-blue-900 text-white
    transform transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `}
      >

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-800">
            <Link to={isAdmin ? "/dashboard" : "/dashboard/search"} className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-300" />
              <span className="text-xl font-semibold">E-Packet</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  {item.isGroup ? (
                    <div>
                      {item.children && item.children.length > 0 && (
                        <div className="px-4 py-2 text-sm text-blue-300 font-medium uppercase tracking-wider">
                          {item.title}
                        </div>
                      )}
                      <ul className="space-y-1 mt-2">
                        {item.children?.map((child, childIndex) => {
                          const ChildIcon = child.icon;
                          const isActive = location.pathname === child.path;
                          return (
                            <li key={childIndex}>
                              <Link
                                to={child.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-800 text-white shadow-inner' : 'text-blue-100 hover:bg-blue-800/50'
                                  }`}
                              >
                                <ChildIcon className="w-5 h-5" />
                                <span>{child.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    item.path && item.icon && (
                      (() => {
                        const MainIcon = item.icon;
                        return (
                          <Link
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800/50'
                              }`}
                          >
                            <MainIcon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })()
                    )
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-blue-800 px-4 py-4 bg-blue-950/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{profileName}</p>
                <p className="text-xs text-blue-400 capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 fixed top- right-0 left-0 lg:left-64 bg-white shadow-sm z-40">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-medium text-gray-800 hidden sm:block">
              UNIDA Gontor
            </h1>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center space-x-2 border-l pl-4">
                <span className="text-sm font-medium text-gray-700 hidden md:inline">{profileName}</span>
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-20 lg:ml-64 p-4 lg:p-8">
          {children}
        </main>

      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        ></div>
      )}
    </div>
  );
}