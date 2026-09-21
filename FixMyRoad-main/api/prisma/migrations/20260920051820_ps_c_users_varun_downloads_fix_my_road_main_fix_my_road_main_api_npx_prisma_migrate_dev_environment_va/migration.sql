-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CITIZEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authority" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHi" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MUNICIPAL_CORP',
    "nodalOfficerName" TEXT,
    "nodalEmail" TEXT,
    "nodalPhone" TEXT,
    "escalationOfficerName" TEXT,
    "escalationPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Authority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jurisdiction" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHi" TEXT,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT,
    "minLat" DOUBLE PRECISION NOT NULL,
    "maxLat" DOUBLE PRECISION NOT NULL,
    "minLng" DOUBLE PRECISION NOT NULL,
    "maxLng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Jurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaRule" (
    "id" TEXT NOT NULL,
    "roadCategory" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "resolutionHours" INTEGER NOT NULL,
    "warningHours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlaRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "complaintCode" TEXT NOT NULL,
    "userId" TEXT,
    "authorityId" TEXT,
    "jurisdictionId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "pincode" TEXT,
    "category" TEXT NOT NULL DEFAULT 'POTHOLE',
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "roadCategory" TEXT NOT NULL DEFAULT 'ARTERIAL',
    "description" TEXT,
    "photoUrl" TEXT NOT NULL,
    "blurredPhotoUrl" TEXT,
    "inProgressPhotoUrl" TEXT,
    "resolutionPhotoUrl" TEXT,
    "resolutionRemarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "priorityScore" INTEGER NOT NULL DEFAULT 50,
    "slaHours" INTEGER NOT NULL DEFAULT 48,
    "slaDeadline" TIMESTAMP(3) NOT NULL,
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "slaPaused" BOOLEAN NOT NULL DEFAULT false,
    "slaPausedAt" TIMESTAMP(3),
    "slaRemainingSeconds" INTEGER,
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "assignedOfficerName" TEXT,
    "assignedOfficerPhone" TEXT,
    "citizenVerified" BOOLEAN,
    "citizenRating" INTEGER,
    "citizenFeedback" TEXT,
    "dedupClusterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationLog" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "fromLevel" INTEGER NOT NULL,
    "toLevel" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "escalatedToTitle" TEXT NOT NULL,
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscalationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Authority_code_key" ON "Authority"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Jurisdiction_code_key" ON "Jurisdiction"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_complaintCode_key" ON "Complaint"("complaintCode");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationLog" ADD CONSTRAINT "EscalationLog_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
