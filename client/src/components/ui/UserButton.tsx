"use client";

import { useUser } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

/** Deterministic gradient from user id / email */
function avatarGradient(seed?: string): string {
  const gradients = [
    "from-violet-500 to-fuchsia-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-rose-500",
    "from-indigo-500 to-purple-500",
    "from-pink-500 to-red-500",
  ];
  const hash = (seed ?? "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export default function UserButton() {
  const { user } = useUser();
  const { logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const initials = getInitials(user.firstName, user.lastName, user.email);
  const gradient = avatarGradient(user.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative group outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full transition-all duration-200"
          aria-label="User menu"
        >
          {/* Outer glow ring */}
          <span className="absolute -inset-0.75 rounded-full bg-linear-to-tr from-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]" />

          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-border/60 group-hover:ring-primary/50 transition-all duration-200 overflow-hidden">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.firstName || "Avatar"}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className={`flex h-full w-full items-center justify-center bg-linear-to-br ${gradient} text-white text-sm font-semibold select-none`}
              >
                {initials}
              </span>
            )}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/10 p-1.5"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-medium leading-none text-foreground">
            {user.firstName
              ? `${user.firstName} ${user.lastName ?? ""}`.trim()
              : "User"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {user.email}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border/40" />

        <DropdownMenuItem
          onClick={() => router.push("/dashboard")}
          className="gap-2.5 rounded-lg cursor-pointer focus:bg-secondary/80 px-3 py-2"
        >
          <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="gap-2.5 rounded-lg cursor-pointer focus:bg-secondary/80 px-3 py-2"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/40" />

        <DropdownMenuItem
          onClick={() => logout()}
          className="gap-2.5 rounded-lg cursor-pointer focus:bg-destructive/10 text-destructive focus:text-destructive px-3 py-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
