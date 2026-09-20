import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { CheckCircle2, Star, Image, Calendar, RefreshCw } from 'lucide-react';

export const MyResolved: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/complaints?limit=50')
      .then(res => {
        if (res.items) setComplaints(res.items.filter((c: any) => c.status === 'RESOLVED' || c.status === 'VERIFIED'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-govgreen font-bold text-xs uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" /><span>Completed Field Work</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">My Resolved Complaints</h1>
          <p className="text-xs text-gray-300 mt-1">
            {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} resolved with before/after photographic evidence
          </p>
        </div>
        <div className="bg-govgreen/20 border border-govgreen/30 rounded-2xl px-5 py-3 text-center">
          <div className="text-3xl font-black text-govgreen">{complaints.length}</div>
          <div className="text-[10px] text-govgreen uppercase font-bold">Closed</div>
        </div>
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Loading resolved complaints...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-bold">No resolved complaints yet</p>
          <p className="text-gray-400 text-xs mt-1">Complete field repairs and update the status to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {complaints.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border-2 border-gray-200 hover:border-govgreen/40 shadow-sm overflow-hidden transition-all">
              {/* Before/After */}
              <div className="grid grid-cols-2 h-36">
                <div className="relative">
                  <img src={item.blurredPhotoUrl || item.photoUrl || 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=400'}
                    alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-black bg-black/70 text-white px-2 py-0.5 rounded-full">BEFORE</span>
                </div>
                <div className="relative bg-gray-100">
                  {item.resolutionPhotoUrl ? (
                    <img src={item.resolutionPhotoUrl} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Image className="w-8 h-8 text-gray-300" />
                      <span className="text-[10px] text-gray-400 mt-1">No photo</span>
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-black bg-govgreen text-white px-2 py-0.5 rounded-full">AFTER</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-navy">{item.complaintCode}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    item.status === 'VERIFIED' ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-green-100 text-green-800 border-green-200'
                  }`}>{item.status}</span>
                </div>
                <p className="text-xs font-bold text-gray-800">{item.category} · {item.severity}</p>
                <p className="text-[11px] text-gray-500 truncate">{item.address}</p>
                {item.resolutionRemarks && (
                  <p className="text-[11px] text-gray-500 italic border-t border-gray-100 pt-2 line-clamp-2">"{item.resolutionRemarks}"</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  {item.citizenRating ? (
                    <div className="flex items-center space-x-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= item.citizenRating ? 'text-saffron fill-saffron' : 'text-gray-200'}`} />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1">by citizen</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400">Pending citizen verification</span>
                  )}
                  <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
