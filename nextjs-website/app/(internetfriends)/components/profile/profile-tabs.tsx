import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileExpertiseTab } from "./profile-expertise-tab";
import { ProfileSkillsTab } from "./profile-skills-tab";
import { ProfileProjectsTab } from "./profile-projects-tab";
import { ProfileMoreTab } from "./profile-more-tab";

const ProfileTabs = () => {
  return (
    <Tabs defaultValue="expertise">
      <TabsList>
        <TabsTrigger
          className="data-[state=active]:surface-glass data-[state=active]:border-accent-medium"
          value="expertise"
        >
          Work experience
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:surface-glass data-[state=active]:border-accent-medium"
          value="projects"
        >
          Projects
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:surface-glass data-[state=active]:border-accent-medium"
          value="skills"
        >
          Skills
        </TabsTrigger>
        <TabsTrigger
          className="data-[state=active]:surface-glass data-[state=active]:border-accent-medium"
          value="me"
        >
          More
        </TabsTrigger>
      </TabsList>
      <TabsContent value="expertise">
        <ProfileExpertiseTab />
      </TabsContent>
      <TabsContent value="projects">
        <ProfileProjectsTab />
      </TabsContent>
      <TabsContent value="skills">
        <ProfileSkillsTab />
      </TabsContent>
      <TabsContent value="me">
        <ProfileMoreTab />
      </TabsContent>
    </Tabs>
  );
};

export { ProfileTabs };

export default ProfileTabs;
