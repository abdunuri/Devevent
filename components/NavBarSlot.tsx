import { auth } from "@/auth";
import NavBar from "@/components/NavBar";

export default async function NavBarSlot() {
  const session = await auth();

  return <NavBar user={session?.user ?? null} />;
}
