import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Dashboard';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Paket {
  id: string;
  kode: string;
  kode_barang: string;
  nama_barang: string;
  kategori: string;
  pemilik: string | null;
  status: string;
  harga: number;
  created_at: string;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

export function DataPaket() {
  const [data, setData] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('pakages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setData(data as Paket[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);

    const { error } = await supabase
      .from('pakages')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setData(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status } : item
        )
      );
    } else {
      alert(error.message);
    }

    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus paket ini?')) return;

    const { error } = await supabase
      .from('pakages')
      .delete()
      .eq('id', id);

    if (!error) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        item.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
        item.kode.toLowerCase().includes(search.toLowerCase()) ||
        (item.pemilik ?? '').toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        !statusFilter || item.status === statusFilter;

      const matchKategori =
        !kategoriFilter || item.kategori === kategoriFilter;

      const matchTanggal =
        !dateFilter || item.created_at.startsWith(dateFilter);

      return (
        matchSearch &&
        matchStatus &&
        matchKategori &&
        matchTanggal
      );
    });
  }, [data, search, statusFilter, kategoriFilter, dateFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(start, start + itemsPerPage);

  return (
    <DashboardLayout>
      <div className="pt-20 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl mb-1">Data Paket Barang</h1>
            <p className="text-gray-600">
              Filter data berdasarkan tanggal, kategori, dan status
            </p>
          </div>
          <Link
            to="/dashboard/input"
            className="flex items-center gap-2 px-5 py-3 bg-blue-900 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Tambah Paket
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border grid md:grid-cols-4 gap-4">

          <div>
            <label className="text-sm mb-1 block">Cari</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nama / Kode / Pemilik"
                className="pl-10 w-full border px-4 py-2 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-sm mb-1 block">Tanggal</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm mb-1 block">Kategori</label>
            <select
              value={kategoriFilter}
              onChange={e => {
                setKategoriFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border px-4 py-2 rounded-lg"
            >
              <option value="">Semua</option>
              {Array.from(new Set(data.map(i => i.kategori))).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border px-4 py-2 rounded-lg"
            >
              <option value="">Semua</option>
              <option value="belum_diambil">Belum Diambil</option>
              <option value="sudah_diambil">Sudah Diambil</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Tanggal</th>
                <th className="px-6 py-4 text-left">Nama Barang</th>
                <th className="px-6 py-4 text-left">Kode</th>
                <th className="px-6 py-4 text-left">Pemilik</th>
                <th className="px-6 py-4 text-left">Kategori</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">Loading...</td>
                </tr>
              ) : currentData.length ? (
                currentData.map(item => (
                  <tr key={item.id} className="border-t">

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium">{item.nama_barang}</p>
                      <p className="text-xs text-gray-500">{item.kode_barang}</p>
                    </td>

                    <td className="px-6 py-4">{item.kode}</td>
                    <td className="px-6 py-4">{item.pemilik ?? '-'}</td>
                    <td className="px-6 py-4">{item.kategori}</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={e =>
                            updateStatus(item.id, e.target.value)
                          }
                          disabled={updatingId === item.id}
                          className={`border px-3 py-1 rounded-lg text-sm ${
                            item.status === 'sudah_diambil'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          <option value="belum_diambil">Belum Diambil</option>
                          <option value="sudah_diambil">Sudah Diambil</option>
                        </select>

                        {updatingId === item.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/dashboard/input/${item.id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="p-4 flex justify-between items-center border-t">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft />
              </button>

              <span>Halaman {currentPage} / {totalPages}</span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
