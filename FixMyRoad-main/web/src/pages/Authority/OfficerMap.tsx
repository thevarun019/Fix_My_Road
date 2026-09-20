import React, { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { MapPin, Layers, RefreshCw } from 'lucide-react';
import L from 'leaflet';

export const OfficerMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [complaints, setComplaints] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BREACH'>('ALL');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    apiRequest('/complaints?limit=100')
      .then((res) => {
        if (res.items) setComplaints(res.items);
      })
      .catch(console.error);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090], // Delhi center
      zoom: 12,
      zoomControl: true
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 13);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }

    mapInstanceRef.current = map;
    setMapLoaded(true);

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers on filter / complaints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = complaints.filter((c) => {
      if (filter === 'ACTIVE') return c.status !== 'RESOLVED' && c.status !== 'VERIFIED';
      if (filter === 'BREACH') {
        return new Date(c.slaDeadline).getTime() < Date.now() && c.status !== 'RESOLVED';
      }
      return true;
    });

    const bounds: L.LatLngExpression[] = [];

    filtered.forEach((c) => {
      if (!c.latitude || !c.longitude) return;

      const isOverdue = new Date(c.slaDeadline).getTime() < Date.now() && c.status !== 'RESOLVED';
      const isResolved = c.status === 'RESOLVED' || c.status === 'VERIFIED';
      const color = isOverdue ? '#dc2626' : isResolved ? '#138808' : '#FF9933';
      const size = isOverdue ? 24 : 18;

      const markerIcon = L.divIcon({
        className: 'officer-hazard-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px;">
            ${isOverdue ? `<div style="position: absolute; width: ${size + 10}px; height: ${size + 10}px; background: ${color}40; border-radius: 50%; animation: ping 1.5s infinite;"></div>` : ''}
            <div style="background: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([c.latitude, c.longitude], {
        icon: markerIcon,
        title: c.complaintCode
      });

      const popupContent = `
        <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; line-height: 1.5; padding: 4px; min-width: 200px; color: #1e293b;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #000080; font-size: 13px;">${c.complaintCode}</strong>
            <span style="background: ${color}; color: white; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px;">
              ${isOverdue ? '⚠️ SLA BREACHED' : c.status.replace('_', ' ')}
            </span>
          </div>
          <div style="font-weight: 700; color: ${color};">${c.category} · ${c.severity}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${c.address || ''}</div>
          <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <a href="/track/${c.complaintCode}" target="_blank" style="color: #000080; font-weight: bold; font-size: 11px; text-decoration: underline;">
              View Full Grievance Audit & Proofs &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayerRef.current?.addLayer(marker);
      bounds.push([c.latitude, c.longitude]);
    });

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 15 });
    }
  }, [complaints, filter]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="bg-navy rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-govgreen font-bold text-xs uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Field Officer GIS Command</span>
          </div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <span>Ward Geotagged Live Map</span>
            <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Live Map
            </span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Real-time geospatial tracking of all active grievances, SLA deadlines, and repair routes.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-gray-400" />
          <div className="flex space-x-1 bg-white/10 rounded-xl p-1">
            {(['ALL', 'ACTIVE', 'BREACH'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === f ? 'bg-white text-navy shadow-sm' : 'text-gray-300 hover:text-white'
                }`}
              >
                {f === 'ALL' ? `All (${complaints.length})` : f === 'ACTIVE' ? 'Active' : '⚠️ SLA Breached'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl bg-gray-100 h-[600px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100/90 flex flex-col items-center justify-center space-y-2 z-10">
            <RefreshCw className="w-8 h-8 text-saffron animate-spin" />
            <span className="text-sm font-bold text-navy">Loading GIS Map...</span>
          </div>
        )}

        {/* Top Controls: Map Type Toggle */}
        <div className="absolute top-4 left-4 z-10 flex bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-gray-200">
          <button
            type="button"
            onClick={() => toggleMapType('roadmap')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'roadmap' ? 'bg-navy text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Roadmap
          </button>
          <button
            type="button"
            onClick={() => toggleMapType('satellite')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapType === 'satellite' ? 'bg-navy text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Satellite HD
          </button>
        </div>
      </div>
    </div>
  );
};
