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
  const [adminName, setAdminName] = useState<string>('Admin');

  // Ambil username admin dari tabel profiles
  const fetchAdmin = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) return console.log('Auth error:', authError);
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (error) console.log('Error fetching admin profile:', error);
    else setAdminName(data?.username || 'Admin');
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const menuItems = [
    {
      title: 'Dashboard Utama',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Manajemen Paket',
      isGroup: true,
      children: [
        { title: 'Input Paket', path: '/dashboard/input', icon: Package },
        { title: 'Data Paket', path: '/dashboard/data', icon: Database },
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
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-800">
            <Link to="/" className="flex items-center space-x-2">
              <LayoutDashboard className="w-8 h-8" />
              <span className="text-xl font-semibold">E-Packet</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  {item.isGroup ? (
                    <div>
                      <div className="px-4 py-2 text-sm text-blue-300 font-medium">
                        {item.title}
                      </div>
                      <ul className="space-y-1 mt-2">
                        {item.children?.map((child, childIndex) => {
                          const Icon = child.icon;
                          const isActive = location.pathname === child.path;
                          return (
                            <li key={childIndex}>
                              <Link
                                to={child.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-blue-800 text-white'
                                    : 'text-blue-100 hover:bg-blue-800/50'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span>{child.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800/50"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-blue-800 px-4 py-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{adminName}</p>
                <p className="text-xs text-blue-300">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-100 hover:bg-blue-800/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl text-gray-900">Universitas Darussalam Gontor</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden lg:flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-sm">{adminName}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        ></div>
      )}
    </div>
  );
}
