export interface ChartSeries {
  key: string
  label: string
  color?: string
}

export interface ChartTableColumn {
  header: string
  key: string
  align?: "left" | "right"
}
