"use client";

import { useState } from "react";

interface BrandLogoProps {
  domain?: string;
  name: string;
  size?: number;
}

export default function BrandLogo({ domain, name, size = 24 }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (!domain || failed) {
    return null;
  }

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const logoUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${cleanDomain}&size=128`;

  return (
    <img
      src={logoUrl}
      alt={`${name} logo`}
      width={size}
      height={size}
      className="rounded-md shrink-0 object-contain bg-white"
      onError={() => setFailed(true)}
    />
  );
}
