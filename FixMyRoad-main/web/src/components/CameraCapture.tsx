import React, { useRef, useState } from 'react';
import { Camera, Upload, Check, RefreshCw } from 'lucide-react';
import { compressImageFor2G } from '../lib/compress';

interface CameraCaptureProps {
  onPhotoCaptured: (blob: Blob, dataUrl: string, sizeKb: number, originalFile?: File) => void;
  currentPhotoUrl?: string | null;
  currentSizeKb?: number;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoCaptured,
  currentPhotoUrl,
  currentSizeKb
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const { compressedBlob, dataUrl, sizeKb } = await compressImageFor2G(file, 1024, 0.65);
      onPhotoCaptured(compressedBlob, dataUrl, sizeKb, file);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentPhotoUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-green-500 bg-gray-900 shadow-lg">
          <img
            src={currentPhotoUrl}
            alt="Captured road hazard"
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 font-bold">
            <Check className="w-3.5 h-3.5 text-green-400" />
            <span>Compressed for 2G: {currentSizeKb || 45} KB</span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-3 right-3 bg-white text-navy font-bold text-xs px-4 py-2 rounded-xl shadow-lg hover:bg-gray-100 flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Photo</span>
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-64 border-3 border-dashed border-gray-300 hover:border-saffron rounded-2xl bg-white flex flex-col items-center justify-center p-6 cursor-pointer group transition-all duration-200 hover:bg-orange-50/30"
        >
          <div className="w-16 h-16 rounded-full bg-saffron/10 group-hover:bg-saffron text-saffron group-hover:text-white flex items-center justify-center transition-all duration-200 mb-3 shadow-sm">
            {compressing ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Camera className="w-8 h-8" />
            )}
          </div>
          <span className="text-base font-bold text-gray-900 group-hover:text-saffron">
            {compressing ? 'Compressing for 2G Network...' : 'Take Live Photo or Upload'}
          </span>
          <span className="text-xs text-gray-500 mt-1 text-center max-w-xs">
            Tap here to open phone camera. Photos are automatically compressed to &lt;100KB for fast 2G upload.
          </span>
        </div>
      )}
    </div>
  );
};
