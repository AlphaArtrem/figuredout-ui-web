import type { Meta, StoryObj } from "@storybook/react-vite"
import { BarChart, DonutChart, FunnelBars, LineChart, Sparkline } from "../src/charts/index"
import { Card, CardBody, CardHeader } from "../index"

const weeklyData = [
  { week: "W1", inbound: 42, qualified: 18 },
  { week: "W2", inbound: 58, qualified: 27 },
  { week: "W3", inbound: 73, qualified: 35 },
  { week: "W4", inbound: 68, qualified: 31 },
  { week: "W5", inbound: 91, qualified: 48 },
]

const meta = {
  title: "UI/Charts",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const BarAndLineCharts: Story = {
  render: () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-fg">Inbound volume</h3>
        </CardHeader>
        <CardBody>
          <BarChart
            data={weeklyData}
            xKey="week"
            series={[
              { key: "inbound", label: "Inbound" },
              { key: "qualified", label: "Qualified" },
            ]}
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-fg">Qualification trend</h3>
        </CardHeader>
        <CardBody>
          <LineChart
            data={weeklyData}
            xKey="week"
            series={[
              { key: "inbound", label: "Inbound" },
              { key: "qualified", label: "Qualified" },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  ),
}

export const DonutAndFunnel: Story = {
  render: () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-fg">Lead source mix</h3>
        </CardHeader>
        <CardBody>
          <DonutChart
            entries={[
              { key: "organic", label: "Organic", value: 46 },
              { key: "referral", label: "Referral", value: 28 },
              { key: "paid", label: "Paid", value: 18 },
              { key: "partner", label: "Partner", value: 8 },
            ]}
            valueFormatter={(value) => `${value}%`}
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-fg">Pipeline funnel</h3>
        </CardHeader>
        <CardBody>
          <FunnelBars
            entries={[
              { key: "new", label: "New", count: 132 },
              { key: "screened", label: "Screened", count: 84 },
              { key: "qualified", label: "Qualified", count: 51 },
              { key: "matched", label: "Matched", count: 32 },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  ),
}

export const SparklinePreview: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <p className="text-sm font-medium text-fg-muted">Weekly score</p>
        <p className="mt-2 font-mono text-3xl font-semibold text-fg">82%</p>
      </CardHeader>
      <CardBody>
        <Sparkline
          data={[
            { label: "Mon", value: 62 },
            { label: "Tue", value: 68 },
            { label: "Wed", value: 66 },
            { label: "Thu", value: 74 },
            { label: "Fri", value: 82 },
          ]}
        />
      </CardBody>
    </Card>
  ),
}
