"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const navItems = [
  { href: "/", label: "Agent Control", icon: "smart_toy" },
  { href: "/profile", label: "Profile", icon: "person" },
  { href: "/jobs", label: "Jobs", icon: "work" },
  { href: "/emails", label: "Emails", icon: "mail" },
  { href: "/code", label: "Code AI", icon: "terminal" },
  { href: "/logs", label: "Activity Logs", icon: "history" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe("");
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = () => {
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full flex flex-col w-[240px] bg-surface-dim z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0f131c] text-xl">
                terminal
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#dfe2ee] tracking-tight">
                Sovereign AI
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#c0c1ff] font-semibold">
                Career Agent Active
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  onClose?.();
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold tracking-tight transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-[#c0c1ff] bg-surface-container-highest shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c0c1ff]" />
                )}
              </a>
            ))}

            <div className="pt-2 border-t border-[#31353e]/50 mt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-semibold tracking-tight transition-colors duration-200 text-left"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>

        {/* User Info */}
        <div className="mt-auto p-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#31353e] flex items-center justify-center text-[10px] font-bold text-[#c0c1ff]">
              {user ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">
                {user ? user.name : "Loading..."}
              </p>
              <p className="text-[10px] text-[#908fa0] truncate">
                {user ? user.email : "agent@sovereign"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
