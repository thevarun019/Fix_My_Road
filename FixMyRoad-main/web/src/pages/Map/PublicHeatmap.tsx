import React, { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Layers, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import L from 'leaflet';

export const PublicHeatmap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [points, setPoints] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    apiRequest('/complaints/heatmap')
      .then((res) => {
        if (res.data) setPoints(res.data);
      })
      .catch((err) => console.error('Failed to load heatmap:', err));
  }, []);

  // Create circle marker icons based on severity/status
  const createMarkerIcon = (color: string, isCritical: boolean) => {
    const size = isCritical ? 24 : 18;
    return L.divIcon({
      className: 'custom-hazard-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px;">
          ${isCritical ? `<div style="position: absolute; width: ${size + 10}px; height: ${size + 10}px; background: ${color}40; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="background: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629], // Geographic center of India
      zoom: 5,
      zoomControl: true
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Pan to user's live position if allowed
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

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when points or filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = points.filter((p) => {
      if (filter === 'CRITICAL') return p.severity === 'CRITICAL';
      if (filter === 'IN_PROGRESS') return p.status === 'IN_PROGRESS';
      if (filter === 'RESOLVED') return p.status === 'RESOLVED' || p.status === 'VERIFIED';
      return true;
    });

    const bounds: L.LatLngExpression[] = [];

    filtered.forEach((pt) => {
      if (!pt.latitude || !pt.longitude) return;

      const isResolved = pt.status === 'RESOLVED' || pt.status === 'VERIFIED';
      const isCritical = pt.severity === 'CRITICAL';
      const color = isResolved ? '#138808' : isCritical ? '#DC2626' : '#FF9933';

      const marker = L.marker([pt.latitude, pt.longitude], {
        icon: createMarkerIcon(color, isCritical),
        title: pt.complaintCode
      });

      const popupContent = `
        <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; line-height: 1.5; padding: 4px; min-width: 190px; color: #1e293b;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px;">
            <strong style="color: #000080; font-size: 13px;">${pt.complaintCode}</strong>
            <span style="background: ${color}; color: white; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px; text-transform: uppercase;">
              ${pt.status?.replace('_', ' ')}
            </span>
          </div>
          <div style="font-weight: 700; color: ${color};">${pt.category || 'Road Hazard'} · ${pt.severity}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 3px;">${pt.address || 'Public Road, India'}</div>
          <div style="margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <a href="/track/${pt.complaintCode}" style="background: #000080; color: #ffffff; padding: 5px 10px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 11px; display: inline-block;">
              Track Live SLA Status &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayerRef.current?.addLayer(marker);
      bounds.push([pt.latitude, pt.longitude]);
    });

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 15 });
    }
  }, [points, filter]);

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
              Public Road Safety & Hazard Heatmap
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-300">
              Live Map
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Real-time geospatial tracking of potholes, cracks, and resolved works across municipal jurisdictions.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filter === 'ALL'
                ? 'bg-navy text-white border-navy shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Hazards ({points.length})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filter === 'CRITICAL'
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
            }`}
          >
            Critical (12h SLA)
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filter === 'IN_PROGRESS'
                ? 'bg-saffron text-white border-saffron shadow-sm'
                : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filter === 'RESOLVED'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Resolved Proofs
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl bg-gray-100">
        <div ref={mapContainerRef} className="w-full h-[600px] z-0" />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100/90 flex flex-col items-center justify-center space-y-2 z-10">
            <RefreshCw className="w-8 h-8 text-saffron animate-spin" />
            <span className="text-sm font-bold text-navy">Loading Interactive Heatmap...</span>
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

        {/* Map Legend */}
        <div className="absolute bottom-6 right-6 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 text-xs space-y-2">
          <span className="font-bold text-gray-900 block border-b border-gray-100 pb-1">
            Hazard Severity Legend
          </span>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-sm"></span>
            <span className="font-semibold text-gray-800">Critical Hazard (12h SLA)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF9933] border border-white shadow-sm"></span>
            <span className="font-semibold text-gray-800">High / Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#138808] border border-white shadow-sm"></span>
            <span className="font-semibold text-gray-800">Resolved & Verified Work</span>
          </div>
        </div>
      </div>
    </div>
  );
};
