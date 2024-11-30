-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "_ExerciseToExerciseTag" ADD CONSTRAINT "_ExerciseToExerciseTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ExerciseToExerciseTag_AB_unique";

-- AlterTable
ALTER TABLE "_courseOwners" ADD CONSTRAINT "_courseOwners_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_courseOwners_AB_unique";

-- AlterTable
ALTER TABLE "_courseStudents" ADD CONSTRAINT "_courseStudents_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_courseStudents_AB_unique";

-- CreateTable
CREATE TABLE "OAuth" (
    "oauthId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OAuth_pkey" PRIMARY KEY ("oauthId")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuth_userId_key" ON "OAuth"("userId");

-- AddForeignKey
ALTER TABLE "OAuth" ADD CONSTRAINT "OAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
