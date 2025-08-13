import { curriculum } from "@/app/(internetfriends)/lib/curriculum/data";
import { GlassBadge } from "@/components/ui/glass-badge";
import { cardCss } from "./profile-card";

const ProfileSkillsTab = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className={cardCss}>
        <p className="font-medium">Skills & Aptitudes</p>
      </div>
      <div className={`${cardCss} flex flex-row flex-wrap gap-2`}>
        {curriculum.skills
          .sort((a, b) => b.popularity - a.popularity)
          .map((skill, index) => (
            <GlassBadge key={`skill-${index}`} variant="default">
              {skill?.name}
            </GlassBadge>
          ))}
      </div>
    </div>
  );
};

export { ProfileSkillsTab };

export default ProfileSkillsTab;

import { generateStamp } from "@/lib/utils/timestamp";