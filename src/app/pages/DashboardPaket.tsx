import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/Dashboard'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  BarChart,
  Bar,
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
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([])

  const [stats, setStats] = useState({
    total: 0,
    sudahDiambil: 0,
    belumDiambil: 0,
    pemasukan: 0
  })

  const fetchPakages = async () => {
    const { data, error } = await supabase
      .from('pakages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) return

    setPakets(data)
    processStats(data)
    processRecent(data)
    processChart(data)
  }

  const processStats = (data: Paket[]) => {
    const total = data.length
    const sudahDiambil = data.filter(p => p.status === 'sudah_diambil').length
    const belumDiambil = data.filter(p => p.status === 'belum_diambil').length
    const pemasukan = sudahDiambil * 2000

    setStats({ total, sudahDiambil, belumDiambil, pemasukan })
  }

  const processRecent = (data: Paket[]) => {
    setRecentActivity(data.slice(0, 5)) 
  }

  const processChart = (data: Paket[]) => {
    const map: Record<string, number> = {}

    data.forEach(p => {
      map[p.kategori] = (map[p.kategori] || 0) + 1
    })

    setChartData(
      Object.keys(map).map(key => ({
        name: key,
        count: map[key]
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
        () => fetchPakages()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-3xl">Dashboard Paket</h1>
          <p className="text-gray-600">Ringkasan data penitipan paket</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Stat title="Total Paket" value={stats.total} />
          <Stat title="Sudah Diambil" value={stats.sudahDiambil} color="green" />
          <Stat title="Belum Diambil" value={stats.belumDiambil} color="blue" />
          <Stat title="Pemasukan" value={`Rp ${stats.pemasukan.toLocaleString()}`} color="yellow" />
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl mb-4">Distribusi Paket per Kategori</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
          <div className="flex justify-between mb-4">
            <h2 className="text-xl">Paket Terbaru</h2>
            <Link to="/dashboard/data" className="text-blue-900 text-sm">
              Lihat Semua
            </Link>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Nama Barang</th>
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
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === 'sudah_diambil'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.status}
                    </span>
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
      <h2 className={`text-2xl ${map[color]}`}>{value}</h2>
    </div>
  )
}
