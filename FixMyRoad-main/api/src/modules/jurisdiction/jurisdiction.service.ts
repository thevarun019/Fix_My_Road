import { prisma } from '../../config/prisma';

export interface LocationMatch {
  jurisdiction: any;
  authority: any;
  estimatedSlaHours: number;
  escalationTarget: string;
}

export class JurisdictionService {
  /**
   * Matches geographic coordinates (lat, lng) to the proper administrative jurisdiction
   * and routes to the competent authority (NHAI, State PWD, or Municipal Corporation).
   */
  static async resolveJurisdictionAndAuthority(
    latitude: number,
    longitude: number,
    roadCategory: string = 'ARTERIAL',
    severity: string = 'MEDIUM'
  ): Promise<LocationMatch> {
    // Find matching geographic bounds in db
    let jurisdiction = await prisma.jurisdiction.findFirst({
      where: {
        minLat: { lte: latitude },
        maxLat: { gte: latitude },
        minLng: { lte: longitude },
        maxLng: { gte: longitude }
      }
    });

    // Dynamic civic jurisdiction for user's live coordinates if outside seeded bounds
    if (!jurisdiction) {
      const jurCode = `CIVIC-${Math.floor(latitude * 10)}-${Math.floor(longitude * 10)}`;
      jurisdiction = await prisma.jurisdiction.upsert({
        where: { code: jurCode },
        update: {},
        create: {
          code: jurCode,
          name: `Civic Road Division (${latitude.toFixed(3)}° N, ${longitude.toFixed(3)}° E)`,
          nameHi: `नागरिक सड़क प्रभाग`,
          state: 'State Road Division',
          district: 'Regional District',
          city: 'Local Municipal Area',
          minLat: latitude - 0.05,
          maxLat: latitude + 0.05,
          minLng: longitude - 0.05,
          maxLng: longitude + 0.05
        }
      });
    }

    const isDelhiNCR = latitude >= 28.4 && latitude <= 28.9 && longitude >= 76.8 && longitude <= 77.4;

    // Determine responsible authority based on road hierarchy
    let authorityCode = isDelhiNCR ? 'MCD' : 'LOCAL-MUNICIPAL';
    let escalationTarget = 'Executive Engineer (Road Maintenance)';

    if (roadCategory === 'NATIONAL_HIGHWAY') {
      authorityCode = isDelhiNCR ? 'NHAI-RO-DEL' : 'NHAI-REGIONAL';
      escalationTarget = 'Project Director (NHAI Regional Corridor)';
    } else if (roadCategory === 'STATE_HIGHWAY') {
      authorityCode = isDelhiNCR ? 'PWD-DELHI' : 'PWD-STATE';
      escalationTarget = 'Executive Engineer (State PWD Division)';
    } else {
      // Municipal or Urban Local Body
      if (isDelhiNCR) {
        authorityCode = jurisdiction.code?.includes('NDMC') ? 'NDMC' : 'MCD';
      } else {
        authorityCode = 'LOCAL-MUNICIPAL';
      }
      escalationTarget = 'Assistant Executive Engineer (Ward Works)';
    }

    let authority = await prisma.authority.findFirst({
      where: { code: authorityCode }
    });

    if (!authority) {
      authority = await prisma.authority.upsert({
        where: { code: authorityCode },
        update: {},
        create: {
          code: authorityCode,
          name: roadCategory === 'NATIONAL_HIGHWAY'
            ? 'National Highways Authority of India (NHAI)'
            : roadCategory === 'STATE_HIGHWAY'
            ? 'State Public Works Department (PWD)'
            : 'Local Municipal Corporation (Civic Roads)',
          nameHi: 'स्थानीय नगर निगम / लोक निर्माण विभाग',
          type: roadCategory === 'NATIONAL_HIGHWAY' ? 'NATIONAL_HIGHWAY' : 'MUNICIPAL_CORP',
          nodalOfficerName: 'Ward Junior Engineer (Roads)',
          nodalEmail: 'ward-engineer@gov.in',
          nodalPhone: '1800-11-0033',
          escalationOfficerName: 'Superintending Engineer (Works)',
          escalationPhone: '1800-11-0034'
        }
      });
    }

    // SLA Calculation based on Road Category and Severity
    let slaHours = 48;
    if (roadCategory === 'NATIONAL_HIGHWAY') {
      slaHours = severity === 'CRITICAL' ? 12 : severity === 'HIGH' ? 24 : 48;
    } else if (roadCategory === 'STATE_HIGHWAY' || roadCategory === 'ARTERIAL') {
      slaHours = severity === 'CRITICAL' ? 24 : severity === 'HIGH' ? 48 : 72;
    } else {
      // RESIDENTIAL
      slaHours = severity === 'CRITICAL' ? 48 : severity === 'HIGH' ? 72 : 120;
    }

    return {
      jurisdiction,
      authority,
      estimatedSlaHours: slaHours,
      escalationTarget
    };
  }
}
