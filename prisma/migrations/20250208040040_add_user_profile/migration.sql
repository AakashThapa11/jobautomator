-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "jobTitles" TEXT[],
    "skills" TEXT[],
    "experience" INTEGER,
    "education" TEXT,
    "jobType" TEXT,
    "industries" TEXT[],
    "autoApply" BOOLEAN NOT NULL DEFAULT false,
    "dailyLimit" INTEGER NOT NULL DEFAULT 10,
    "approveBeforeApply" BOOLEAN NOT NULL DEFAULT true,
    "resumePath" TEXT,
    "coverLetterPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
