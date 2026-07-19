import { forwardRef } from "react"
import type { InputHTMLAttributes } from "react"
import { MagnifyingGlass, X } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { Input } from "../primitives/input.js"

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  onClear?: () => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, onClear, value, ...props },
  ref,
) {
  const hasValue = typeof value === "string" ? value.length > 0 : false

  return (
    <div className="relative">
      <MagnifyingGlass
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
      />
      <Input ref={ref} value={value} className={cn("pl-10 pr-10", className)} {...props} />
      {hasValue ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-fg-subtle transition duration-fast ease-standard hover:bg-surface-raised hover:text-fg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring"
          onClick={onClear}
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
})
