import MotionDiv from "@/app/(internetfriends)/components/motion-div";
import { curriculum } from "@/lib/data/curriculum";
import Link from "next/link";
import { cardCss } from "./profile-card";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";

const ProfileHeader = () => {
  return (
    <MotionDiv className={`flex justify-between items-center mb-2 ${cardCss}`}>
      <h1 className="text-xl font-bold">{curriculum.professionalPosition}</h1>
      <Link href={"/contact"}>
        <GlassCardAtomic
          variant="default"
          strength={0.45}
          noise={true}
          hover={true}
          className="border-accent-medium font-semibold px-4 py-2 rounded-md hover:border-accent-strong inline-block"
        >
          Hire me
        </GlassCardAtomic>
      </Link>
    </MotionDiv>
  );
};

export { ProfileHeader };

export default ProfileHeader;

