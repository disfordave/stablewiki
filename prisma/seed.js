import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // --- Users ---
  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      username: "alice",
      name: "Alice Johnson",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      role: "ADMIN",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      username: "bob",
      name: "Bob Lee",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
      role: "EDITOR",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      email: "charlie@example.com",
      username: "charlie",
      name: "Charlie Kim",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      role: "USER",
    },
  });

  // --- Tags ---
  const tags = await prisma.tag.createMany({
    data: [
      {
        name: "Getting Started",
        description: "Introductory guides and tutorials",
      },
      {
        name: "Architecture",
        description: "System design and infrastructure docs",
      },
      { name: "Policies", description: "Company policies and rules" },
      {
        name: "Engineering",
        description: "Technical documentation and code standards",
      },
    ],
  });

  // --- Pages ---
  const homePage = await prisma.page.create({
    data: {
      title: "Welcome to the Wiki",
      slug: "welcome",
      content: "# Welcome!\nThis is the company wiki.",
      authorId: alice.id,
      isPublished: true,
      publishedAt: new Date(),
      tags: {
        create: [{ tag: { connect: { name: "Getting Started" } } }],
      },
    },
  });

  const archPage = await prisma.page.create({
    data: {
      title: "System Architecture Overview",
      slug: "architecture-overview",
      content: "",
      authorId: bob.id,
      isPublished: true,
      publishedAt: new Date(),
      tags: {
        create: [{ tag: { connect: { name: "Architecture" } } }],
      },
      parentId: homePage.id,
    },
  });

  // --- Revisions ---
  await prisma.revision.createMany({
    data: [
      {
        pageId: homePage.id,
        authorId: alice.id,
        content: "# Welcome!\nThis is the company wiki. Feel free to explore.",
        summary: "First draft",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 day ago
      },
      {
        pageId: homePage.id,
        authorId: alice.id,
        content:
          "# Welcome!\nThis is the company wiki. Please read the guidelines.",
        summary: "Added guidelines note",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
      {
        pageId: archPage.id,
        authorId: bob.id,
        content: "This document explains the core system architecture.",
        summary: "Expanded architecture details",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      },
      {
        pageId: archPage.id,
        authorId: bob.id,
        content:
          "This document explains the core system architecture. Includes diagrams.",
        summary: "Added diagrams",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
    ],
  });

  // --- Comments ---
  const comment1 = await prisma.comment.create({
    data: {
      pageId: archPage.id,
      authorId: charlie.id,
      content: "This diagram is super helpful!",
    },
  });

  await prisma.comment.create({
    data: {
      pageId: archPage.id,
      authorId: bob.id,
      content: "Thanks! I’ll add more details soon.",
      parentId: comment1.id,
    },
  });

  console.log("🌱 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
