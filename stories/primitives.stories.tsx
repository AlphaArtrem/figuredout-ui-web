import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  FormField,
  IconButton,
  Input,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Textarea,
  ThemeToggle,
} from "../index"
import { Gear, Plus, X } from "../src/icons/index"

const meta = {
  title: "UI/Primitives",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Buttons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button leadingIcon={<Plus size={16} aria-hidden="true" />}>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button loading>Loading</Button>
      <IconButton aria-label="Open settings" variant="secondary" icon={<Gear size={16} aria-hidden="true" />} />
    </div>
  ),
}

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Neutral</Badge>
      <Badge tone="primary">Primary</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
      <Badge tone="info">Info</Badge>
    </div>
  ),
}

export const FormControls: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-5 md:grid-cols-2">
      <FormField label="Company name" labelFor="company-name" hint="Use the public-facing business name." required>
        <Input id="company-name" placeholder="FiguredOut" />
      </FormField>
      <FormField label="Category" labelFor="category">
        <Select id="category" defaultValue="saas">
          <option value="saas">SaaS</option>
          <option value="services">Services</option>
          <option value="marketplace">Marketplace</option>
        </Select>
      </FormField>
      <FormField label="Notes" labelFor="notes" className="md:col-span-2">
        <Textarea id="notes" placeholder="Add qualification notes..." />
      </FormField>
      <FormField label="Invalid field" labelFor="invalid" error="A value is required.">
        <Input id="invalid" invalid placeholder="Missing value" />
      </FormField>
      <div className="flex flex-col gap-4 rounded-lg bg-surface-raised p-4">
        <label className="inline-flex items-center gap-3 text-sm text-fg">
          <Checkbox defaultChecked />
          Include archived records
        </label>
        <Switch label="Enable automation" defaultChecked />
      </div>
    </div>
  ),
}

export const CardLayout: Story = {
  render: () => (
    <Card className="max-w-xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-fg">Lead summary</h3>
            <p className="text-sm text-fg-muted">Compact card composition with tokenized surfaces.</p>
          </div>
          <Badge tone="success">Active</Badge>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-fg-muted">
          Use cards for repeated objects, compact summaries, and contained interaction groups.
        </p>
      </CardBody>
      <CardFooter>
        <Button size="sm" trailingIcon={<X size={14} aria-hidden="true" />}>
          Close
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const LoadingStates: Story = {
  render: () => (
    <div className="grid max-w-xl gap-4">
      <Spinner label="Loading records" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  ),
}

export const ThemeControl: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <span className="text-sm text-fg-muted">Toggle the preview theme class.</span>
    </div>
  ),
}
