import { loadSettings, loadCategories, loadTransactions, loadBudgets } from "./storage"
import { toCSV } from "@/lib/csv"

export function exportAllData() {
  if (typeof window === "undefined") return
  const data = {
    settings: loadSettings(),
    categories: loadCategories(),
    transactions: loadTransactions(),
    budgets: loadBudgets(),
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "budget-tracker-data.json"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function serializeSvg(svg: SVGSVGElement) {
  // Clone and ensure xmlns attributes are present for a portable SVG
  const clone = svg.cloneNode(true) as SVGSVGElement
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  if (!clone.getAttribute("xmlns:xlink")) clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  const serializer = new XMLSerializer()
  return serializer.serializeToString(clone)
}

function getSvgSize(svg: SVGSVGElement): { width: number; height: number } {
  const vb = svg.viewBox && (svg.viewBox as any).baseVal
  if (vb && vb.width && vb.height) return { width: vb.width, height: vb.height }
  const w = Number(svg.getAttribute("width")) || svg.getBoundingClientRect().width || 300
  const h = Number(svg.getAttribute("height")) || svg.getBoundingClientRect().height || 150
  return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) }
}

export function exportSvgElement(svg: SVGSVGElement, filename: string) {
  const source = serializeSvg(svg)
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
  triggerDownload(blob, filename)
}

export async function exportPngFromSvgElement(svg: SVGSVGElement, filename: string, scale = 2) {
  const source = serializeSvg(svg)
  const { width, height } = getSvgSize(svg)
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.floor(width * scale))
  canvas.height = Math.max(1, Math.floor(height * scale))
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = true

  const img = new Image()
  img.crossOrigin = "anonymous"
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve()
    }
    img.onerror = () => reject(new Error("Failed to load SVG for PNG export"))
    img.src = svgUrl
  })

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) triggerDownload(blob, filename)
      resolve()
    }, "image/png")
  })
}

export function exportCsvFile(headers: string[], rows: (string | number | null | undefined)[][], filename: string) {
  const csv = toCSV(headers, rows)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  triggerDownload(blob, filename)
}
