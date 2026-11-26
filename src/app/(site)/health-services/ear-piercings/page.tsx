import { ServicePage } from "@/components/service-page";

export const metadata = { title: "Ear piercings" };

// General wording to review before launch.
export default function EarPiercingsPage() {
  return (
    <ServicePage
      title="Ear piercings"
      icon="lucide:gem"
      intro="Professional ear piercing in a clean, private setting. Book in advance and ask us about aftercare so your new piercing heals well."
      points={[
        { title: "Clean, private setting", text: "Piercings are done in a hygienic space, with a calm and private experience." },
        { title: "Book in advance", text: "Reserve your slot ahead of time to avoid waiting, especially at busy periods." },
        { title: "Aftercare advice", text: "Clear instructions on cleaning and caring for your new piercing while it heals." },
        { title: "Questions first", text: "Not sure what to expect? Ask our team before you book and we will talk you through it." },
      ]}
      actions={[
        { label: "Ask about availability", href: "/customer-care" },
        { label: "Find a branch", href: "/find-a-pharmacy" },
      ]}
    />
  );
}
