import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/Dashboard';
import { Plus, Trash2, Pencil, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../hooks/useNotification';
import { ConfirmModal } from '../components/ConfirmModal';

type MasterKodeKategoriType = {
  id: string;
  kode: string;
  nama_kode: string;
  kategori: string;
};

export function MasterKodeKategori() {
  const { showNotification, NotificationComponent } = useNotification();

  const [data, setData] = useState<MasterKodeKategoriType[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: '',
    kode: '',
    nama_kode: '',
    kategori: '',
  });

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEdit = Boolean(form.id);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('master_kode_kategori')
      .select('*')
      .order('kode');

    if (error) {
      showNotification('error', error.message);
      return;
    }

    setData(data ?? []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FORM ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      id: '',
      kode: '',
      nama_kode: '',
      kategori: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      kode: form.kode,
      nama_kode: form.nama_kode,
      kategori: form.kategori,
    };

    const { error } = isEdit
      ? await supabase
          .from('master_kode_kategori')
          .update(payload)
          .eq('id', form.id)
      : await supabase.from('master_kode_kategori').insert(payload);

    setLoading(false);

    if (error) {
      showNotification('error', `Gagal menyimpan: ${error.message}`);
      return;
    }

    showNotification(
      'success',
      isEdit ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan'
    );

    resetForm();
    fetchData();
  };

  /* ================= EDIT ================= */
  const handleEdit = (item: MasterKodeKategoriType) => {
    setForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ================= DELETE ================= */
  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const { error } = await supabase
      .from('master_kode_kategori')
      .delete()
      .eq('id', deleteTarget);

    if (error) {
      showNotification('error', error.message);
    } else {
      showNotification('success', 'Data berhasil dihapus');
      fetchData();
    }

    setDeleteTarget(null);
    setIsModalOpen(false);
  };

  /* ================= RENDER ================= */
  return (
    <DashboardLayout>
      {NotificationComponent}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data?"
        message="Data ini akan dihapus permanen dan tidak bisa dikembalikan."
      />

      <div className="max-w-6xl mx-auto px-4 pt-20 space-y-6">
        <h1 className="text-3xl font-semibold">Master Kode & Kategori</h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-medium text-gray-700">
            {isEdit ? 'Edit Data Master' : 'Tambah Data Master'}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <select
              name="kode"
              value={form.kode}
              onChange={handleChange}
              required
              className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Kode</option>
              {['A', 'B', 'C', 'D', 'E'].map(k => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>

            <input
              name="nama_kode"
              value={form.nama_kode}
              onChange={handleChange}
              placeholder="Nama Kode"
              required
              className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              placeholder="Kategori"
              required
              className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2"
              >
                {isEdit ? <Save size={18} /> : <Plus size={18} />}
                {loading ? 'Proses...' : isEdit ? 'Update' : 'Tambah'}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-3 py-2"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Kode</th>
                <th className="p-4 text-left">Nama Kode</th>
                <th className="p-4 text-left">Kategori</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-blue-700">{item.kode}</td>
                  <td className="p-4">{item.nama_kode}</td>
                  <td className="p-4">{item.kategori}</td>
                  <td className="p-4 text-center space-x-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-gray-400 italic"
                  >
                    Belum ada data master tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
