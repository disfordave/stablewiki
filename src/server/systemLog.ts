import "server-only";
import { WIKI_DISABLE_SYSTEM_LOGS } from "@/config";
import { prisma } from "@/lib/prisma";
import { reportError } from "./monitoring";

export async function logSystemEvent(
  eventType: "PAGE_EDIT" | "PAGE_VIEW" | "PAGE_SEARCH",
  message: string,
): Promise<void> {
  if (WIKI_DISABLE_SYSTEM_LOGS) {
    return;
  }

  // Callers don't await this, so a failure must not become an unhandled rejection
  try {
    await prisma.systemLog.create({
      data: {
        type: eventType,
        message,
      },
    });
  } catch (error) {
    reportError(error, { eventType, systemLogMessage: message });
  }
}
