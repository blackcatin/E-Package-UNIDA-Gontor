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
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../hooks/useNotification';
import { ConfirmModal } from '../components/ConfirmModal'; // Pastikan path benar

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
  const itemsPerPage = 10;
  const { showNotification, NotificationComponent } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pakages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setData(data as Paket[]);
    } else {
      showNotification('error', 'Gagal memuat data');
    }
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
        prev.map(item => (item.id === id ? { ...item, status } : item))
      );
      showNotification('success', 'Status berhasil diperbarui');
    } else {
      showNotification('error', error.message);
    }
    setUpdatingId(null);
  };

  // Logika Konfirmasi Hapus
  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const { error } = await supabase
      .from('pakages')
      .delete()
      .eq('id', deleteTarget);

    if (!error) {
      setData(prev => prev.filter(item => item.id !== deleteTarget));
      showNotification('success', 'Paket berhasil dihapus');
    } else {
      showNotification('error', 'Gagal menghapus paket');
    }
    setDeleteTarget(null);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        item.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
        item.kode.toLowerCase().includes(search.toLowerCase()) ||
        (item.pemilik ?? '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchKategori = !kategoriFilter || item.kategori === kategoriFilter;
      const matchTanggal = !dateFilter || item.created_at.startsWith(dateFilter);

      return matchSearch && matchStatus && matchKategori && matchTanggal;
    });
  }, [data, search, statusFilter, kategoriFilter, dateFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout>
      {NotificationComponent}
      
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Paket?"
        message="Tindakan ini permanen. Paket yang sudah dihapus tidak dapat dipulihkan kembali."
      />

      <div className="pt-20 space-y-6 max-w-7xl mx-auto px-4 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Data Paket Barang</h1>
            <p className="text-slate-500">Kelola dan pantau status kiriman barang</p>
          </div>
          <Link
            to="/dashboard/input"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl transition-all shadow-lg shadow-blue-100 font-medium"
          >
            <Plus size={20} />
            Tambah Paket
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Cari Barang</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Nama / Kode / Pemilik"
                className="pl-10 w-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Tanggal Masuk</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="w-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Kategori</label>
            <select
              value={kategoriFilter}
              onChange={e => { setKategoriFilter(e.target.value); setCurrentPage(1); }}
              className="w-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {Array.from(new Set(data.map(i => i.kategori))).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Status Paket</label>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="belum_diambil">Belum Diambil</option>
              <option value="sudah_diambil">Sudah Diambil</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Detail Barang</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Kode</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Pemilik</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Kategori</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-slate-500 font-medium">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length ? (
                  currentData.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{item.nama_barang}</p>
                        <p className="text-xs text-slate-400 font-mono tracking-tighter">{item.kode_barang}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.kode}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.pemilik ?? '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={item.status}
                            onChange={e => updateStatus(item.id, e.target.value)}
                            disabled={updatingId === item.id}
                            className={`border-none px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer outline-none transition-all ${
                              item.status === 'sudah_diambil'
                                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                                : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                            }`}
                          >
                            <option value="belum_diambil">BELUM DIAMBIL</option>
                            <option value="sudah_diambil">SUDAH DIAMBIL</option>
                          </select>
                          {updatingId === item.id && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-1">
                          <Link
                            to={`/dashboard/input/${item.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <AlertCircle size={40} />
                        <span className="font-medium text-lg">Tidak ada data ditemukan</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-slate-100 bg-slate-50/30">
              <p className="text-sm text-slate-500 font-medium">
                Menampilkan <span className="text-slate-800">{currentData.length}</span> dari <span className="text-slate-800">{filteredData.length}</span> paket
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center px-4 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
                  {currentPage} / {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}