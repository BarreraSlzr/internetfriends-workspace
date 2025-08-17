import content from "../content.json";
import { Availability } from "./availability";

export default async function CompanyInfo() {
  const address = "Working Remote 🌐";

  return (
    <section className="sm:px-6 px-2 md:px-8 pb-2 pt-2 bg-background text-foreground">
      <div className="flex flex-col">
        <h1 className="text-lg font-medium h-5 text-foreground dark:text-white">{content.companyInfo.title}</h1>
        <p className="text-foreground dark:text-gray-300">{content.companyInfo.address1}</p>
        <p className="text-foreground dark:text-gray-300">{address}</p>
        <Availability availability="Partial Availability" className="pt-12" />
      </div>
    </section>
  );
}
