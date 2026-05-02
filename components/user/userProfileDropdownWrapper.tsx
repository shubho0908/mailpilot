"use client";

import { useAssistantStore } from "@/lib/store/assistant-store";
import { UserProfileDropdown } from "@/components/user/userProfileDropdown";

export function UserProfileDropdownWrapper() {
  const { isOpen } = useAssistantStore();

  return (
    <div
      className={`fixed top-4 right-4 z-50 hidden sm:block transition-transform duration-300 ease-out ${isOpen ? "-translate-x-[400px]" : ""}`}
    >
      <UserProfileDropdown />
    </div>
  );
}
