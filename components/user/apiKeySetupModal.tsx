"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Key } from "lucide-react";
import { useSaveApiKey } from "@/hooks/queries/use-user-profile";

interface ApiKeySetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function ApiKeySetupModal({ open, onOpenChange, onComplete }: ApiKeySetupModalProps) {
  const [apiKey, setApiKey] = useState("");
  const saveApiKey = useSaveApiKey();
  const isSaving = saveApiKey.isPending;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      toast.error("Invalid OpenAI API key format");
      return;
    }

    try {
      await saveApiKey.mutateAsync(apiKey.trim());
      toast.success("API key saved successfully");
      setApiKey("");
      onComplete();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save API key");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[calc(100%-2rem)] max-w-md p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Key className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg sm:text-xl">Set up your OpenAI API Key</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mt-1">
              To use AI features in MailPilot, you need to provide your own OpenAI API key.
            </DialogDescription>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium mb-2">
              OpenAI API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
              disabled={isSaving}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !apiKey.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
            >
              {isSaving ? "Saving..." : "Save API Key"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
