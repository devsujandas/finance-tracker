"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { exportSvgElement, exportPngFromSvgElement, exportCsvFile } from "@/lib/export"

type CsvConfig = {
  filename: string
  headers: string[]
  rows: (string | number | null | undefined)[][]
}

export function ChartExport({
  getSvg,
  csv,
  filenameBase,
}: {
  getSvg: () => SVGSVGElement | null
  csv?: CsvConfig
  filenameBase: string
}) {
  const onExportSVG = useCallback(() => {
    const svg = getSvg()
    if (!svg) return
    exportSvgElement(svg, `${filenameBase}.svg`)
  }, [getSvg, filenameBase])

  const onExportPNG = useCallback(() => {
    const svg = getSvg()
    if (!svg) return
    exportPngFromSvgElement(svg, `${filenameBase}.png`)
  }, [getSvg, filenameBase])

  const onExportCSV = useCallback(() => {
    if (!csv) return
    exportCsvFile(csv.headers, csv.rows, csv.filename)
  }, [csv])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Export chart">
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportSVG}>Export as SVG</DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPNG}>Export as PNG</DropdownMenuItem>
        {csv && <DropdownMenuItem onClick={onExportCSV}>Export data (CSV)</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
