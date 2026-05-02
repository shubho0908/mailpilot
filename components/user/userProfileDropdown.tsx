"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useApiKeyStatus, useCurrentUser } from "@/hooks/queries/use-user-profile";
import { toast } from "sonner";
import { Moon, Sun } from "lucide-react";
import { ApiKeySetupModal } from "./apiKeySetupModal";

export function UserProfileDropdown() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: apiKeyStatus } = useApiKeyStatus(Boolean(user));

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isUserLoading) {
    return <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 cursor-pointer flex items-center justify-center"
            >
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          {apiKeyStatus?.apiKey && (
            <>
              <div className="p-2">
                <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                  {apiKeyStatus.apiKey}
                </p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer">
            Edit API Key
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="cursor-pointer"
            suppressHydrationWarning
          >
            <div className="flex items-center gap-2">
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>Toggle Theme</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            variant="destructive"
            className="cursor-pointer"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ApiKeySetupModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onComplete={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
