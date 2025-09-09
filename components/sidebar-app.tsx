"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavUser } from "@/components/nav-user";
import { MessageCircle, SquarePen, ShoppingBag } from "lucide-react";
import type { ComponentProps } from "react";

// This is sample data.
const data = {
  user: {
    name: "John Doe",
    email: "m@example.com",
    avatar: "/avatar-1.png",
  },
};

export function SidebarApp({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Product Assistant</span>
          </div>
          {/* New Chat Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost">
                  <SquarePen className="h-5 w-5" />
                  <span className="sr-only">New Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-4">
          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full justify-start">
                  <a href="/products">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Products
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="w-full justify-start">
                  <a href="/chat">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat Assistant
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
