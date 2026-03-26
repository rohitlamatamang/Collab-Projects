import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-11 w-full appearance-none items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-white ring-offset-background placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer shadow-inner shadow-black/20",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectOption = React.forwardRef(
  ({ className, ...props }, ref) => (
    <option
      ref={ref}
      className={cn("bg-slate-900 text-white", className)}
      {...props}
    />
  )
)
SelectOption.displayName = "SelectOption"

export { Select, SelectOption }
