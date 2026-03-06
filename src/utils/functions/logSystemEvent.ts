import { WIKI_DISABLE_SYSTEM_LOGS } from "@/config";
import { prisma } from "@/lib/prisma";

export async function logSystemEvent(
  eventType: "PAGE_EDIT" | "PAGE_VIEW" | "PAGE_SEARCH",
  message: string,
): Promise<void> {
  if (WIKI_DISABLE_SYSTEM_LOGS) {
    return;
  }

  const systemLog = await prisma.systemLog.create({
    data: {
      type: eventType,
      message,
    },
  });

  if (!systemLog) {
    console.error("Failed to log system event:", { eventType, message });
    return;
  }

  console.log(`System Event Logged: [${systemLog.type}] ${systemLog.message}`);
}
