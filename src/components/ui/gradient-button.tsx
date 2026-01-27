import * as React from "react"

import { cn } from "@/lib/utils"

type GradientButtonProps = React.ComponentPropsWithoutRef<"div">

export const GradientButton = React.forwardRef<HTMLDivElement, GradientButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          `
group relative px-4 py-2 rounded-lg text-sm font-medium text-white
shadow-md overflow-hidden

transition-transform duration-200 ease-out
hover:-translate-y-[1px]

before:content-['']
before:absolute before:inset-0 before:rounded-lg
before:p-[1px]
before:bg-[linear-gradient(180deg,#5B5B5B_0%,rgba(0,0,0,0)_100%)]
before:z-0
cursor-pointer
z-10
outline-none ring-0
`,
          className
        )}
        {...props}
      >
        {/* Base gradient */}
        <span
          className="
absolute inset-[1px] rounded-[7px]
bg-[linear-gradient(90deg,#272726_0%,#373737_24%,#373737_45%,#2A2A29_82%)]
transition-opacity duration-300 ease-in-out
opacity-100 group-hover:opacity-0
"
        />

        {/* Hover gradient */}
        <span
          className="
absolute inset-[1px] rounded-[7px]
bg-[linear-gradient(90deg,#2A2A29_0%,#373737_40%,#3f3f3f_60%,#272726_100%)]
transition-opacity duration-300 ease-in-out
opacity-0 group-hover:opacity-100
"
        />

        <span className="relative z-10">{children}</span>
      </div>
    )
  }
)

GradientButton.displayName = "GradientButton"

