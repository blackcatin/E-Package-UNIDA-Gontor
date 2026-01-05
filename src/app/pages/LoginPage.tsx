import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Gunakan import client yang sudah ada atau biarkan jika lokal

export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    setLoginError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.password) newErrors.password = 'Password wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // 1. Proses Autentikasi Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (authError || !authData.user) {
      setLoginError('Email atau password salah');
      setIsLoading(false);
      return;
    }

    // 2. Ambil Role dari tabel profiles berdasarkan ID user yang login
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      setLoginError('Gagal memvalidasi profil pengguna');
      setIsLoading(false);
      return;
    }

    // 3. Navigasi Berdasarkan Role
    if (profile.role === 'admin') {
      navigate('/dashboard'); // Admin ke Dashboard Utama
    } else {
      // User ke Search Paket (Tetap di dalam DashboardLayout tapi menu terbatas)
      navigate('/dashboard/search'); 
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <BookOpen className="w-10 h-10 text-blue-900" />
              <span className="text-3xl text-blue-900 font-bold">E-Package</span>
            </Link>
            <h2 className="text-3xl text-gray-900 mb-2 font-semibold">Selamat Datang Kembali</h2>
            <p className="text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all`}
                  placeholder="nama@email.com"
                />
              </div>
              {errors.email && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all`}
                  placeholder="Masukkan password"
                />
              </div>
              {errors.password && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-blue-900 font-medium hover:text-blue-700">
                Daftar sekarang
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 to-blue-700 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h2 className="text-4xl font-bold mb-6 leading-tight">Layanan Penitipan Paket UNIDA Gontor</h2>
          <p className="text-xl text-blue-100 mb-8 opacity-90">
            Sistem informasi pengelolaan paket mahasiswi yang aman, cepat, dan transparan bagi civitas akademika.
          </p>
          <div className="space-y-5">
             {[
               "Pengecekan paket mandiri oleh mahasiswi",
               "Keamanan data dengan sistem login terintegrasi",
               "Notifikasi status paket secara realtime"
             ].map((text, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 border border-blue-400 flex items-center justify-center">
                  <span className="text-blue-200 text-sm font-bold">✓</span>
                </div>
                <p className="text-lg text-blue-50">{text}</p>
              </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}