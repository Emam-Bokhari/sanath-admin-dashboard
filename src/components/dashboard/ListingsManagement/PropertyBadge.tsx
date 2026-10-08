import { cn } from "../../../lib/utils";
import type { IBadge } from "../../../types/listing.types";

export interface BadgeConfig {
  priority: number;
  label: string;
  cls: string;
  isVisual: boolean;
}

export const BADGE_CONFIG: Record<string, BadgeConfig> = {
  SOLD_STC: {
    priority: 1,
    label: "SOLD STC",
    cls: "bg-[#a5b4fc] text-[#0f172a] font-bold",
    isVisual: true,
  },
  SOLD: {
    priority: 1,
    label: "SOLD",
    cls: "bg-rose-600 text-white font-bold",
    isVisual: true,
  },
  REDUCED_TODAY: {
    priority: 2,
    label: "Reduced Today",
    cls: "bg-amber-500 text-white font-bold",
    isVisual: true,
  },
  BACK_ON_MARKET: {
    priority: 3,
    label: "Back on Market",
    cls: "bg-sky-600 text-white font-bold",
    isVisual: true,
  },
  RECENTLY_RELISTED: {
    priority: 3,
    label: "Recently Relisted",
    cls: "bg-purple-600 text-white font-bold",
    isVisual: true,
  },
  PRICE_REDUCED: {
    priority: 4,
    label: "Price Reduced",
    cls: "bg-orange-600 text-white font-bold",
    isVisual: true,
  },
  ADDED_TODAY: {
    priority: 5,
    label: "Added today",
    cls: "",
    isVisual: false,
  },
  ADDED_YESTERDAY: {
    priority: 5,
    label: "Added yesterday",
    cls: "",
    isVisual: false,
  },
  ADDED_LAST_7_DAYS: {
    priority: 5,
    label: "Added recently",
    cls: "",
    isVisual: false,
  },
  NEW: {
    priority: 6,
    label: "NEW",
    cls: "bg-emerald-600 text-white font-bold",
    isVisual: true,
  },
  FEATURED: {
    priority: 7,
    label: "Featured",
    cls: "bg-[#1a3c6e] text-white font-bold",
    isVisual: true,
  },
};

export const VISUAL_BADGE_CODES: string[] = Object.keys(BADGE_CONFIG).filter(
  (k) => BADGE_CONFIG[k].isVisual
);

