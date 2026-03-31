import Link from "next/link";
import Image from "next/image";
import { formatEventDate, formatEventTime } from "@/lib/utils";

interface Props {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
}

const eventCard = ({ title ,image,slug,location,date,time}:Props) => {
  const formattedDate = formatEventDate(date);
  const formattedTime = formatEventTime(time);

  return (
    <Link href={`/events/${slug}`} id="event-card">
      <Image src={image} alt={title} width={410} height={300} className="poster" />
      <div className="flex flex-row gap-2">
        <Image src="/icons/pin.svg" alt="Location" width={20} height={20} />
        <p className="location">{location}</p>
      </div>
      <p className="title">{title}</p>
      <div className="datetime">
        <Image src="/icons/calendar.svg" alt="Location" width={20} height={20} />
        <p>{formattedDate}</p>
        <Image src="/icons/clock.svg" alt="Time" width={20} height={20} />
        <p >{formattedTime}</p>
      </div>

    </Link>
  );
};

export default eventCard;