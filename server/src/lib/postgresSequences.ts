import { Prisma, PrismaClient } from "@prisma/client";

type SequenceClient =
  | PrismaClient
  | Prisma.TransactionClient;

type SequenceTarget = {
  column: string;
  table: string;
};

const assertIdentifier = (value: string) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Invalid SQL identifier: ${value}`);
  }

  return `"${value}"`;
};

export const syncPostgresSerialSequences = async (
  client: SequenceClient,
  targets: SequenceTarget[],
) => {
  for (const target of targets) {
    const tableName = assertIdentifier(target.table);
    const columnName = assertIdentifier(target.column);

    await client.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('${tableName}', '${target.column}'),
        COALESCE((SELECT MAX(${columnName}) FROM ${tableName}), 0) + 1,
        false
      );
    `);
  }
};
