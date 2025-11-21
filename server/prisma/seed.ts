import { prisma } from "../src/lib/prisma";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function deleteAllData(orderedFileNames: string[]) {
  const tableNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return `"${modelName.charAt(0).toUpperCase()}${modelName.slice(1)}"`;
  });

  try {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames.join(", ")} RESTART IDENTITY CASCADE;`,
    );
    console.log("Cleared existing data");
  } catch (error) {
    console.error("Error clearing existing data:", error);
    throw new Error("Could not clear existing data before seeding");
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "team.json",
    "project.json",
    "projectTeam.json",
    "user.json",
    "task.json",
    "attachment.json",
    "comment.json",
    "taskAssignment.json",
  ];

  await deleteAllData(orderedFileNames);
  let hasErrors = false;

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    try {
      for (const data of jsonData) {
        await model.create({ data });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      hasErrors = true;
      console.error(`Error seeding data for ${modelName}:`, error);
    }
  }

  if (hasErrors) {
    throw new Error("Seeding failed");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
