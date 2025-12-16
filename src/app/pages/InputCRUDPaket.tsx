import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Dashboard';
import { Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BARANG_MAP: Record<string, string[]> = {
  A: ['Buku', 'Dokumen', 'Paket Tipis', 'Jam'],
  B: ['Baju', 'Hijab', 'Tas', 'Dompet', 'Sandal'],
  C: ['Barang Kecil', 'Skincare', 'Obat'],
  D: ['Kardus Sedang', 'Sepatu', 'Dan Kawan Kawan'],
  E: ['Kardus Besar', 'Paket Rumah', 'Meja Belajar']
};

const toDateInput = (date: string | Date) =>
  new Date(date).toISOString().split('T')[0];

export function InputCRUDPaket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    kode: '',
    kode_barang: '',
    nama_barang: '',
    kategori: '',
    pemilik: '',
    status: 'belum_diambil',
    tanggal: toDateInput(new Date())
  });

  /* =========================
     AUTO GENERATE KODE PAKET
  ========================== */
  const generateKodePaket = async (kodeBarang: string) => {
    const { data } = await supabase
      .from('pakages')
      .select('kode')
      .eq('kode_barang', kodeBarang);

    let lastNumber = 0;
    data?.forEach(item => {
      const match = item.kode.match(/-(\d+)$/);
      if (match) lastNumber = Math.max(lastNumber, Number(match[1]));
    });

    return `${kodeBarang}-${String(lastNumber + 1).padStart(3, '0')}`;
  };

  /* =========================
     HANDLE CHANGE
  ========================== */
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
        kategori: value,
        nama_barang: ''
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* =========================
     FETCH EDIT DATA
  ========================== */
  useEffect(() => {
    if (!isEdit) return;

    const fetchData = async () => {
      const { data } = await supabase
        .from('pakages')
        .select('*')
        .eq('id', id)
        .single();

      if (!data) return;

      setFormData({
        kode: data.kode,
        kode_barang: data.kode_barang,
        nama_barang: data.nama_barang,
        kategori: data.kategori,
        pemilik: data.pemilik ?? '',
        status: data.status,
        tanggal: toDateInput(data.created_at)
      });
    };

    fetchData();
  }, [id, isEdit]);

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      created_at: new Date(formData.tanggal)
    };
    delete (payload as any).tanggal;

    const { error } = isEdit
      ? await supabase.from('pakages').update(payload).eq('id', id)
      : await supabase.from('pakages').insert(payload);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    navigate('/dashboard/data');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl mb-4">
          {isEdit ? 'Edit Paket Barang' : 'Tambah Paket Barang'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white p-6 rounded-xl border space-y-4">

            {/* TANGGAL */}
            <div>
              <label className="text-sm block mb-1">Tanggal Masuk *</label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            {/* KODE BARANG */}
            <div>
              <label className="text-sm block mb-1">Kode Barang *</label>
              <select
                name="kode_barang"
                value={formData.kode_barang}
                onChange={handleChange}
                required
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="">Pilih Kode</option>
                {Object.keys(BARANG_MAP).map(kode => (
                  <option key={kode} value={kode}>{kode}</option>
                ))}
              </select>
            </div>

            {/* KODE PAKET */}
            <div>
              <label className="text-sm block mb-1">Kode Paket</label>
              <input
                value={formData.kode}
                readOnly
                className="w-full border px-4 py-2 rounded-lg bg-gray-100"
              />
            </div>

            {/* NAMA BARANG */}
            <div>
              <label className="text-sm block mb-1">Nama Barang *</label>
              <select
                name="nama_barang"
                value={formData.nama_barang}
                onChange={handleChange}
                required
                disabled={!formData.kode_barang}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="">Pilih Barang</option>
                {formData.kode_barang &&
                  BARANG_MAP[formData.kode_barang].map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
              </select>
            </div>

            {/* KATEGORI */}
            <div>
              <label className="text-sm block mb-1">Kategori</label>
              <input
                value={formData.kategori}
                readOnly
                className="w-full border px-4 py-2 rounded-lg bg-gray-100"
              />
            </div>

            {/* PEMILIK */}
            <div>
              <label className="text-sm block mb-1">Pemilik</label>
              <input
                name="pemilik"
                value={formData.pemilik}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="text-sm block mb-1">Status</label>
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
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/data')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg"
            >
              <X className="inline w-4 h-4 mr-1" />
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-900 text-white rounded-lg"
            >
              <Save className="inline w-4 h-4 mr-1" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
