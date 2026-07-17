import { db } from "@/db";
import { projects } from "@/db/schema";

export default async function Home() {
  const data = await db.select().from(projects);

  return (
    <main>
      <h1>Projects</h1>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
