"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: {
  active?: boolean
  payload?: any[]
  label?: string | number
  className?: string
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  labelFormatter?: (value: any, payload: any[]) => React.ReactNode
  labelClassName?: string
  formatter?: (value: any, name: any, entry: any, index: number, payload: any) => React.ReactNode
  color?: string
  nameKey?: string
  labelKey?: string
}) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string" ? config[label as keyof typeof config]?.label || label : itemConfig?.label

    if (labelFormatter) {
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) return null

  return (
    <div className={cn("rounded-md border bg-background p-2 text-xs shadow-sm", className)}>
      {label ? <div className="mb-1 font-medium">{label}</div> : null}

      <div className="grid gap-1">
        {payload.map((item, i) => {
          const key = item.dataKey ?? item.name
          // read config from context or props depending on your implementation
          // try both common locations to be safe
          // @ts-ignore - accessing internal context/prop used in shadcn chart template
          const cfg = (item?.payload?.__config || item?.config || undefined) ?? undefined

          // Safe fallbacks
          const seriesLabel =
            (cfg && key && cfg[key]?.label) ?? (typeof item.name === "string" ? item.name : String(key ?? "Series"))

          const seriesColor = (cfg && key && cfg[key]?.color) ?? (item.color || "hsl(var(--foreground))")

          return (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ backgroundColor: seriesColor }} />
                <span className="text-muted-foreground">{seriesLabel}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

export function ChartLegendContent(props: any) {
  const { payload } = props ?? {}
  if (!payload?.length) return null

  return (
    <ul className="flex flex-wrap items-center gap-3 text-xs">
      {payload.map((entry: any, index: number) => {
        const key = entry.dataKey ?? entry.value
        // @ts-ignore - best-effort config lookup
        const cfg = (entry?.payload?.__config || entry?.config || undefined) ?? undefined
        const label =
          (cfg && key && cfg[key]?.label) ?? (typeof entry.value === "string" ? entry.value : String(key ?? "Series"))
        const color = (cfg && key && cfg[key]?.color) ?? (entry.color || "hsl(var(--foreground))")

        return (
          <li key={index} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">{label}</span>
          </li>
        )
      })}
    </ul>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

export { ChartContainer, ChartTooltip, ChartLegend, ChartStyle }
