ALTER TABLE "User"
RENAME COLUMN "cognitoId" TO "authProviderId";

ALTER INDEX "User_cognitoId_key"
RENAME TO "User_authProviderId_key";
