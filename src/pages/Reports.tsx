import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts'
import { BarChart as BarChartIcon } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { getDiaries } from '@/services/diaries'
import { useRealtime } from '@/hooks/use-realtime'

export default function Reports() {
  const [entries, setEntries] = useState<any[]>([])

  const loadData = async () => {
    try {
      const records = await getDiaries()
      setEntries(records)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('diaries', loadData)

  const dataPie = useMemo(() => {
    return [
      {
        name: 'Dourado',
        value: entries.filter((e) => e.type === 'dourado').length,
        fill: '#D4AF37',
      },
      { name: 'Cobre', value: entries.filter((e) => e.type === 'cobre').length, fill: '#B87333' },
    ]
  }, [entries])

  const dataLine = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd')
      return {
        date: format(new Date(d), 'dd/MM'),
        dourado: entries.filter((e) => e.type === 'dourado' && e.date.startsWith(d)).length,
        cobre: entries.filter((e) => e.type === 'cobre' && e.date.startsWith(d)).length,
      }
    })
  }, [entries])

  const chartConfig = {
    dourado: { label: 'Leão Dourado', color: '#D4AF37' },
    cobre: { label: 'Leão Cobre', color: '#B87333' },
  }

  const sortedEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [entries])

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800 rounded-full border border-slate-600">
          <BarChartIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-wide">
            Análise de Performance
          </h1>
          <p className="text-slate-400">Evolução dos seus diários e histórico de decisões.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 backdrop-blur-xl border-[#D4AF37]/30">
          <CardHeader>
            <CardTitle className="text-white">Proporção de Registros</CardTitle>
            <CardDescription className="text-slate-400">Dourado vs Cobre (Total)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    stroke="none"
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-[#D4AF37]/30">
          <CardHeader>
            <CardTitle className="text-white">Evolução Diária (14 dias)</CardTitle>
            <CardDescription className="text-slate-400">Cruzamento de Registros</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataLine} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="dourado" stroke="#D4AF37" strokeWidth={3} />
                  <Line type="monotone" dataKey="cobre" stroke="#B87333" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Últimos Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg bg-black/60 border border-white/5 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                      entry.type === 'dourado'
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                        : 'bg-[#B87333]/20 text-[#B87333]'
                    }`}
                  >
                    {entry.type}
                  </span>
                  <span className="text-slate-500 text-sm">
                    {format(new Date(entry.date), 'dd/MM/yyyy')}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-2">{entry.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-black to-[#001f3f] border-[#D4AF37]/50 mt-8">
        <CardContent className="pt-6 text-center py-8">
          <p className="text-2xl font-serif font-bold text-[#D4AF37] italic">
            Parabéns! Continue assim.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
