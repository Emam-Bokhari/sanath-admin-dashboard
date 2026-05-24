// components/dashboard/ActiveListings/ActiveListings.tsx
import { Building2, ChevronDown, Eye, ListFilter, MapPin, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../../../../lib/utils";
import { useGetAllListingsQuery } from "../../../../redux/features/listings/listingsApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";

export const LISTING_STATUS = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  SOLD: "SOLD",
} as const;

export type LISTING_STATUS = typeof LISTING_STATUS[keyof typeof LISTING_STATUS];

type StatusFilter = "All" | LISTING_STATUS;

interface PropertyListing {
  _id: string;
  title: string;
  views: number;
  location?: { address?: string };
  city?: string;
  agentId?: { name?: string; agencyName?: string };
  askingPrice: number;
  status: LISTING_STATUS;
  photos?: string[];
}

// ─── Config ──────────────────────────────────────────────
const statusConfig: Record<LISTING_STATUS, { cls: string; dot: string; label: string }> = {
  [LISTING_STATUS.PUBLISHED]: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", label: "Published" },
  [LISTING_STATUS.PENDING_APPROVAL]: { cls: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500", label: "Pending" },
  [LISTING_STATUS.SOLD]: { cls: "bg-blue-50 text-blue-700 border border-blue-200", dot: "bg-blue-500", label: "Sold" },
  [LISTING_STATUS.REJECTED]: { cls: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500", label: "Rejected" },
  [LISTING_STATUS.DRAFT]: { cls: "bg-gray-100 text-gray-500 border border-gray-200", dot: "bg-gray-400", label: "Draft" },
};

const ALL_FILTERS: StatusFilter[] = [
  "All",
  LISTING_STATUS.DRAFT,
  LISTING_STATUS.PENDING_APPROVAL,
  LISTING_STATUS.PUBLISHED,
  LISTING_STATUS.REJECTED,
  LISTING_STATUS.SOLD,
];

// ─── Sub-components ───────────────────────────────────────
const StatusBadge = ({ status }: { status: LISTING_STATUS }) => {
  const cfg = statusConfig[status];
  if (!cfg) return null;
  const { cls, dot, label } = cfg;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold", cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />
      {label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────
const ActiveListings = () => {
  const [selected, setSelected] = useState<StatusFilter>("All");
  const [open, setOpen]         = useState(false);
  const dropRef                 = useRef<HTMLDivElement>(null);

  const { data: listingsData, isLoading } = useGetAllListingsQuery({
    limit: 5,
    status: selected !== "All" ? selected : undefined,
  });

  const listings: PropertyListing[] = listingsData?.data ?? [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 my-2">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recent Property Listings</h2>
          <p className="text-sm text-gray-400 mt-0.5">Recent high-performing properties</p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ListFilter className="w-4 h-4" />
            {selected === "All" ? "Filter" : statusConfig[selected]?.label || selected}
            {selected !== "All" && (
              <span
                className="hover:bg-white/20 rounded-full p-0.5 animate-in fade-in zoom-in duration-200"
                onClick={(e) => { e.stopPropagation(); setSelected("All"); }}
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-100 shadow-lg z-20 py-1 overflow-hidden">
              {ALL_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelected(s); setOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors",
                    selected === s
                      ? "bg-blue-50 text-blue-900 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      s === "All" ? "bg-slate-300" : statusConfig[s]?.dot
                    )}
                  />
                  {s === "All" ? "All" : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100">
            {["Property", "Location", "Agent", "Price", "Status"].map((h) => (
              <TableHead key={h} className="text-gray-400 font-semibold uppercase text-xs tracking-wider py-3">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-gray-400 text-sm animate-pulse">
                Loading listings...
              </TableCell>
            </TableRow>
          ) : listings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                No listings match the selected filter.
              </TableCell>
            </TableRow>
          ) : (
            listings.map((listing) => (
              <TableRow key={listing._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                {/* Property */}
                <TableCell className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0B3C6D]/5 flex items-center justify-center overflow-hidden">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img
                          src={`${import.meta.env.VITE_IMAGE_BASE_URL}${listing.photos[0]}`}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placeholder.com/150?text=House";
                          }}
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-[#0B3C6D]/60" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{listing.title}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Eye className="w-3 h-3" />
                        {(listing.views || 0).toLocaleString()} views
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell className="py-5">
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {listing.location?.address || listing.city || "Unknown"}
                  </span>
                </TableCell>

                {/* Agent */}
                <TableCell className="py-5 text-sm text-gray-600">
                  {listing.agentId?.name || "Unknown"}
                </TableCell>

                {/* Price */}
                <TableCell className="py-5">
                  <span className="text-sm font-bold text-gray-900">
                    £{(listing.askingPrice || 0).toLocaleString()}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="py-5">
                  <StatusBadge status={listing.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActiveListings;