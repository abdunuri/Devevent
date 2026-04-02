import { auth } from "@/auth";
import NavBar, { AdminNavBar } from "@/components/NavBar";

export default async function NavBarSlot() {
  const session = await auth();
  const NavBarComponent = session ? AdminNavBar : NavBar;

  return <NavBarComponent />;
}
