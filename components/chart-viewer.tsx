// ChartViewer.tsx
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import { IconTrendingUp } from "@tabler/icons-react"

interface ChartViewerProps {
  data: any[]
  config: ChartConfig
  title?: string
  description?: string
}

export function ChartViewer({ data, config, title, description }: ChartViewerProps) {
  return (
    <>
      <ChartContainer config={config}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ left: 0, right: 10 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
            hide
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          {Object.keys(config).map((key) => (
            <Area
              key={key}
              dataKey={key}
              type="natural"
              fill={`var(--color-${key})`}
              fillOpacity={0.5}
              stroke={`var(--color-${key})`}
              stackId="a"
            />
          ))}
        </AreaChart>
      </ChartContainer>

      {(title || description) && (
        <>
          <Separator />
          <div className="grid gap-2">
            {title && (
              <div className="flex gap-2 leading-none font-medium">
                {title} <IconTrendingUp className="size-4" />
              </div>
            )}
            {description && (
              <div className="text-muted-foreground">{description}</div>
            )}
          </div>
          <Separator />
        </>
      )}
    </>
  )
}

