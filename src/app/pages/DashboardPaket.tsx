import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/Dashboard'
import { Link } from 'react-router-dom'
import { Clock, PackageCheck, PackageX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

type Paket = {
  id: string
  nama_barang: string
  kategori: string
  status: 'sudah_diambil' | 'belum_diambil'
  pemilik?: string
  created_at: string
}

export function DashboardPaket() {
  const [pakets, setPakets] = useState<Paket[]>([])
  const [recentActivity, setRecentActivity] = useState<Paket[]>([])
  const [chartKategori, setChartKategori] = useState<any[]>([])
  const [chartHarian, setChartHarian] = useState<any[]>([])

  const [stats, setStats] = useState({
    total: 0,
    sudahDiambil: 0,
    belumDiambil: 0,
    hariIni: 0,
    pemasukan: 0
  })

  const fetchPakages = async () => {
    const { data, error } = await supabase
      .from('pakages')
      .select('id, nama_barang, kategori, status, pemilik, created_at')
      .order('created_at', { ascending: false })

    if (error || !data) return

    setPakets(data)
    processStats(data)
    processRecent(data)
    processKategoriChart(data)
    processHarianChart(data)
  }

  const processStats = (data: Paket[]) => {
    const total = data.length
    const sudahDiambil = data.filter(p => p.status === 'sudah_diambil').length
    const belumDiambil = data.filter(p => p.status === 'belum_diambil').length

    const today = new Date().toISOString().split('T')[0]
    const hariIni = data.filter(p =>
      p.created_at.startsWith(today)
    ).length

    const pemasukan = sudahDiambil * 2000

    setStats({
      total,
      sudahDiambil,
      belumDiambil,
      hariIni,
      pemasukan
    })
  }

  const processRecent = (data: Paket[]) => {
    setRecentActivity(data.slice(0, 5))
  }

  const processKategoriChart = (data: Paket[]) => {
    const map: Record<string, number> = {}

    data.forEach(p => {
      map[p.kategori] = (map[p.kategori] || 0) + 1
    })

    setChartKategori(
      Object.keys(map).map(key => ({
        name: key,
        count: map[key]
      }))
    )
  }

  const processHarianChart = (data: Paket[]) => {
    const map: Record<string, number> = {}

    data.forEach(p => {
      const date = p.created_at.split('T')[0]
      map[date] = (map[date] || 0) + 1
    })

    setChartHarian(
      Object.entries(map)
        .slice(-7)
        .map(([date, count]) => ({
          date,
          count
        }))
    )
  }

  useEffect(() => {
    fetchPakages()

    const channel = supabase
      .channel('pakages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pakages' },
        fetchPakages
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="pt-20 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold">Dashboard Paket</h1>
          <p className="text-gray-600">Ringkasan aktivitas penitipan paket</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Stat title="Total Paket" value={stats.total} />
          <Stat title="Hari Ini" value={stats.hariIni} color="blue" />
          <Stat title="Sudah Diambil" value={stats.sudahDiambil} color="green" />
          <Stat title="Belum Diambil" value={stats.belumDiambil} color="yellow" />
          <Stat
            title="Pemasukan"
            value={`Rp ${stats.pemasukan.toLocaleString()}`}
            color="green"
          />
        </div>

        {/* CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-xl mb-4">Distribusi Paket per Kategori</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartKategori}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-xl mb-4">Paket Masuk (7 Hari Terakhir)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartHarian}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1e3a8a"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl">Aktivitas Terbaru</h2>
            <Link to="/dashboard/data" className="text-blue-900 text-sm">
              Lihat Semua
            </Link>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Barang</th>
                <th>Status</th>
                <th>Pemilik</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map(p => (
                <tr key={p.id} className="border-b">
                  <td>{p.nama_barang}</td>
                  <td>
                    {p.status === 'sudah_diambil' ? (
                      <span className="flex items-center gap-1 text-green-700">
                        <PackageCheck size={14} /> Diambil
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-700">
                        <PackageX size={14} /> Belum
                      </span>
                    )}
                  </td>
                  <td>{p.pemilik || '-'}</td>
                  <td className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  )
}

function Stat({
  title,
  value,
  color = 'gray'
}: {
  title: string
  value: number | string
  color?: 'gray' | 'green' | 'blue' | 'yellow'
}) {
  const map = {
    gray: 'text-gray-900',
    green: 'text-green-700',
    blue: 'text-blue-700',
    yellow: 'text-yellow-700'
  }

  return (
    <div className="bg-white p-6 rounded-xl border">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-2xl font-semibold ${map[color]}`}>{value}</h2>
    </div>
  )
}
