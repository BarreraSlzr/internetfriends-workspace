import { curriculum } from "@/lib/data/curriculum";
import { Badge } from "@/components/ui/badge";
import { GlassBadge } from "@/components/ui/glass-badge";
import { cardCss } from "./profile-card";

const ProfileProjectsTab = () => {
  const skillsMap = new Map(
    (curriculum.skills || []).map((skill) => [skill.id, skill]),
  );
  
  return (
    <div className="flex flex-col gap-2">
      <div className={cardCss}>
        <p className="font-medium">Enterprise projects</p>
      </div>
       {(curriculum.jobExperiences || []).map((job, index) => (
        <div key={`project-${index}`} className={cardCss}>
          <div className="flex flex-row flex-wrap justify-between">
            <p className="font-medium">
              {job.title} | {job.razonSocial}
            </p>
            <Badge className="text-gray-700 hover:bg-gray-300 text-sm font-semibold mr-2 px-2.5 py-0.5">
              {job.startDate} - {job.endDate || "Present"}
            </Badge>
          </div>
           {(job.projects || []).map((project, pIndex) => (
            <div key={`project-${pIndex}`} className="ml-4 mb-4">
              <h4 className="text-lg font-semibold">{project.name}</h4>
              <p className="text-gray-700 mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                 {/* Job experience projects don't have technologies field */}
                 <GlassBadge variant="default">Project Work</GlassBadge>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export { ProfileProjectsTab };

export default ProfileProjectsTab;

