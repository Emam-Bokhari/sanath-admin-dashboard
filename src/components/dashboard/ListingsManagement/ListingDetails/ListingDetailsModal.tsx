import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "../../../ui/dialog";
import { MapPin, Eye, Home, Bath, Maximize, Tag, Calendar, User, FileText, CheckCircle2, ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import ListingStatusBadge from "../ListingStatusBadge";
import { useGetListingByIdQuery } from "../../../../redux/features/listings/listingsApi";
import { PropertyBadgesList, MarketActivityDate, formatUKDate } from "../PropertyBadge";

interface Props {
  listing: any | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}



function ImageSlider({ images, title }: { images: string[], title: string }) {
  const [active, setActive] = React.useState(0);
  if (!images || !images.length) return null;
  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1));
  return (
    <div className="space-y-2">
      <div className="relative w-full h-56 sm:h-80 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={`${import.meta.env.VITE_IMAGE_BASE_URL}${images[active]}`}
          alt={`${title} - photo ${active + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placeholder.com/800x400?text=No+Image+Available"; }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#1447e6',
                border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronLeft size={18} color="#fff" strokeWidth={3} />
            </button>

            <button
              onClick={next}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#1447e6',
                border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronRight size={18} color="#fff" strokeWidth={3} />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === active ? "border-blue-600" : "border-transparent opacity-60 hover:opacity-100"
                }`}
            >
              <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}${src}`} alt={`thumb-${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-gray-500">
        <Icon className="w-4 h-4" />
        <span className="text-[13px]">{label}</span>
      </div>
      <span className="text-[13px] font-semibold text-gray-900 text-right">{value || "N/A"}</span>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl py-3 px-2 text-center border border-gray-100">
      <Icon className="text-blue-600 w-5 h-5 mb-1.5" />
      <span className="text-[15px] font-bold text-gray-900">{value}</span>
      <span className="text-[11px] text-gray-400 mt-0.5">{label}</span>
    </div>
  );
}

