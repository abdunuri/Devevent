import connectToDatabase from "@/lib/mongodb";
import { User } from "@/database/user.model";

type SessionLike = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
} | null;

export async function syncUserFromSession(session: SessionLike) {
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  await connectToDatabase();

  return User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: session?.user?.name ?? null,
        image: session?.user?.image ?? null,
        lastLoginAt: new Date(),
      },
      $setOnInsert: {
        role: "user",
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}
