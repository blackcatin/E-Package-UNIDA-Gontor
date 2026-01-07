import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Dashboard';
import { Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../hooks/useNotification';

const toDateInput = (date: string | Date) =>
  new Date(date).toISOString().split('T')[0];

export function InputCRUDPaket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const { showNotification, NotificationComponent } = useNotification();

  const [masterData, setMasterData] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    kode: '',
    kode_barang: '',
    master_kode_kategori_id: '',
    nama_barang: '',
    pemilik: '',
    status: 'belum_diambil',
    tanggal: toDateInput(new Date())
  });

  useEffect(() => {
    const fetchMaster = async () => {
      const { data, error } = await supabase
        .from('master_kode_kategori')
        .select('id, kode, nama_kode, kategori')
        .eq('is_active', true)
        .order('kode');

      if (error) {
        showNotification('error', 'Gagal memuat master data');
        return;
      }

      setMasterData(data ?? []);
    };

    fetchMaster();
  }, []);

  const generateKodePaket = async (kode: string) => {
    const { data } = await supabase
      .from('pakages')
      .select('kode')
      .ilike('kode', `${kode}-%`)
      .order('kode', { ascending: false })
      .limit(1);

    let lastNumber = 0;

    if (data?.length) {
      const match = data[0].kode.match(/-(\d+)$/);
      if (match) lastNumber = Number(match[1]);
    }

    return `${kode}-${String(lastNumber + 1).padStart(3, '0')}`;
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'kode_barang') {
      const kodePaket = await generateKodePaket(value);
      setFormData(prev => ({
        ...prev,
        kode_barang: value,
        kode: kodePaket,
        master_kode_kategori_id: '',
        nama_barang: ''
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!isEdit) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('pakages')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        showNotification('error', 'Gagal memuat data paket');
        return;
      }

      setFormData({
        kode: data.kode,
        kode_barang: data.kode_barang,
        master_kode_kategori_id: data.master_kode_kategori_id,
        nama_barang: data.nama_barang,
        pemilik: data.pemilik ?? '',
        status: data.status,
        tanggal: toDateInput(data.created_at)
      });
    };

    fetchData();
  }, [id]);

  const resetForm = () => {
    setFormData({
      kode: '',
      kode_barang: '',
      master_kode_kategori_id: '',
      nama_barang: '',
      pemilik: '',
      status: 'belum_diambil',
      tanggal: toDateInput(new Date())
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const master = masterData.find(
      m => m.id === formData.master_kode_kategori_id
    );

    if (!master) {
      showNotification('error', 'Kategori wajib dipilih');
      setLoading(false);
      return;
    }

    const payload = {
      kode: formData.kode,
      kode_barang: formData.kode_barang,
      kategori: master.kategori,
      master_kode_kategori_id: master.id,
      nama_barang: formData.nama_barang,
      pemilik: formData.pemilik || null,
      status: formData.status,
      created_at: new Date(formData.tanggal)
    };

    const { error } = isEdit
      ? await supabase.from('pakages').update(payload).eq('id', id)
      : await supabase.from('pakages').insert(payload);

    setLoading(false);

    if (error) {
      showNotification('error', error.message);
      return;
    }

    showNotification(
      'success',
      isEdit ? 'Paket berhasil diperbarui' : 'Paket berhasil ditambahkan'
    );
    if (!isEdit) {
      resetForm();
    } else {
      setTimeout(() => navigate('/dashboard/data'), 800);
    }
  };

  const kodeList = Array.from(
    new Map(masterData.map(i => [i.kode, i.nama_kode])).entries()
  );

  const kategoriList = masterData.filter(
    i => i.kode === formData.kode_barang
  );

  return (
    <DashboardLayout>
      {NotificationComponent}

      <div className="max-w-5xl mx-auto px-4 pt-20 space-y-6">
        <h1 className="text-3xl font-semibold">
          {isEdit ? 'Edit Paket Barang' : 'Tambah Paket Barang'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label>Tanggal Masuk *</label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div>
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="belum_diambil">Belum Diambil</option>
                <option value="sudah_diambil">Sudah Diambil</option>
              </select>
            </div>

            <div>
              <label>Kode Barang *</label>
              <select
                name="kode_barang"
                value={formData.kode_barang}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="">Pilih Kode</option>
                {kodeList.map(([kode, nama]) => (
                  <option key={kode} value={kode}>
                    {kode} - {nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Kode Paket</label>
              <input
                value={formData.kode}
                readOnly
                className="w-full border px-4 py-2 rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label>Kategori *</label>
              <select
                name="master_kode_kategori_id"
                value={formData.master_kode_kategori_id}
                onChange={handleChange}
                required
                disabled={!formData.kode_barang}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="">Pilih Kategori</option>
                {kategoriList.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Nama Barang *</label>
              <input
                name="nama_barang"
                value={formData.nama_barang}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label>Pemilik</label>
              <input
                name="pemilik"
                value={formData.pemilik}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/data')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg"
            >
              <X className="inline w-4 h-4 mr-1" /> Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-900 text-white rounded-lg disabled:opacity-50"
            >
              <Save className="inline w-4 h-4 mr-1" />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
