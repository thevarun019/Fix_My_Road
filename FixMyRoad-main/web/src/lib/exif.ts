/**
 * Lightweight, zero-dependency EXIF GPS Parser
 * Extracts latitude and longitude from original camera photos (JPEG/HEIC)
 * before canvas compression strips metadata.
 */
export async function extractExifGps(
  file: File | Blob
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const buffer = await file.slice(0, 128 * 1024).arrayBuffer(); // First 128KB is enough for EXIF header
    const view = new DataView(buffer);

    // Check SOI marker (0xFFD8)
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) {
      return null;
    }

    let offset = 2;
    const maxLen = view.byteLength;

    while (offset < maxLen - 4) {
      if (view.getUint8(offset) !== 0xff) break;
      const marker = view.getUint8(offset + 1);

      // APP1 marker (0xFFE1) contains EXIF
      if (marker === 0xe1) {
        const exifHeader = view.getUint32(offset + 4, false);
        // "Exif\0\0" in ASCII (0x45786966)
        if (exifHeader === 0x45786966) {
          return parseTiffHeader(view, offset + 10);
        }
      }

      const segmentLen = view.getUint16(offset + 2, false);
      if (segmentLen < 2) break;
      offset += 2 + segmentLen;
    }
  } catch (err) {
    console.debug('[EXIF Parser]', err);
  }
  return null;
}

function parseTiffHeader(
  view: DataView,
  tiffStart: number
): { latitude: number; longitude: number } | null {
  try {
    if (tiffStart + 8 > view.byteLength) return null;

    const endianCode = view.getUint16(tiffStart, false);
    const littleEndian = endianCode === 0x4949; // 'II'

    if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002a) return null;

    const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
    if (firstIfdOffset < 8 || tiffStart + firstIfdOffset + 2 > view.byteLength) return null;

    const ifd0 = tiffStart + firstIfdOffset;
    const numEntries = view.getUint16(ifd0, littleEndian);
    let gpsOffset = 0;

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifd0 + 2 + i * 12;
      if (entryOffset + 12 > view.byteLength) break;
      const tag = view.getUint16(entryOffset, littleEndian);
      if (tag === 0x8825) {
        // GPSInfo IFD Pointer
        gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
        break;
      }
    }

    if (!gpsOffset || tiffStart + gpsOffset + 2 > view.byteLength) return null;

    const gpsIfd = tiffStart + gpsOffset;
    const numGpsEntries = view.getUint16(gpsIfd, littleEndian);

    let latRef = 'N';
    let lonRef = 'E';
    let latDms: number[] | null = null;
    let lonDms: number[] | null = null;

    for (let i = 0; i < numGpsEntries; i++) {
      const entry = gpsIfd + 2 + i * 12;
      if (entry + 12 > view.byteLength) break;

      const tag = view.getUint16(entry, littleEndian);
      const valOffset = view.getUint32(entry + 8, littleEndian);

      if (tag === 1) {
        // GPSLatitudeRef ('N' or 'S')
        latRef = String.fromCharCode(view.getUint8(entry + 8));
      } else if (tag === 2) {
        // GPSLatitude (3 rationals: deg, min, sec)
        latDms = readRational3(view, tiffStart + valOffset, littleEndian);
      } else if (tag === 3) {
        // GPSLongitudeRef ('E' or 'W')
        lonRef = String.fromCharCode(view.getUint8(entry + 8));
      } else if (tag === 4) {
        // GPSLongitude (3 rationals: deg, min, sec)
        lonDms = readRational3(view, tiffStart + valOffset, littleEndian);
      }
    }

    if (!latDms || !lonDms) return null;

    let lat = latDms[0] + latDms[1] / 60 + latDms[2] / 3600;
    if (latRef === 'S') lat = -lat;

    let lon = lonDms[0] + lonDms[1] / 60 + lonDms[2] / 3600;
    if (lonRef === 'W') lon = -lon;

    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return null;
    }

    return {
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lon.toFixed(6))
    };
  } catch {
    return null;
  }
}

function readRational3(view: DataView, offset: number, le: boolean): number[] | null {
  if (offset + 24 > view.byteLength) return null;
  const num1 = view.getUint32(offset, le);
  const den1 = view.getUint32(offset + 4, le) || 1;

  const num2 = view.getUint32(offset + 8, le);
  const den2 = view.getUint32(offset + 12, le) || 1;

  const num3 = view.getUint32(offset + 16, le);
  const den3 = view.getUint32(offset + 20, le) || 1;

  return [num1 / den1, num2 / den2, num3 / den3];
}
