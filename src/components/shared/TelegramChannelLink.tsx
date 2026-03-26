import React from "react";
import Link from "next/link";
import { FaTelegram } from "react-icons/fa";

import { cn } from "@/lib/utils";

type TelegramChannelLinkProps = {
  className?: string;
  label?: string;
};

const TELEGRAM_URL = "https://t.me/blipbotlive";

const TelegramChannelLink = ({
  className,
  label = "telegram channel",
}: TelegramChannelLinkProps) => {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-sm blue-border px-1 py-0 align-middle transition-all duration-200 hover:bg-blue-500/10 hover:text-blue-500",
        className
      )}
      href={TELEGRAM_URL}
      target="_blank"
    >
      <FaTelegram />
      <span>{label}</span>
    </Link>
  );
};

export default TelegramChannelLink;
