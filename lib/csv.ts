// Simple CSV parser and stringifier without dependencies
// - Assumes UTF-8 text input
// - Handles quoted fields, commas inside quotes, and newlines
export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = []
  let i = 0
  const len = text.length
  let field = ""
  let row: string[] = []
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ""
  }
  const pushRow = () => {
    rows.push(row)
    row = []
  }

  while (i < len) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        } else {
          inQuotes = false
          i++
          continue
        }
      } else {
        field += ch
        i++
        continue
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
        continue
      }
      if (ch === ",") {
        pushField()
        i++
        continue
      }
      if (ch === "\r") {
        i++
        continue
      }
      if (ch === "\n") {
        pushField()
        pushRow()
        i++
        continue
      }
      field += ch
      i++
    }
  }
  // flush last field/row
  pushField()
  if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
    pushRow()
  }

  const headers = rows.shift() ?? []
  return { headers, rows }
}

export function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const head = headers.map(esc).join(",")
  const body = rows.map((r) => r.map(esc).join(",")).join("\n")
  return [head, body].filter(Boolean).join("\n")
}
