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
      <div className="h-full w-full bg-gradient-to-br from-[var(--color-linen)] via-[var(--color-surface)] to-[var(--color-linen)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-navy)] text-[var(--color-amber)] flex items-center justify-center shadow-sm mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
          Nav Durga Ispat Pvt. Ltd. — Raipur
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-md mt-1 leading-relaxed">
          {locations[0]?.address || FALLBACK_HEAD_OFFICE_ADDRESS}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="nd-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
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
      <div className="h-full w-full bg-[var(--color-linen)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-navy)] flex items-center justify-center mb-2.5 shadow-2xs">
          <MapPin className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-xs font-bold text-[var(--color-navy)]">
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
              background={isSelected ? '#14213D' : '#46536A'}
              borderColor="#FFB020"
              glyphColor={isSelected ? '#FFB020' : '#F1ECE3'}
              scale={isSelected ? 1.15 : 1}
            />
          </AdvancedMarker>
        );
      })}

      {infoOpen && marker && activePin && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={() => setInfoOpen(false)}>
          <div className="p-1 space-y-1 text-[#14213D]">
            <div className="text-xs font-extrabold text-[#14213D]">{activePin.title}</div>
            <div className="text-[11px] text-[#46536A] leading-snug">
              {activePin.formattedAddress || activePin.address}
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                activePin.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#14213D] hover:underline pt-0.5"
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
      className="bg-[var(--color-surface)] border-t border-[var(--color-border)] nd-section-py scroll-mt-20"
    >
      <div className="nd-container space-y-8 xl:space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 xl:gap-6">
          <div className="max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--color-navy)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-amber)]" />
              <span>Registered Plant &amp; Office Location</span>
            </span>
            <h2 className="font-display nd-h2-section font-extrabold text-[var(--color-navy)] tracking-tight">
              Our Presence
            </h2>
            <p className="nd-lead text-[var(--color-text-secondary)]">
              Rooted in Raipur, Chhattisgarh, with a presence in the steel industry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="nd-btn-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => onOpenQuoteModal('Structural Steel Enquiry — Raipur', '')}
              className="nd-btn-primary inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <span>Connect With Sales</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
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
                        ? 'bg-[var(--color-navy)] border-[var(--color-amber)] text-[var(--color-linen)] shadow-xs'
                        : 'bg-[var(--color-linen)] border-[var(--color-border)] hover:border-[var(--color-navy)] text-[var(--color-navy)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div
                          className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider ${
                            isSelected ? 'text-[var(--color-amber)]' : 'text-[var(--color-navy)]'
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{loc.title}</span>
                        </div>
                        <div
                          className={`font-display text-lg font-extrabold ${
                            isSelected ? 'text-white' : 'text-[var(--color-navy)]'
                          }`}
                        >
                          Nav Durga Ispat Pvt. Ltd.
                        </div>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isSelected ? 'text-[var(--color-linen)]/90' : 'text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {loc.address}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                        isSelected
                          ? 'border-[var(--color-linen)]/15 text-[var(--color-linen)]/85'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 font-semibold ${
                          isSelected ? 'text-[var(--color-linen)]' : 'text-[var(--color-navy)]'
                        }`}
                      >
                        <Phone
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-[var(--color-amber)]' : 'text-[var(--color-navy)]'
                          }`}
                        />
                        {loc.phone || cms.contactPhone}
                      </span>
                      {loc.notes && (
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            isSelected ? 'text-[var(--color-amber)]' : 'text-[var(--color-navy)]'
                          }`}
                        >
                          {loc.notes}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-linen)] p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--color-navy)]">
                <ShieldCheck className="w-4 h-4 text-[var(--color-navy)]" />
                <span>Urla Industrial Area Presence</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Serving industrial buyers, structural fabricators, and infrastructure contractors directly from Urla Industrial Area, Raipur, Chhattisgarh.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-bold">
                <a
                  href={mapsSearchHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--color-navy)] hover:underline underline-offset-4"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[var(--color-amber)]" />
                </a>
                <span className="text-[var(--color-border)]">•</span>
                <span className="text-[var(--color-navy)]">{cms.dispatchHours}</span>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Container */}
          <div className="lg:col-span-7">
            <div className="h-[340px] sm:h-[420px] lg:h-full lg:min-h-[460px] min-[1920px]:min-h-[540px] w-full rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-xs bg-[var(--color-linen)]">
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
                <div className="h-full w-full bg-gradient-to-br from-[var(--color-linen)] via-[var(--color-surface)] to-[var(--color-linen)] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-navy)] text-[var(--color-amber)] flex items-center justify-center shadow-sm mb-3">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-[var(--color-navy)]">
                    Nav Durga Ispat Pvt. Ltd. — Urla Industrial Area
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] max-w-md mt-1 leading-relaxed">
                    {activeLocation?.address || verifiedAddress}
                  </p>
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nd-btn-primary mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
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
