import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import L from 'leaflet';

interface GoogleDetailMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  complaintCode?: string;
}

export const GoogleDetailMap: React.FC<GoogleDetailMapProps> = ({
  latitude,
  longitude,
  address,
  complaintCode
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 16,
      zoomControl: true
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Custom vibrant pinpoint
    const customIcon = L.divIcon({
      className: 'custom-defect-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(220, 38, 38, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background: #DC2626; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 2.5px solid white;">
            <div style="transform: rotate(45deg); width: 10px; height: 10px; background: #FFFFFF; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([latitude, longitude], {
      icon: customIcon,
      title: complaintCode || 'Grievance Location'
    }).addTo(map);

    if (complaintCode || address) {
      marker.bindPopup(`
        <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: #000080;">${complaintCode || 'Grievance'}</strong>
          <p style="color: #64748b; font-size: 11px; margin-top: 2px;">${address || 'Road Hazard Spot'}</p>
        </div>
      `);
    }

    mapInstanceRef.current = map;
    setMapLoaded(true);

    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);
    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude]);

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
          attribution: 'Tiles &copy; Esri',
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

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-red-600" />
          <span>Defect Location Map</span>
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-navy hover:text-saffron font-bold flex items-center space-x-1 underline"
        >
          <span>Open in Google Maps App</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md bg-gray-100 h-56">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100/90 flex flex-col items-center justify-center space-y-1.5 z-10">
            <RefreshCw className="w-5 h-5 text-saffron animate-spin" />
            <span className="text-xs font-bold text-gray-600">Loading Map...</span>
          </div>
        )}

        {/* Top Toggle */}
        <div className="absolute top-2 left-2 z-10 flex bg-white/95 backdrop-blur-sm rounded-lg p-0.5 shadow border border-gray-200 text-[10px]">
          <button
            type="button"
            onClick={() => toggleMapType('roadmap')}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              mapType === 'roadmap' ? 'bg-navy text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Roadmap
          </button>
          <button
            type="button"
            onClick={() => toggleMapType('satellite')}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              mapType === 'satellite' ? 'bg-navy text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Coordinates badge */}
        <div className="absolute bottom-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow">
          {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E
        </div>
      </div>
    </div>
  );
};
