import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.99]",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.99]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:scale-[0.99]",
        outline:
          "border border-border bg-transparent hover:border-foreground/40 hover:bg-muted/40 text-foreground",
        secondary:
          "bg-muted text-foreground hover:bg-muted/70",
        ghost:
          "text-foreground hover:bg-muted/60",
        link:
          "text-foreground underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 rounded-md px-3 text-[12.5px]",
        lg: "h-12 px-6 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
