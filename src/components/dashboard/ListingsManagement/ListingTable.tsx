import React, { useState } from "react";
import ListingDetailsModal from "./ListingDetails/ListingDetailsModal";
import ListingStatusBadge from "./ListingStatusBadge";
import { PropertyBadgesList, MarketActivityDate, PriceWithReduction } from "./PropertyBadge";

import { Check, Eye, Trash, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { useChangeListingStatusMutation } from "../../../redux/features/listings/listingsApi";

const HEADERS = ["PROPERTY", "AGENT", "PRICE", "TYPE", "STATS", "STATUS", "ACTIONS"];

interface Props {
    listings: any[];
    isLoading?: boolean;
}

const ListingTable: React.FC<Props> = ({ listings, isLoading }) => {
    const [selectedListing, setSelectedListing] = useState<any | null>(null);
    const navigate = useNavigate();
    const [changeStatus] = useChangeListingStatusMutation();

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await changeStatus({ id, status }).unwrap();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {isLoading ? (
                <p className="text-center py-12 text-gray-400 text-sm">Loading listings...</p>
            ) : listings.length === 0 ? (
                <p className="text-center py-12 text-gray-400 text-sm">No listings found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                {HEADERS.map(h => (
                                    <th key={h} className={`w-[14.28%] text-[10.5px] font-semibold text-gray-400 tracking-widest px-4 first:pl-6 last:pr-6 py-3 border-b border-gray-100 whitespace-nowrap ${h === "ACTIONS" ? "text-right" : "text-left"}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map(l =>
                                <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50/60 last:border-0">
                                    <td className="w-[14.28%] py-3.5 px-4 first:pl-6 last:pr-6">
                                        <div className="flex items-center gap-1.5 font-semibold text-[13.5px] text-gray-900 mb-1 flex-wrap">
                                            <span>{l.title}</span>
                                            <PropertyBadgesList listing={l} size="sm" />
                                        </div>
                                        <div className="flex items-center gap-1 text-[11.5px] text-gray-400 mb-1">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                            </svg>
                                            {l.location?.address || l.city}
                                        </div>
                                        <MarketActivityDate listing={l} className="text-[11px] text-slate-500 font-medium block" />
                                    </td>
                                    <td className="w-[14.28%] py-3.5 px-4 first:pl-6 last:pr-6">
                                        <p className="text-[13px] font-medium text-gray-900">{l.agentId?.name || "Unknown"}</p>
                                        <p className="text-[11px] text-gray-400">{l.agentId?.agencyName || "N/A"}</p>
                                    </td>
                                    <td className="w-[14.28%] py-3.5 px-4 first:pl-6 last:pr-6">
                                        <PriceWithReduction
                                            askingPrice={l.askingPrice}
                                            originalPrice={l.originalPrice}
                                            priceClassName="text-[13.5px] font-semibold text-gray-900"
                                            strikeClassName="text-[11.5px] text-gray-400 line-through font-normal"
                                        />
                                        {l.tenure && <p className="text-[11px] text-gray-400 mt-0.5">{l.tenure}</p>}
                                    </td>
                                    <td className="w-[14.28%] py-3.5 px-4 first:pl-6 last:pr-6">
                                        <p className="text-[13px] text-gray-800">{l.listingType}</p>
                                        <p className="text-[11px] text-gray-400">{l.propertyType}</p>
                                    </td>
                                    <td className="w-[14.28%] py-3.5 px-4 first:pl-6 last:pr-6">
                                        <p className="text-[12px] text-gray-500 flex items-center gap-1 mb-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                            </svg>
                                            {l.views || 0} views
                                        </p>
                                        <p className="text-[12px] text-gray-500 flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            {l.leadsCount || 0} leads
                                        </p>
                                    </td>
                                    <td className="w-[14.28%] py-3.5 px-4 first:pl-6 last:pr-6"><ListingStatusBadge status={l.status} /></td>
                                    <td className="w-[14.28%] py-3.5 px-4 first:pl-6 last:pr-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* View */}
                                            <Button onClick={() => { setSelectedListing(l); }} variant="ghost" size="icon" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
                                                <Eye size={20} />
                                            </Button>

                                            {/* Approve / Reject — pending only */}
                                            {l.status === "PENDING_APPROVAL" && <>
                                                <Button
                                                    onClick={() => handleStatusUpdate(l._id, "PUBLISHED")}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-green-600"
                                                >
                                                    <Check size={20} />
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate(l._id, "REJECTED")}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-7 h-7 flex items-center justify-center rounded text-red-600 hover:bg-red-50"
                                                >
                                                    <X size={14} />
                                                </Button>
                                            </>}
                                            {/* Delete */}
                                            <Button variant="ghost" size="icon" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-red-600">
                                                <Trash size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ListingDetailsModal
                listing={selectedListing}
                isOpen={!!selectedListing}
                onClose={() => setSelectedListing(null)}
                onEdit={(id) => navigate(`/listings/${id}/edit`)}
            />
        </div>
    )
};

export default ListingTable;