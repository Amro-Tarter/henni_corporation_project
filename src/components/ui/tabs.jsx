import React, { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

// Root wrapper
const Tabs = TabsPrimitive.Root;

// Tabs List: pill-style container with soft glow
const TabsList = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    dir ="rtl"
    className={cn(
      "inline-flex bg-gradient-to-r from-orange-100 via-white to-orange-100 p-1 rounded-full shadow-inner",
      "= items-center justify-center gap-2",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

// Tabs Trigger: animated pill with transition, glow, and custom active styles
const TabsTrigger = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium",
      "transition-all duration-300 ease-in-out text-gray-700 hover:text-orange-800",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
      "data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500",
      "data-[state=active]:shadow-lg data-[state=active]:scale-105",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

// Tabs Content: subtle animation and spacing
const TabsContent = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 animate-fade-in transition-opacity duration-500",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
