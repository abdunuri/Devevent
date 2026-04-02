import { SignOutButton } from "@/components/Sign-out-Button";
import Link from "next/link";
import Image from "next/image";

const NavBar = () => {
 return (
    <header>
        <nav>
            <Link href="/" className="logo">
                <Image src="/icons/logo.png" alt="logo" width={24} height={24}/>
                <p>TECHVENT</p>
            </Link>
                <ul>
                    <Link href="/">Home</Link>
                    <Link href="/events">Events</Link>
                </ul>
        </nav>
    </header>
  );
};

const AdminNavBar = () => {
  return (
    <header>
        <nav>
            <Link href="/" className="logo">
                <Image src="/icons/logo.png" alt="logo" width={24} height={24}/>
                <p>TECHVENT</p>
            </Link>
                <ul>
                    <Link href="/">Home</Link>
                    <Link href="/events">Events</Link>
                    <Link href="/create">Create Event</Link>
                    <Link href="/admin/pending">Admin</Link>
                    <SignOutButton></SignOutButton>
                </ul>
        </nav>
    </header>
  );
};

export default NavBar;
export { AdminNavBar };