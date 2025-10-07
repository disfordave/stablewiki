import { Prisma } from "@prisma/client";

export type PageWithRelations = Prisma.PageGetPayload<{
  include: {
    author: true;
    tags: { include: { tag: true } };
  };
}>;