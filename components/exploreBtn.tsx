'use client';
import Image from "next/image";
import Link from "next/link";

const ExploreBtn = () => {
  return (
    <Link
      href="/events"
      id='explore-btn'
      className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-6 py-3 text-sm font-semibold text-primary shadow-[0_8px_20px_-12px_rgba(0,0,0,0.8)] transition-all duration-200 hover:border-primary/60 hover:bg-primary/25"
    >
      Explore Events
      <Image src="/icons/arrow-down.svg" alt="arrow down" width={24} height={24}/>
    </Link>
  );
};

export default ExploreBtn;