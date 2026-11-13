import React, { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Building2, ExternalLink, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react';
import { PresenceLocationItem, WebsiteCmsContent } from '../types';

interface PresenceMapSectionProps {
  cms: WebsiteCmsContent;
  mapsApiKey?: string;
  onOpenQuoteModal: (presetProduct?: string, presetGrade?: string) => void;
}

interface ResolvedPin {
  id: string;
  title: string;
  address: string;
  formattedAddress?: string;
  phone?: string;
  notes?: string;
  isHeadOffice?: boolean;
  location: google.maps.LatLngLiteral;
}

const FALLBACK_HEAD_OFFICE_ADDRESS =
  'Plot No. 435-A, Sector-C, Urla Industrial Area, Raipur, Chhattisgarh 493221, India';

interface PresenceMapCanvasProps {
  locations: PresenceLocationItem[];
  selectedId: string;
  onSelectId: (id: string) => void;
  directionsHref: string;
}

const PresenceMapCanvas: React.FC<PresenceMapCanvasProps> = ({
  locations,
  selectedId,
  onSelectId,
  directionsHref,
}) => {
  const apiStatus = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');
  const map = useMap();
  const [markerRef, marker] = useAdvancedMarkerRef();

  const [resolvedPins, setResolvedPins] = useState<ResolvedPin[]>([]);
  const [lookupState, setLookupState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [infoOpen, setInfoOpen] = useState(true);
  const [quotaBlocked, setQuotaBlocked] = useState<boolean>(() =>
    Boolean(typeof window !== 'undefined' && window.__ndGmpQuotaExceeded)
  );

  useEffect(() => {
    const onQuota = () => setQuotaBlocked(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  useEffect(() => {
    if (
      quotaBlocked ||
      apiStatus === APILoadingStatus.FAILED ||
      apiStatus === APILoadingStatus.AUTH_FAILURE
    ) {
      setLookupState('unavailable');
      return;
    }

    if (!placesLib || locations.length === 0) return;

    let cancelled = false;
    setLookupState('loading');

    const resolveLocations = async () => {
      try {
        const nextPins: ResolvedPin[] = [];

        for (const loc of locations) {
          const queryText = loc.isHeadOffice
            ? `Nav Durga Ispat Pvt. Ltd., ${loc.address}`
            : `${loc.title}, ${loc.address}`;

          let matchedPlace: google.maps.places.Place | undefined;

          const { places } = await placesLib.Place.searchByText({
            textQuery: queryText,
            fields: ['displayName', 'location', 'formattedAddress'],
            language: 'en',
            region: 'in',
            maxResultCount: 1,
          });
          matchedPlace = places?.[0];

          if (!matchedPlace?.location) {
            const retry = await placesLib.Place.searchByText({
              textQuery: loc.address,
              fields: ['displayName', 'location', 'formattedAddress'],
              language: 'en',
              region: 'in',
              maxResultCount: 1,
            });
            matchedPlace = retry.places?.[0];
          }

          if (matchedPlace?.location) {
            nextPins.push({
              id: loc.id,
              title: loc.title,
              address: loc.address,
              formattedAddress: matchedPlace.formattedAddress || loc.address,
              phone: loc.phone,
              notes: loc.notes,
              isHeadOffice: loc.isHeadOffice,
              location: {
                lat: matchedPlace.location.lat(),
                lng: matchedPlace.location.lng(),
              },
            });
          }
        }

        if (cancelled) return;
        if (nextPins.length > 0) {
          setResolvedPins(nextPins);
          setLookupState('ready');
        } else {
          setLookupState('unavailable');
        }
      } catch {
        if (!cancelled) {
          setLookupState('unavailable');
        }
      }
    };

    void resolveLocations();
    return () => {
      cancelled = true;
    };
  }, [placesLib, locations, apiStatus, quotaBlocked]);

  const activePin = useMemo(
    () => resolvedPins.find((p) => p.id === selectedId) || resolvedPins[0] || null,
    [resolvedPins, selectedId]
  );

  useEffect(() => {
    if (map && activePin) {
      map.panTo(activePin.location);
    }
  }, [map, activePin]);

  if (
    quotaBlocked ||
    apiStatus === APILoadingStatus.FAILED ||
    apiStatus === APILoadingStatus.AUTH_FAILURE ||
    lookupState === 'unavailable'
  ) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-[#F7F9FB] via-[#EAF2F8] to-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#105186] text-white flex items-center justify-center shadow-sm mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="font-display text-lg font-extrabold text-[#263442]">
          Nav Durga Ispat Pvt. Ltd. — Raipur
        </h3>
        <p className="text-xs text-[#737D88] max-w-md mt-1 leading-relaxed">
          {locations[0]?.address || FALLBACK_HEAD_OFFICE_ADDRESS}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions on Google Maps</span>
          </a>
        </div>
      </div>
    );
  }

  if (lookupState === 'loading' || !activePin) {
    return (
      <div className="h-full w-full bg-[#EAF2F8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-white border border-[#C7CED6] text-[#105186] flex items-center justify-center mb-2.5 shadow-2xs">
          <MapPin className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-xs font-bold text-[#0B3A60]">
          Locating Urla Industrial Area, Raipur...
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      defaultCenter={activePin.location}
      defaultZoom={15}
      gestureHandling="cooperative"
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl
      style={{ width: '100%', height: '100%' }}
    >
      {resolvedPins.map((pin) => {
        const isSelected = pin.id === activePin.id;
        return (
          <AdvancedMarker
            key={pin.id}
            ref={isSelected ? markerRef : undefined}
            position={pin.location}
            title={pin.title}
            onClick={() => {
              onSelectId(pin.id);
              setInfoOpen(true);
            }}
          >
            <Pin
              background={isSelected ? '#105186' : '#737D88'}
              borderColor="#0B3A60"
              glyphColor="#FFFFFF"
              scale={isSelected ? 1.15 : 1}
            />
          </AdvancedMarker>
        );
      })}

      {infoOpen && marker && activePin && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={() => setInfoOpen(false)}>
          <div className="p-1 space-y-1 text-[#263442]">
            <div className="text-xs font-extrabold text-[#105186]">{activePin.title}</div>
            <div className="text-[11px] text-[#263442] leading-snug">
              {activePin.formattedAddress || activePin.address}
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                activePin.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#105186] hover:underline pt-0.5"
            >
              <Navigation className="w-3 h-3" />
              <span>Directions</span>
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export const PresenceMapSection: React.FC<PresenceMapSectionProps> = ({
  cms,
  mapsApiKey,
  onOpenQuoteModal,
}) => {
  const verifiedAddress = (cms.contactAddress || FALLBACK_HEAD_OFFICE_ADDRESS).trim();
  const companyCin = cms.cinNumber || 'U24132CT1988PTC004838';
  const companyEst = cms.establishedYear || '1988';

  const locations = useMemo<PresenceLocationItem[]>(() => {
    const headOffice: PresenceLocationItem = {
      id: 'head-office-raipur',
      title: 'Head Office & Manufacturing Location',
      address: verifiedAddress,
      phone: cms.contactPhone,
      notes: `Established ${companyEst} • CIN: ${companyCin}`,
      isHeadOffice: true,
    };
    const extras = (cms.additionalLocations || []).filter(
      (loc) => Boolean(loc.title?.trim()) && Boolean(loc.address?.trim())
    );
    return [headOffice, ...extras];
  }, [verifiedAddress, cms.contactPhone, cms.additionalLocations, companyEst, companyCin]);

  const [selectedId, setSelectedId] = useState<string>('head-office-raipur');
  const activeLocation = locations.find((l) => l.id === selectedId) || locations[0];

  const effectiveApiKey = useMemo(() => {
    const viteKey = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env
      ?.VITE_GOOGLE_MAPS_API_KEY;
    return (viteKey || mapsApiKey || '').trim();
  }, [mapsApiKey]);

  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `Nav Durga Ispat Pvt. Ltd., ${activeLocation?.address || verifiedAddress}`
  )}`;

  const mapsSearchHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Nav Durga Ispat Pvt. Ltd., ${activeLocation?.address || verifiedAddress}`
  )}`;

  return (
    <section
      id="our-presence-section"
      className="bg-[#FFFFFF] border-y border-[#C7CED6] py-14 sm:py-16 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#105186]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Registered Plant &amp; Office Location</span>
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#263442] tracking-tight">
              Our Presence
            </h2>
            <p className="text-sm sm:text-base text-[#737D88] leading-relaxed">
              Rooted in Raipur, Chhattisgarh, with a presence in the steel industry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EAF2F8] hover:bg-[#d8e8f4] border border-[#105186]/25 text-[#105186] text-xs font-bold transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => onOpenQuoteModal('Structural Steel Enquiry — Raipur', '')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <span>Connect With Sales</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Verified Location Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              {locations.map((loc) => {
                const isSelected = loc.id === activeLocation.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedId(loc.id)}
                    className={`w-full text-left rounded-2xl border p-5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF2F8] border-[#105186] shadow-xs'
                        : 'bg-[#F7F9FB] border-[#C7CED6] hover:border-[#105186]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#105186]">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{loc.title}</span>
                        </div>
                        <div className="font-display text-lg font-extrabold text-[#263442]">
                          Nav Durga Ispat Pvt. Ltd.
                        </div>
                        <p className="text-xs sm:text-sm text-[#263442] leading-relaxed">
                          {loc.address}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#C7CED6]/80 flex flex-wrap items-center justify-between gap-2 text-xs text-[#737D88]">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#263442]">
                        <Phone className="w-3.5 h-3.5 text-[#105186]" />
                        {loc.phone || cms.contactPhone}
                      </span>
                      {loc.notes && (
                        <span className="font-mono text-[11px] font-semibold text-[#0B3A60]">
                          {loc.notes}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#C7CED6] bg-[#F7F9FB] p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0B3A60]">
                <ShieldCheck className="w-4 h-4 text-[#105186]" />
                <span>Urla Industrial Area Presence</span>
              </div>
              <p className="text-xs text-[#737D88] leading-relaxed">
                Serving industrial buyers, structural fabricators, and infrastructure contractors directly from Urla Industrial Area, Raipur, Chhattisgarh.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-bold">
                <a
                  href={mapsSearchHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#105186] hover:text-[#0B3A60] hover:underline"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[#C7CED6]">•</span>
                <span className="text-[#263442]">{cms.dispatchHours}</span>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Container */}
          <div className="lg:col-span-7">
            <div className="h-[360px] sm:h-[420px] w-full rounded-2xl border border-[#C7CED6] overflow-hidden shadow-xs bg-[#F7F9FB]">
              {effectiveApiKey ? (
                <APIProvider
                  apiKey={effectiveApiKey}
                  libraries={['marker', 'places']}
                  language="en"
                  region="IN"
                >
                  <PresenceMapCanvas
                    locations={locations}
                    selectedId={activeLocation.id}
                    onSelectId={setSelectedId}
                    directionsHref={directionsHref}
                  />
                </APIProvider>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#F7F9FB] via-[#EAF2F8] to-white flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#105186] text-white flex items-center justify-center shadow-sm mb-3">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-[#263442]">
                    Nav Durga Ispat Pvt. Ltd. — Urla Industrial Area
                  </h3>
                  <p className="text-xs text-[#737D88] max-w-md mt-1 leading-relaxed">
                    {activeLocation?.address || verifiedAddress}
                  </p>
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#105186] hover:bg-[#0B3A60] text-white text-xs font-bold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