export function formatUKDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function isToday(dateInput?: string | Date | null): boolean {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export function isYesterday(dateInput?: string | Date | null): boolean {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Extracts and sorts all active VISUAL badges for a listing.
 * Strict Rule: ADDED_TODAY, ADDED_YESTERDAY, ADDED_LAST_7_DAYS are never included.
 */
export function getVisualBadges(listing: any): IBadge[] {
  if (!listing) return [];
  const map = new Map<string, IBadge>();

  // 1. Badges array from API
  if (Array.isArray(listing.badges)) {
    for (const b of listing.badges) {
      const code = b?.code?.toUpperCase?.() || b?.code;
      if (code && BADGE_CONFIG[code]?.isVisual) {
        map.set(code, {
          code,
          label: b.label || BADGE_CONFIG[code].label,
        });
      }
    }
  }

  // 2. primaryBadge from API
  if (listing.primaryBadge?.code) {
    const code = listing.primaryBadge.code.toUpperCase();
    if (BADGE_CONFIG[code]?.isVisual && !map.has(code)) {
      map.set(code, {
        code,
        label: listing.primaryBadge.label || BADGE_CONFIG[code].label,
      });
    }
  }

  // 3. marketStatus field (e.g. "SOLD_STC" or "SOLD")
  if (listing.marketStatus) {
    const statusUpper = String(listing.marketStatus).toUpperCase();
    if (statusUpper === "SOLD_STC" && !map.has("SOLD_STC")) {
      map.set("SOLD_STC", { code: "SOLD_STC", label: BADGE_CONFIG.SOLD_STC.label });
    } else if (statusUpper === "SOLD" && !map.has("SOLD")) {
      map.set("SOLD", { code: "SOLD", label: BADGE_CONFIG.SOLD.label });
    }
  }

  // 4. isFeatured or featured
  if ((listing.isFeatured || listing.featured) && !map.has("FEATURED")) {
    map.set("FEATURED", { code: "FEATURED", label: BADGE_CONFIG.FEATURED.label });
  }

  // Sort by priority (Priority 1 is highest)
  return Array.from(map.values()).sort(
    (a, b) =>
      (BADGE_CONFIG[a.code]?.priority ?? 99) -
      (BADGE_CONFIG[b.code]?.priority ?? 99)
  );
}

/**
 * Returns the Market Activity Date as clean plain text with no background color or border.
 */
export function getMarketActivityDate(listing: any): string {
  if (!listing) return "";

  const codes = new Set<string>();
  if (Array.isArray(listing.badges)) {
    listing.badges.forEach((b: any) => {
      if (b?.code) codes.add(String(b.code).toUpperCase());
    });
  }
  if (listing.primaryBadge?.code) {
    codes.add(String(listing.primaryBadge.code).toUpperCase());
  }

  // 1. Reduced Today
  if (
    codes.has("REDUCED_TODAY") ||
    (listing.lastPriceReducedAt && isToday(listing.lastPriceReducedAt))
  ) {
    return "Reduced today";
  }

  // 2. Price Reduced
  if (listing.lastPriceReducedAt) {
    return isToday(listing.lastPriceReducedAt)
      ? "Reduced today"
      : `Reduced ${formatUKDate(listing.lastPriceReducedAt)}`;
  }
  if (codes.has("PRICE_REDUCED")) {
    return "Price reduced";
  }

  // 3. Back on market
  if (listing.backOnMarketAt) {
    return isToday(listing.backOnMarketAt)
      ? "Back on market today"
      : `Back on market ${formatUKDate(listing.backOnMarketAt)}`;
  }
  if (codes.has("BACK_ON_MARKET")) {
    return "Back on market";
  }

  // 4. Relisted
  if (listing.relistedAt) {
    return isToday(listing.relistedAt)
      ? "Relisted today"
      : `Relisted ${formatUKDate(listing.relistedAt)}`;
  }
  if (codes.has("RECENTLY_RELISTED")) {
    return "Recently relisted";
  }

  // 5. Added Today
  const publishedDate = listing.firstPublishedAt || listing.createdAt;
  if (codes.has("ADDED_TODAY") || (publishedDate && isToday(publishedDate))) {
    return "Added today";
  }

  // 6. Added Yesterday
  if (codes.has("ADDED_YESTERDAY") || (publishedDate && isYesterday(publishedDate))) {
    return "Added yesterday";
  }

  // 7. Default: Added DD/MM/YYYY
  if (publishedDate) {
    return `Added ${formatUKDate(publishedDate)}`;
  }

  return "";
}

/**
 * Visual badge component for rendering a single badge pill.
 */
export const PropertyBadge: React.FC<{
  badge: IBadge | { code: string; label?: string };
  size?: "sm" | "md";
  className?: string;
}> = ({ badge, size = "md", className }) => {
  const code = String(badge.code).toUpperCase();
  const config = BADGE_CONFIG[code];

  // Strictly enforce: never render non-visual badges as pills
  if (!config || !config.isVisual) return null;

  const label = badge.label || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center shrink-0 shadow-2xs transition-all",
        size === "sm"
          ? "px-2 py-0.5 rounded text-[10px] leading-tight"
          : "px-2.5 py-0.5 rounded-md text-[11px] leading-tight",
        config.cls,
        className
      )}
    >
      {label}
    </span>
  );
};

/**
 * Renders all active visual badges for a given listing.
 */
export const PropertyBadgesList: React.FC<{
  listing: any;
  size?: "sm" | "md";
  className?: string;
  limit?: number;
}> = ({ listing, size = "md", className, limit }) => {
  const badges = getVisualBadges(listing);
  if (!badges.length) return null;

  const displayBadges = limit ? badges.slice(0, limit) : badges;

  return (
    <div className={cn("inline-flex items-center gap-1.5 flex-wrap", className)}>
      {displayBadges.map((b) => (
        <PropertyBadge key={b.code} badge={b} size={size} />
      ))}
    </div>
  );
};

/**
 * Market Activity Date display - clean plain text, NO background, NO border.
 */
export const MarketActivityDate: React.FC<{
  listing: any;
  className?: string;
}> = ({ listing, className }) => {
  const text = getMarketActivityDate(listing);
  if (!text) return null;

  return (
    <span className={cn("text-xs text-slate-500 font-normal select-none", className)}>
      {text}
    </span>
  );
};

/**
 * Price display with strikethrough original price if originalPrice > askingPrice.
 */
export const PriceWithReduction: React.FC<{
  askingPrice?: number;
  originalPrice?: number;
  className?: string;
  priceClassName?: string;
  strikeClassName?: string;
}> = ({
  askingPrice,
  originalPrice,
  className,
  priceClassName = "font-bold text-gray-900",
  strikeClassName = "text-xs text-slate-400 line-through font-normal",
}) => {
  const hasReduction = !!(
    originalPrice &&
    askingPrice &&
    originalPrice > askingPrice
  );

  return (
    <div className={cn("flex items-baseline gap-1.5 flex-wrap", className)}>
      <span className={priceClassName}>
        £{(askingPrice || 0).toLocaleString()}
      </span>
      {hasReduction && (
        <span className={strikeClassName}>
          £{originalPrice!.toLocaleString()}
        </span>
      )}
    </div>
  );
};
