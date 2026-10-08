export type BadgeCode =
  | "SOLD_STC"
  | "SOLD"
  | "REDUCED_TODAY"
  | "BACK_ON_MARKET"
  | "RECENTLY_RELISTED"
  | "PRICE_REDUCED"
  | "ADDED_TODAY"
  | "ADDED_YESTERDAY"
  | "ADDED_LAST_7_DAYS"
  | "NEW"
  | "FEATURED";

export interface IBadge {
  code: BadgeCode | string;
  label: string;
}

export interface IPriceHistory {
  previousPrice: number;
  newPrice: number;
  difference?: number;
  percentageReduced?: number;
  changedAt: string;
}

export interface ListingDetail {
  id: number;
  featured: boolean;
  title: string;
  address: string;
  price: string;
  period: string;
  propertyType: string;
  listingType: "For Rent" | "For Sale";
  beds: number;
  baths: number;
  receptions: number;
  sqft: number;
  councilTax: string;
  tenure: string;
  epcRating: string;
  availableFrom: string;
  description: string;
  features: string[];
  agent: {
    name: string;
    agency: string;
    phone: string;
    email: string;
  };
  stats: {
    views: number;
    enquiries: number;
    saves: number;
  };
  status: "active" | "pending" | "sold" | "rejected";
  publishedDate: string;
  images: number; // count
  askingPrice?: number;
  originalPrice?: number;
  previousPrice?: number;
  priceHistory?: IPriceHistory[];
  isFeatured?: boolean;
  marketStatus?: string;
  badges?: IBadge[];
  primaryBadge?: IBadge;
  firstPublishedAt?: string;
  lastPriceReducedAt?: string;
  relistedAt?: string;
  backOnMarketAt?: string;
}