const ListingDetailsModal: React.FC<Props> = ({ listing, isOpen, onClose }) => {
  const { data, isLoading } = useGetListingByIdQuery(listing?._id, { skip: !isOpen || !listing?._id });
  const detail = data?.data;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="min-w-250 w-full max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 text-left flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <DialogTitle className="text-lg font-bold text-gray-900 truncate">
                {detail?.title || "Listing Details"}
              </DialogTitle>
              {detail && <PropertyBadgesList listing={detail} />}
            </div>
            <DialogDescription className="text-xs text-gray-500">
              Review property information and market status
            </DialogDescription>
          </div>
          {detail && <ListingStatusBadge status={detail.status} />}
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 text-sm animate-pulse">Loading listing details...</div>
          ) : !detail ? (
            <div className="py-20 text-center text-red-500 text-sm">Failed to load listing.</div>
          ) : (
            <div className="space-y-6">
              {/* Images */}
              {detail.photos && detail.photos.length > 0 ? (
                <ImageSlider images={detail.photos} title={detail.title} />
              ) : (
                <div className="w-full h-40 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" /> No images available
                  </p>
                </div>
              )}

              {/* Price & Basic Info */}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <p className="text-2xl font-bold text-gray-900">£{detail.askingPrice?.toLocaleString()}</p>
                    {detail.originalPrice && detail.originalPrice > detail.askingPrice && (
                      <span className="text-base text-gray-400 line-through font-normal">
                        £{detail.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <MarketActivityDate listing={detail} className="text-xs text-slate-500 font-medium block mt-0.5" />
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {detail.location?.address || `${detail.city}, ${detail.country}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Eye className="w-4 h-4" /> {detail.views || 0} views
                  </span>
                  <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-wider">
                    {detail.listingType}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Property Stats</h4>
                <div className="grid grid-cols-4 gap-3">
                  <StatTile icon={Home} label="Bedrooms" value={detail.propertyBedrooms || "-"} />
                  <StatTile icon={Bath} label="Bathrooms" value={detail.propertyBathrooms || "-"} />
                  <StatTile icon={Maximize} label="Sq Ft" value={detail.propertySquareFoot?.toLocaleString() || "-"} />
                  <StatTile icon={Tag} label="EPC" value={detail.epcEnergyRating?.label || "-"} />
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Property Information</h4>
                <div className="bg-gray-50 rounded-xl px-4 py-1 border border-gray-100">
                  <InfoRow icon={Home} label="Property Type" value={detail.propertyType} />
                  <InfoRow icon={Tag} label="Market Status" value={detail.marketStatus || detail.primaryBadge?.label || "Available"} />
                  {detail.originalPrice && detail.originalPrice > detail.askingPrice && (
                    <InfoRow icon={Tag} label="Original Price" value={`£${detail.originalPrice.toLocaleString()}`} />
                  )}
                  {detail.lastPriceReducedAt && (
                    <InfoRow icon={Calendar} label="Price Reduced On" value={formatUKDate(detail.lastPriceReducedAt)} />
                  )}
                  {detail.relistedAt && (
                    <InfoRow icon={Calendar} label="Relisted On" value={formatUKDate(detail.relistedAt)} />
                  )}
                  {detail.backOnMarketAt && (
                    <InfoRow icon={Calendar} label="Back on Market On" value={formatUKDate(detail.backOnMarketAt)} />
                  )}
                  <InfoRow icon={Tag} label="Tenure" value={detail.tenure} />
                  <InfoRow icon={FileText} label="Council Tax Band" value={detail.councilTaxBand} />
                  <InfoRow icon={Calendar} label="Listed Date" value={formatUKDate(detail.firstPublishedAt || detail.createdAt)} />
                  <InfoRow icon={User} label="Leads Generated" value={detail.leadsCount || 0} />
                </div>
              </div>

              {/* Price Reduction History */}
              {detail.priceHistory && detail.priceHistory.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Reduction History</h4>
                  <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="py-2.5 px-4 text-left font-semibold text-gray-500">Date</th>
                          <th className="py-2.5 px-4 text-right font-semibold text-gray-500">Previous Price</th>
                          <th className="py-2.5 px-4 text-right font-semibold text-gray-500">New Price</th>
                          <th className="py-2.5 px-4 text-right font-semibold text-gray-500">Reduction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detail.priceHistory.map((item: any, idx: number) => {
                          const prev = item.previousPrice;
                          const next = item.newPrice;
                          const diff = item.difference ?? (prev && next ? prev - next : 0);
                          const pct = item.percentageReduced ?? (prev && next ? Math.round(((prev - next) / prev) * 100) : 0);
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="py-2.5 px-4 text-gray-700 font-medium">{formatUKDate(item.changedAt)}</td>
                              <td className="py-2.5 px-4 text-right text-gray-400 line-through">£{prev?.toLocaleString()}</td>
                              <td className="py-2.5 px-4 text-right font-semibold text-gray-900">£{next?.toLocaleString()}</td>
                              <td className="py-2.5 px-4 text-right font-semibold text-amber-600">
                                -{pct}% {diff > 0 && <span className="text-[11px] font-normal text-gray-400 ml-1">(£{diff.toLocaleString()})</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Agent & Agency Info */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Agent & Agency</h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row gap-6">
                  {/* Agent */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                      {detail.agentId?.profileImage ? (
                        <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}${detail.agentId.profileImage}`} className="w-full h-full object-cover" />
                      ) : <User className="w-6 h-6 m-3 text-gray-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{detail.agentId?.name || "Unknown Agent"}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {detail.agentId?.email}</p>
                      {detail.agentId?.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {detail.agentId.phone}</p>}
                    </div>
                  </div>
                  {/* Agency */}
                  <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center p-1.5">
                      {detail.agentId?.agencyLogo ? (
                        <img src={`${import.meta.env.VITE_IMAGE_BASE_URL}${detail.agentId.agencyLogo}`} className="max-w-full max-h-full object-contain" />
                      ) : <Home className="w-6 h-6 text-gray-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{detail.agentId?.agencyName || "No Agency"}</p>
                      <p className="text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-blue-100">Agency</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Videos */}
              {detail.videos && detail.videos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Videos</h4>
                  <div className="flex flex-col gap-4 w-full">
                    {detail.videos.map((vid: string, idx: number) => (
                      <div key={idx} className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden bg-black shadow-inner border border-gray-100">
                        <video src={`${import.meta.env.VITE_IMAGE_BASE_URL}${vid}`} controls className="w-full h-full object-cover rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor Plans */}
              {detail.floorPlans && detail.floorPlans.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Floor Plans</h4>
                  <div className="border border-gray-100 p-2 rounded-xl bg-gray-50">
                    <ImageSlider images={detail.floorPlans} title="Floor Plan" />
                  </div>
                </div>
              )}

              {/* Features */}
              {detail.features && detail.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.features.map((f: string) => (
                      <span key={f} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {detail.description && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {detail.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailsModal;