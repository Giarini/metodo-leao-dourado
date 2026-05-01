import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { PILLARS } from '@/lib/constants'
import type { DiagnosticRecord } from '@/services/diagnostics'

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

interface Props {
  history: DiagnosticRecord[]
}

export function DiagnosticRadarChart({ history }: Props) {
  const latestScores: Record<string, number> = {}

  Object.keys(PILLARS).forEach((pillar) => {
    latestScores[pillar] = 0
  })

  for (const record of history) {
    if (record.pillar_type === 'Todos os Pilares') {
      for (const pillar of Object.keys(PILLARS)) {
        if (latestScores[pillar] === 0 && record.answers && record.answers[pillar]) {
          let favCount = 0
          for (const q in record.answers[pillar]) {
            if (record.answers[pillar][q] === 'Favorável') favCount++
          }
          latestScores[pillar] = favCount
        }
      }
    } else {
      if (latestScores[record.pillar_type] === 0) {
        latestScores[record.pillar_type] = record.score || 0
      }
    }
  }

  const chartData = Object.keys(PILLARS).map((pillar) => {
    const shortName =
      pillar === 'Saúde Física e Mental'
        ? 'Saúde'
        : pillar === 'Situação Financeira'
          ? 'Finanças'
          : pillar === 'Vida Profissional'
            ? 'Profissional'
            : pillar === 'Vida Familiar'
              ? 'Familiar'
              : pillar === 'Relações Sociais'
                ? 'Social'
                : pillar

    return {
      pillar: shortName,
      fullPillar: pillar,
      score: latestScores[pillar],
    }
  })

  return (
    <Card className="bg-black/40 border-[#D4AF37]/30">
      <CardHeader className="items-center pb-4">
        <CardTitle className="text-[#D4AF37] font-serif">Visão Geral dos Pilares</CardTitle>
        <CardDescription className="text-slate-400">
          Últimos resultados de cada pilar (escala de 0 a 8)
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px] w-full">
          <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" labelKey="fullPillar" />}
            />
            <PolarGrid className="stroke-[#D4AF37]/20" />
            <PolarAngleAxis
              dataKey="pillar"
              className="text-xs fill-slate-300"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 8]} tick={false} axisLine={false} />
            <Radar
              dataKey="score"
              fill="#D4AF37"
              fillOpacity={0.4}
              stroke="#D4AF37"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
