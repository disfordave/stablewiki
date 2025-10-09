import { Prisma } from "@prisma/client";

export type PageWithRelations = Prisma.PageGetPayload<{
  include: {
    author: true;
    tags: { include: { tag: true } };
  };
}>;

export interface Page {
  id: string;
  title: string;
  content: string;
  slug: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: {
    id: string;
    name: string;
  }[];
}