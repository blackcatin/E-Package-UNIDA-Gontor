import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '../components/Dashboard'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Paket {
  id: string
  kode: string
  kode_barang: string
  nama_barang: string
  kategori: string
  pemilik: string | null
  status: string
  harga: number
  created_at: string
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

export function SearchPacket() {
  const [data, setData] = useState<Paket[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('pakages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setData(data as Paket[])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchNama =
        !search ||
        item.nama_barang.toLowerCase().includes(search.toLowerCase())

      const matchKategori =
        !kategoriFilter || item.kategori === kategoriFilter

      const matchTanggal =
        !dateFilter || item.created_at.startsWith(dateFilter)

      return matchNama && matchKategori && matchTanggal
    })
  }, [data, search, kategoriFilter, dateFilter])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const start = (currentPage - 1) * itemsPerPage
  const currentData = filteredData.slice(start, start + itemsPerPage)

  return (
    <DashboardLayout>
      <div className="pt-20 space-y-6">

        <div>
          <h1 className="text-3xl mb-1">Data Paket Barang</h1>
          <p className="text-gray-600">
            Pencarian berdasarkan tanggal, nama barang, dan kategori
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border grid md:grid-cols-3 gap-4">

          <div>
            <label className="text-sm mb-1 block">Tanggal</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => {
                setDateFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full border px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm mb-1 block">Nama Barang</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Cari nama barang"
                className="pl-10 w-full border px-4 py-2 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-sm mb-1 block">Kategori</label>
            <select
              value={kategoriFilter}
              onChange={e => {
                setKategoriFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full border px-4 py-2 rounded-lg"
            >
              <option value="">Semua</option>
              {Array.from(new Set(data.map(i => i.kategori))).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
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
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : currentData.length ? (
                currentData.map(item => (
                  <tr key={item.id} className="border-t">

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium">{item.nama_barang}</p>
                      <p className="text-xs text-gray-500">
                        {item.kode_barang}
                      </p>
                    </td>

                    <td className="px-6 py-4">{item.kode}</td>
                    <td className="px-6 py-4">{item.pemilik ?? '-'}</td>
                    <td className="px-6 py-4">{item.kategori}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'sudah_diambil'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        {item.status === 'sudah_diambil'
                          ? 'Sudah Diambil'
                          : 'Belum Diambil'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="p-4 flex justify-between items-center border-t">
              <span>
                Halaman {currentPage} / {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
