"use client";

import { useState, useEffect } from "react";

interface DateDisplayProps {
  date: string | number | Date;
  format?: "date" | "string";
}

export function DateDisplay({ date, format = "date" }: DateDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const dateObj = new Date(date);
    setFormattedDate(format === "string" ? dateObj.toLocaleString() : dateObj.toLocaleDateString());
  }, [date, format]);

  if (!mounted) {
    return null;
  }

  return <>{formattedDate}</>;
}
