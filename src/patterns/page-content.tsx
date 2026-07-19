import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

export interface PageContentProps extends HTMLAttributes<HTMLDivElement> {}

export function PageContent({ className, ...props }: PageContentProps) {
  return <div className={cn("flex flex-col gap-6 pb-10", className)} {...props} />
}
