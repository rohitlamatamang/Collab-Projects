import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-slate-800/50 border-white/10 text-white",
        destructive: "bg-red-500/10 border-red-500/20 text-red-400 [&>svg]:text-red-400",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 [&>svg]:text-emerald-400",
        warning: "bg-amber-500/10 border-amber-500/20 text-amber-400 [&>svg]:text-amber-400",
        info: "bg-blue-500/10 border-blue-500/20 text-blue-400 [&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(
  ({ className, variant, ...props }, ref) => {
    const Icon = {
      default: Info,
      destructive: XCircle,
      success: CheckCircle2,
      warning: AlertCircle,
      info: Info,
    }[variant || "default"]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        {props.children}
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
