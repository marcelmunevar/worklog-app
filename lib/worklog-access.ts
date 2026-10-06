import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { worklogMembers, worklogs } from "@/db/schema";

export async function requireWorklogId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/auth/signin");
  }

  const [existingMembership] = await db
    .select({ worklogId: worklogMembers.worklogId })
    .from(worklogMembers)
    .where(eq(worklogMembers.userId, userId))
    .limit(1);

  if (existingMembership) {
    return existingMembership.worklogId;
  }

  const [worklog] = await db
    .insert(worklogs)
    .values({ name: "Personal worklog" })
    .returning({ id: worklogs.id });

  if (!worklog) {
    throw new Error("Could not create a personal worklog.");
  }

  try {
    const [membership] = await db
      .insert(worklogMembers)
      .values({ worklogId: worklog.id, userId, role: "owner" })
      .onConflictDoNothing({ target: worklogMembers.userId })
      .returning({ worklogId: worklogMembers.worklogId });

    if (membership) {
      return membership.worklogId;
    }
  } catch (error) {
    await db.delete(worklogs).where(eq(worklogs.id, worklog.id));
    throw error;
  }

  await db.delete(worklogs).where(eq(worklogs.id, worklog.id));

  const [concurrentMembership] = await db
    .select({ worklogId: worklogMembers.worklogId })
    .from(worklogMembers)
    .where(eq(worklogMembers.userId, userId))
    .limit(1);

  if (!concurrentMembership) {
    throw new Error("Could not resolve the user's personal worklog.");
  }

  return concurrentMembership.worklogId;
}
