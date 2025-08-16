import MotionDiv from "@/app/(internetfriends)/components/motion-div";
import { ProfileHeader } from "./profile-header";
import { ProfileInfo } from "./profile-info";
import { ProfileTabs } from "./profile-tabs";

export const cardCss = `sm:p-4 p-2 surface-glass rounded-sm`;

const ProfileCard = () => {
  return (
    <MotionDiv className="w-full max-w-3xl flex flex-col gap-2">
      <ProfileHeader />
      <ProfileInfo />
      <ProfileTabs />
    </MotionDiv>
  );
};

export { ProfileCard };
export default ProfileCard;
