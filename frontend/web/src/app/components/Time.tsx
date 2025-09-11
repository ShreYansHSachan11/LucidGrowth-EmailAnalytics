"use client";

import { useEffect, useState } from "react";

export default function Time({ value }: { value?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setTime(new Date(value).toLocaleString());
    }
  }, [value]);

  if (!time) return null; // renders nothing on server, avoids mismatch

  return <>{time}</>;
}
