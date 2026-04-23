"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Factory, ShoppingCart, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Production", href: "/production", icon: Factory },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Factory size={20} />
            </div>
            <span>YPIS</span>
          </Link>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-muted-foreground hover:text-foreground flex items-center space-x-2 text-sm font-medium">
            <UserCircle size={20} />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
