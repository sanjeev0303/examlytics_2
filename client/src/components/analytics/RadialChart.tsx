"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

interface RadialChartProps {
  score: number
  total: number
  title?: string
  description?: string
  footerText?: string
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function RadialChart({ score, total, title = "Accuracy", description = "Current Exam Performance", footerText }: RadialChartProps) {
  const percentage = total > 0 ? (score / total) * 100 : 0
  const chartData = [
    { browser: "safari", score: score, fill: "var(--color-score)" },
  ]
  const endAngle = (percentage / 100) * 360

  return (
    <div className="flex flex-col">
      {(title || description) && (
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}
      <CardContent className="flex-1 pb-0 px-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-56"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={90 - endAngle} // Counter clockwise or just correct math
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-transparent"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="score" background={{ fill: "transparent" }} cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-black tracking-tight"
                        >
                          {Math.round(percentage)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-[10px] font-bold uppercase tracking-widest"
                        >
                          Accuracy
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      {footerText && (
        <CardFooter className="flex-col gap-2 text-sm pt-2">
            <div className="leading-none text-muted-foreground text-center">
            {footerText}
            </div>
        </CardFooter>
      )}
    </div>
  )
}
