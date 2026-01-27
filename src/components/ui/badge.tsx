import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all overflow-hidden backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/80 text-primary-foreground shadow-sm [a&]:hover:bg-primary/90",
        secondary:
          "border-white/20 dark:border-white/10 bg-secondary/70 text-secondary-foreground shadow-sm [a&]:hover:bg-secondary/80",
        destructive:
          "border-red-500/30 bg-red-500/20 text-red-600 dark:text-red-400 shadow-sm [a&]:hover:bg-red-500/30",
        outline:
          "border-white/30 dark:border-white/10 bg-white/10 dark:bg-white/5 text-foreground shadow-sm [a&]:hover:bg-white/20",
        // Glassmorphic colored variants
        green:
          "border-green-500/40 bg-green-500/15 text-green-600 dark:text-green-400 shadow-sm [a&]:hover:bg-green-500/25",
        yellow:
          "border-yellow-500/40 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 shadow-sm [a&]:hover:bg-yellow-500/25",
        blue:
          "border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-sm [a&]:hover:bg-blue-500/25",
        purple:
          "border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-sm [a&]:hover:bg-purple-500/25",
        orange:
          "border-orange-500/40 bg-orange-500/15 text-orange-600 dark:text-orange-400 shadow-sm [a&]:hover:bg-orange-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
