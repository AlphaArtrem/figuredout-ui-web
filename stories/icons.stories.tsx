import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  ArrowClockwise,
  Buildings,
  ChatCircleDots,
  Check,
  FolderSimple,
  Gear,
  House,
  List,
  MagnifyingGlass,
  Plus,
  Sparkle,
  Target,
  WarningCircle,
  X,
} from "../src/icons/index"

const icons = [
  ["ArrowClockwise", ArrowClockwise],
  ["Buildings", Buildings],
  ["ChatCircleDots", ChatCircleDots],
  ["Check", Check],
  ["FolderSimple", FolderSimple],
  ["Gear", Gear],
  ["House", House],
  ["List", List],
  ["MagnifyingGlass", MagnifyingGlass],
  ["Plus", Plus],
  ["Sparkle", Sparkle],
  ["Target", Target],
  ["WarningCircle", WarningCircle],
  ["X", X],
] as const

const meta = {
  title: "UI/Icons",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ApprovedIcons: Story = {
  render: () => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {icons.map(([name, Icon]) => (
        <div key={name} className="flex items-center gap-3 rounded-lg bg-surface-raised p-4 ring-1 ring-inset ring-edge">
          <span className="inline-flex rounded-md bg-primary-soft p-2 text-primary">
            <Icon size={20} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-fg">{name}</span>
        </div>
      ))}
    </div>
  ),
}
