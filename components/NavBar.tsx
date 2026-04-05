import { SignOutButton } from "@/components/Sign-out-Button";
import Link from "next/link";
import Image from "next/image";

type NavBarProps = {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } | null;
};

const UserIdentity = ({
    name,
    email,
    image,
}: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
}) => {
    const displayName = name?.trim() || email?.trim() || "Signed in user";

    return (
        <div className="flex items-center gap-3 rounded-full border border-dark-200 bg-dark-100/70 px-3 py-1.5">
            {image ? (
                <Image
                    src={image}
                    alt={`${displayName} profile photo`}
                    width={28}
                    height={28}
                    className="rounded-full"
                />
            ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                </div>
            )}
            <div className="max-w-[180px] leading-tight">
                <p className="truncate text-xs font-semibold text-light-100">Signed in as</p>
                <p className="truncate text-xs text-primary">{displayName}</p>
            </div>
        </div>
    );
};

const NavBar = ({ user }: NavBarProps) => {
    const isSignedIn = Boolean(user);

    return (
    <header>
        <nav>
            <Link href="/" className="logo">
                <Image src="/icons/logo.png" alt="Techvent logo" width={28} height={28}/>
                <p>TECHVENT</p>
            </Link>
            <ul>
                <Link href="/">Home</Link>
                <Link href="/events">Events</Link>
                                {isSignedIn && <Link href="/create">Create Event</Link>}
                                {isSignedIn && <UserIdentity name={user?.name} email={user?.email} image={user?.image} />}
                                {isSignedIn && (
                                    <SignOutButton className="rounded-full border border-primary/35 bg-primary/15 px-4 py-2 text-xs font-semibold text-primary transition-all duration-200 hover:border-primary/60 hover:bg-primary/25" />
                                )}
            </ul>        
        </nav>
    </header>
  );
};

export default NavBar;