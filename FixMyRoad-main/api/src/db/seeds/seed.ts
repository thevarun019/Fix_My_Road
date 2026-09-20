import { prisma } from '../../config/prisma';

async function seed() {
  console.log('[Seed] Seeding RoadWatch civic authorities & sample complaints...');

  // 1. Authorities
  const mcd = await prisma.authority.upsert({
    where: { code: 'MCD' },
    update: {},
    create: {
      code: 'MCD',
      name: 'Municipal Corporation of Delhi (MCD)',
      nameHi: 'दिल्ली नगर निगम (एमसीडी)',
      type: 'MUNICIPAL_CORP',
      nodalOfficerName: 'Er. Rajesh Sharma',
      nodalEmail: 'ee-works@mcd.gov.in',
      nodalPhone: '011-23225200',
      escalationOfficerName: 'Dr. Neha Verma (IAS, Additional Commissioner)',
      escalationPhone: '011-23225201'
    }
  });

  const ndmc = await prisma.authority.upsert({
    where: { code: 'NDMC' },
    update: {},
    create: {
      code: 'NDMC',
      name: 'New Delhi Municipal Council (NDMC)',
      nameHi: 'नई दिल्ली नगरपालिका परिषद (एनडीएमसी)',
      type: 'MUNICIPAL_CORP',
      nodalOfficerName: 'Er. Sunil Grover',
      nodalEmail: 'chief-engineer@ndmc.gov.in',
      nodalPhone: '011-23348300',
      escalationOfficerName: 'Secretary (NDMC)',
      escalationPhone: '011-23348305'
    }
  });

  const pwd = await prisma.authority.upsert({
    where: { code: 'PWD-DELHI' },
    update: {},
    create: {
      code: 'PWD-DELHI',
      name: 'Public Works Department (Delhi PWD)',
      nameHi: 'लोक निर्माण विभाग (पीडब्ल्यूडी दिल्ली)',
      type: 'PWD',
      nodalOfficerName: 'Er. Alok Mathur',
      nodalEmail: 'ee-m411@pwd.delhi.gov.in',
      nodalPhone: '011-23490010',
      escalationOfficerName: 'Chief Engineer (Road Maintenance)',
      escalationPhone: '011-23490020'
    }
  });

  const nhai = await prisma.authority.upsert({
    where: { code: 'NHAI-RO-DEL' },
    update: {},
    create: {
      code: 'NHAI-RO-DEL',
      name: 'National Highways Authority of India (NHAI RO Delhi)',
      nameHi: 'भारतीय राष्ट्रीय राजमार्ग प्राधिकरण (एनएचएआई)',
      type: 'NHAI',
      nodalOfficerName: 'Col. Amit Bansal',
      nodalEmail: 'pd-delhi@nhai.org',
      nodalPhone: '011-25074100',
      escalationOfficerName: 'Regional Officer (Delhi & NCR)',
      escalationPhone: '011-25074200'
    }
  });

  // 2. Jurisdictions
  const jur1 = await prisma.jurisdiction.upsert({
    where: { code: 'DL-CENTRAL' },
    update: {},
    create: {
      code: 'DL-CENTRAL',
      name: 'Central Delhi Ward 42 (Karol Bagh - Pusa)',
      nameHi: 'मध्य दिल्ली वार्ड 42 (करोल बाग - पूसा)',
      state: 'Delhi',
      district: 'Central Delhi',
      city: 'New Delhi',
      minLat: 28.63,
      maxLat: 28.67,
      minLng: 77.16,
      maxLng: 77.21
    }
  });

  const jur2 = await prisma.jurisdiction.upsert({
    where: { code: 'DL-NDMC-LBN' },
    update: {},
    create: {
      code: 'DL-NDMC-LBN',
      name: 'Lutyens Bungalow Zone & Connaught Place',
      nameHi: 'लुटियंस बंगला ज़ोन और कनॉट प्लेस',
      state: 'Delhi',
      district: 'New Delhi',
      city: 'New Delhi',
      minLat: 28.60,
      maxLat: 28.64,
      minLng: 77.20,
      maxLng: 77.24
    }
  });

  const jur3 = await prisma.jurisdiction.upsert({
    where: { code: 'DL-NH48' },
    update: {},
    create: {
      code: 'DL-NH48',
      name: 'NH-48 Delhi-Gurugram Expressway Corridor',
      nameHi: 'एनएच-48 दिल्ली-गुरुग्राम एक्सप्रेसवे कॉरिडोर',
      state: 'Delhi',
      district: 'South West Delhi',
      city: 'New Delhi',
      minLat: 28.50,
      maxLat: 28.58,
      minLng: 77.06,
      maxLng: 77.15
    }
  });

  // 3. Sample Demo Complaints
  const samplePhoto = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60';
  const samplePothole2 = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60';
  const sampleFixed = 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=60';

  const c1 = await prisma.complaint.upsert({
    where: { complaintCode: 'IN-MCD-2026-1042' },
    update: {},
    create: {
      complaintCode: 'IN-MCD-2026-1042',
      authorityId: mcd.id,
      jurisdictionId: jur1.id,
      latitude: 28.648,
      longitude: 77.185,
      address: 'Near Karol Bagh Metro Station, Pusa Road, New Delhi',
      pincode: '110005',
      category: 'POTHOLE',
      severity: 'HIGH',
      roadCategory: 'ARTERIAL',
      description: 'Dangerous pothole approximately 12 inches deep in middle of left lane causing vehicle damage.',
      photoUrl: samplePhoto,
      blurredPhotoUrl: samplePhoto,
      status: 'IN_PROGRESS',
      priorityScore: 78,
      slaHours: 48,
      slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours remaining
      slaBreached: false,
      escalationLevel: 0,
      assignedOfficerName: 'Er. Rajesh Sharma (Junior Engineer)',
      assignedOfficerPhone: '9876543210'
    }
  });

  const c2 = await prisma.complaint.upsert({
    where: { complaintCode: 'IN-NHAI-2026-9021' },
    update: {},
    create: {
      complaintCode: 'IN-NHAI-2026-9021',
      authorityId: nhai.id,
      jurisdictionId: jur3.id,
      latitude: 28.528,
      longitude: 77.098,
      address: 'KM 14.2 NH-48 Express Highway, Mahipalpur Flyover descent',
      pincode: '110037',
      category: 'CAVE_IN',
      severity: 'CRITICAL',
      roadCategory: 'NATIONAL_HIGHWAY',
      description: 'Severe surface depression and cave-in following rainwater leakage on high-speed lane.',
      photoUrl: samplePothole2,
      blurredPhotoUrl: samplePothole2,
      status: 'ASSIGNED',
      priorityScore: 95,
      slaHours: 12,
      slaDeadline: new Date(Date.now() - 4 * 60 * 60 * 1000), // Overdue by 4 hours!
      slaBreached: true,
      escalationLevel: 1, // Escalated
      assignedOfficerName: 'Assistant Executive Engineer (Sub-Division NHAI)',
      assignedOfficerPhone: '011-25074100'
    }
  });

  const c3 = await prisma.complaint.upsert({
    where: { complaintCode: 'IN-NDMC-2026-3310' },
    update: {},
    create: {
      complaintCode: 'IN-NDMC-2026-3310',
      authorityId: ndmc.id,
      jurisdictionId: jur2.id,
      latitude: 28.631,
      longitude: 77.219,
      address: 'Outer Circle, Connaught Place, Block E, New Delhi',
      pincode: '110001',
      category: 'BROKEN_SURFACE',
      severity: 'MEDIUM',
      roadCategory: 'ARTERIAL',
      description: 'Broken asphalt and loose gravel repaired and resurfaced.',
      photoUrl: samplePhoto,
      blurredPhotoUrl: samplePhoto,
      resolutionPhotoUrl: sampleFixed,
      resolutionRemarks: 'Hot asphalt premix compaction completed and traffic reopened.',
      status: 'RESOLVED',
      priorityScore: 50,
      slaHours: 48,
      slaDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      slaBreached: false,
      escalationLevel: 0,
      assignedOfficerName: 'Er. Sunil Grover',
      citizenVerified: true,
      citizenRating: 5,
      citizenFeedback: 'Quick repair done within 24 hours. Excellent work!',
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  });

  console.log('[Seed] Database populated successfully with authorities, jurisdictions and complaints!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
