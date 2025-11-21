ALTER TABLE "Project"
ADD COLUMN "createdByUserId" INTEGER;

ALTER TABLE "Project"
ADD CONSTRAINT "Project_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId")
ON DELETE SET NULL ON UPDATE CASCADE;
