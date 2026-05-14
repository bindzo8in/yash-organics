"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Users,
  Settings,
  Package,
  SlidersHorizontal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Overview",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "Hero Slides",
    url: "/admin/hero-slides",
    icon: SlidersHorizontal
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-6">
        <span className="font-bold text-xl tracking-tight">Yash Organics</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground">v1.0.0</div>
      </SidebarFooter>
    </Sidebar>
  );
}
