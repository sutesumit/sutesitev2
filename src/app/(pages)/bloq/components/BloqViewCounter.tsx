"use client";

import ViewCounter from "@/components/shared/ViewCounter";

interface BloqViewCounterProps {
    slug: string;
    className?: string;
}

export default function BloqViewCounter({ slug, className }: BloqViewCounterProps) {
    return <ViewCounter type="bloq" identifier={slug} className={className} />;
}
