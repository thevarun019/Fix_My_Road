import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Search, Layers, RefreshCw, X } from 'lucide-react';
import L from 'leaflet';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number, autoAddress?: string, autoPincode?: string) => void;
  onGpsClick?: () => void;
  gpsLoading?: boolean;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    postcode?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
  };
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  onGpsClick,
  gpsLoading
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [locatingLive, setLocatingLive] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Custom marker icon that doesn't rely on external PNG files
  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-road-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="position: absolute; width: 40px; height: 40px; background: rgba(255, 153, 51, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background: #000080; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 2.5px solid white;">
            <div style="transform: rotate(45deg); width: 12px; height: 12px; background: #FF9933; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  // Reverse geocoding helper using BigDataCloud + OpenStreetMap fallback
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    // 1. Try BigDataCloud reverse geocode client API
    try {
      const resp = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (resp.ok) {
        const data = await resp.json();
        const parts: string[] = [];
        if (data.locality) parts.push(data.locality);
        if (data.city && data.city !== data.locality) parts.push(data.city);

        const admin = data.localityInfo?.administrative || [];
        for (const a of admin) {
          if (a.name && a.name !== 'India' && !parts.includes(a.name)) {
            parts.push(a.name);
          }
        }
        if (data.principalSubdivision && !parts.includes(data.principalSubdivision)) {
          parts.push(data.principalSubdivision);
        }

        const address = parts.length > 0
          ? parts.join(', ')
          : `Road Location at ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
        const pincode = data.postcode || '';

        setSearchQuery(address);
        onLocationChange(lat, lng, address, pincode);
        return;
      }
    } catch (err) {
      console.warn('[Reverse Geocode 1 Error]:', err);
    }

    // 2. Try Nominatim Reverse Geocoding
    try {
      const nomResp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (nomResp.ok) {
        const nomData = await nomResp.json();
        const fullAddress = nomData.display_name || '';
        const pincode = nomData.address?.postcode || '';
        setSearchQuery(fullAddress);
        onLocationChange(lat, lng, fullAddress, pincode);
        return;
      }
    } catch (err) {
      console.warn('[Reverse Geocode 2 Error]:', err);
    }

    // 3. Guaranteed Fallback
    const fallbackAddr = `Road Location (${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E)`;
    setSearchQuery(fallbackAddr);
    onLocationChange(lat, lng, fallbackAddr, '');
  }, [onLocationChange]);

  // Acquire live GPS position
  const acquireLiveLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocatingLive(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocatingLive(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { animate: true, duration: 1.2 });
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
      },
      (err) => {
        setLocatingLive(false);
        console.warn('[Live Geolocation]', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [reverseGeocode]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
    const initialLat = hasCoords ? latitude : 28.6139; // Default New Delhi
    const initialLng = hasCoords ? longitude : 77.2090;
    const initialZoom = hasCoords ? 17 : 12;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true
    });

    // Default tile: OpenStreetMap
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Create Draggable Pin
    const marker = L.marker([initialLat, initialLng], {
      icon: createCustomIcon(),
      draggable: true
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationChange(pos.lat, pos.lng, `Road Location (${pos.lat.toFixed(5)}° N, ${pos.lng.toFixed(5)}° E)`);
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng, `Road Location (${e.latlng.lat.toFixed(5)}° N, ${e.latlng.lng.toFixed(5)}° E)`);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    setMapLoaded(true);

    // Invalidate map size after rendering to avoid grey or cut-off tiles
    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);
    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 600);

    // Auto-acquire GPS if no coordinates provided initially
    if (!hasCoords) {
      acquireLiveLocation();
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map and marker if props change from outside
  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number' && mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - latitude) > 0.0001 || Math.abs(currentPos.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.setView([latitude, longitude], 17);
      }
    }
  }, [latitude, longitude]);

  // Toggle Map Type (Roadmap vs Satellite)
  const toggleMapType = (type: 'roadmap' | 'satellite') => {
    if (!mapInstanceRef.current) return;
    setMapType(type);

    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }

    if (type === 'satellite') {
      currentTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18
        }
      ).addTo(mapInstanceRef.current);
    } else {
      currentTileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }
  };

  // Search input handler with Nominatim
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=in&addressdetails=1&limit=5`
        );
        if (resp.ok) {
          const data = await resp.json();
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.warn('[Search error]', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // Select place from search dropdown
  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const fullAddress = result.display_name;
    const pincode = result.address?.postcode || '';

    setSearchQuery(fullAddress);
    setShowDropdown(false);
    setSearchResults([]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, { animate: true, duration: 1.2 });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    onLocationChange(lat, lng, fullAddress, pincode);
  };

  const handleManualGps = () => {
    acquireLiveLocation();
    if (onGpsClick) onGpsClick();
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Bar with Live Places Autocomplete */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          {isSearching ? (
            <RefreshCw className="w-4 h-4 text-saffron animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-saffron" />
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchResults.length > 0) setShowDropdown(true);
          }}
          placeholder="Search street, colony, metro station, or landmark..."
          className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white shadow-sm focus:ring-2 focus:ring-saffron focus:border-saffron font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setShowDropdown(false);
            }}
            className="absolute inset-y-0 right-14 pr-2 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[10px] font-bold text-gray-400">
          GPS Map
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto divide-y divide-gray-100">
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-orange-50 transition-colors flex items-start space-x-2.5"
              >
                <MapPin className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-navy line-clamp-1">
                    {item.display_name.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    {item.display_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Map Box */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-100">
        <div ref={mapContainerRef} className="w-full h-80 z-0" />

        {(!mapLoaded || locatingLive || gpsLoading) && (
          <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-10">
            <RefreshCw className="w-7 h-7 text-saffron animate-spin" />
            <span className="text-xs sm:text-sm font-bold text-navy">
              {locatingLive || gpsLoading ? 'Acquiring Your Live GPS Location...' : 'Loading Interactive Map...'}
            </span>
          </div>
        )}

        {/* Top Controls: Map Type Toggle (Roadmap vs Satellite) */}
        <div className="absolute top-3 left-3 z-10 flex bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-gray-200">
          <button
            type="button"
            onClick={() => toggleMapType('roadmap')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'roadmap' ? 'bg-navy text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Roadmap
          </button>
          <button
            type="button"
            onClick={() => toggleMapType('satellite')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mapType === 'satellite' ? 'bg-navy text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Satellite HD
          </button>
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleManualGps}
          disabled={locatingLive || gpsLoading}
          className="absolute top-3 right-3 z-10 bg-white hover:bg-orange-50 text-navy font-bold text-xs px-3.5 py-2 rounded-xl shadow-md border border-gray-200 flex items-center space-x-1.5 transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 text-saffron ${locatingLive || gpsLoading ? 'animate-spin' : ''}`} />
          <span>{locatingLive || gpsLoading ? 'Locating...' : 'My Live GPS'}</span>
        </button>

        {/* Live Coordinates Pill */}
        <div className="absolute bottom-3 left-3 z-10 bg-black/80 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-mono shadow">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {typeof latitude === 'number' && typeof longitude === 'number' ? (
              `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E (Live)`
            ) : (
              'Waiting for Live Location...'
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 italic px-1">
        <span>* Drag the pin or click anywhere on the road to pinpoint the road hazard spot.</span>
        <span className="font-semibold text-emerald-700 not-italic">✓ Live GPS Enforced</span>
      </div>
    </div>
  );
};
