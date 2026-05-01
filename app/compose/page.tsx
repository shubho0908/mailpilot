"use client";

import { Compose } from "@/components/mail/compose";
import { MailLayout } from "@/components/mail/mailLayout";
import { useRouter } from "next/navigation";

export default function ComposePage() {
  const router = useRouter();

  return (
    <MailLayout>
      <Compose onClose={() => router.back()} />
    </MailLayout>
  );
}
