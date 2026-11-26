import { ServicePage } from "@/components/service-page";

export const metadata = { title: "Vaccinations" };

// General wording to review before launch.
export default function VaccinationsPage() {
  return (
    <ServicePage
      title="Vaccinations"
      icon="lucide:syringe"
      intro="Routine and seasonal vaccinations for adults and children, including flu. Ask us which vaccines are due and what to expect before and after your injection."
      points={[
        { title: "Seasonal flu vaccine", text: "Protect yourself and your family ahead of the flu season. Ask us whether it is right for you this year." },
        { title: "Routine vaccinations", text: "Check which vaccines are due for your children or yourself, and keep your records up to date." },
        { title: "Travel vaccinations", text: "Ask which vaccines and precautions your destination requires, and plan ahead of your trip." },
        { title: "Before and after", text: "Advice on what to expect after your vaccine, including common reactions and when to get help." },
      ]}
      actions={[
        { label: "Find a branch", href: "/find-a-pharmacy" },
        { label: "Ask about travel vaccines", href: "/mediclinic#appointment" },
      ]}
    />
  );
}
