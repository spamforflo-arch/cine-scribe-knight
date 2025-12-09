import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 tap-highlight",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:brightness-110 active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-secondary/50 active:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/60",
        ghost: 
          "text-foreground hover:bg-secondary/80 active:bg-secondary",
        link: 
          "text-primary underline-offset-4 hover:underline",
        peach:
          "bg-peach-gradient text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:brightness-95",
        glass:
          "bg-card/60 backdrop-blur-xl border border-border/50 text-foreground hover:bg-card/80 hover:border-primary/30 active:bg-card/90",
        glow:
          "bg-peach-gradient text-primary-foreground shadow-[0_0_25px_-5px_hsl(20_90%_65%/0.5)] hover:shadow-[0_0_35px_-5px_hsl(20_90%_65%/0.7)] active:shadow-[0_0_20px_-5px_hsl(20_90%_65%/0.4)]",
        icon:
          "bg-secondary/80 text-foreground hover:bg-primary/20 hover:text-primary active:bg-primary/30 rounded-full",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
