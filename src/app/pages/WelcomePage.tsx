import { Link } from 'react-router-dom';
import { Package, User, DollarSign, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabaseUrl = 'https://ulvavmdimaeojgjubqye.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsdmF2bWRpbWFlb2pnanVicXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Njc4MzMsImV4cCI6MjA4MTQ0MzgzM30.JfLtOTqDwn6QEyJDLsthLTGDR9a2xZ09mw_E7ObhhwQ';
const supabase = createClient(supabaseUrl, supabaseKey);

export function WelcomePage() {
  const [pakages, setPakages] = useState<any[]>([]);

  useEffect(() => {
    const fetchPakages = async () => {
      const { data, error } = await supabase
        .from('pakages')
        .select('*')
        .order('id', { ascending: false });
      if (error) console.error(error);
      else setPakages(data);
    };
    fetchPakages();
  }, []);

  const pakageCounts = pakages.reduce((acc: Record<string, number>, pkg: any) => {
    const code = pkg.kategori;   // ⬅️ pakai kategori dari DB
    if (code) {
      acc[code] = (acc[code] || 0) + 1;
    }
    return acc;
  }, {});


  const pakageCodes = Array.from(
    new Set(pakages.map((pkg: any) => pkg.kategori).filter(Boolean))
  ).sort();



  const features = [
    {
      icon: Package,
      title: 'Penitipan Paket',
      description: 'Terima paket dari luar untuk mahasiswi, aman dan tertata'
    },
    {
      icon: User,
      title: 'Ambil Berdasarkan Nama & Kode',
      description: 'Setiap paket memiliki kode unik agar mudah diambil'
    },
    {
      icon: DollarSign,
      title: 'Biaya Pengambilan',
      description: 'Setiap pengambilan paket dikenakan Rp 2.000'
    },
    {
      icon: Users,
      title: 'Manajemen Paket',
      description: 'Lihat paket yang sudah masuk dan statusnya secara realtime'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-900" />
              <span className="text-2xl text-blue-900">E-Package</span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-6 text-blue-900">
            Layanan Penitipan Paket Mahasiswi UNIDA
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Simpan paket Anda dengan aman, mudah diambil, dan terkelola secara digital.
            Setiap pengambilan hanya Rp 2.000.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Mulai Sekarang
          </Link>
        </div>

        <div className="rounded-xl shadow-2xl overflow-hidden bg-white border border-gray-200">
          <div className="bg-blue-900 px-6 py-4 flex items-center space-x-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-white text-sm ml-4">Daftar Paket</span>
          </div>
          <div className="p-8 bg-gradient-to-br from-blue-50 to-gray-50 min-h-[400px] flex flex-col items-center justify-center">
            {pakages.length === 0 ? (
              <p className="text-gray-500">Belum ada paket masuk</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                {pakageCodes.map((code) => (
                  <div
                    key={code}
                    className="flex flex-col items-center justify-center p-6 border rounded-xl bg-white shadow-sm"
                  >
                    <span className="text-3xl font-bold text-blue-900">{code}</span>
                    <span className="text-gray-600 text-sm mt-2">
                      {pakageCounts[code] || 0} Paket
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-blue-900 mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-gray-600">Mudah, aman, dan transparan untuk semua paket</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-900 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-900" />
                </div>
                <h3 className="text-xl text-blue-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-6 h-6" />
                <span className="text-xl">E-Package</span>
              </div>
              <p className="text-blue-200">
                Layanan Penitipan Paket Aman untuk Mahasiswi UNIDA
              </p>
            </div>
            <div>
              <h3 className="text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-blue-200 hover:text-white">Login</Link></li>
                <li><Link to="/register" className="text-blue-200 hover:text-white">Register</Link></li>
                <li><a href="#" className="text-blue-200 hover:text-white">About</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg mb-4">Kontak</h3>
              <ul className="space-y-2 text-blue-200">
                <li>Email: info@epacket.ac.id</li>
                <li>Phone: (021) 1234-5678</li>
                <li>Address: Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
            <p>&copy; 2025 E-Package. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
