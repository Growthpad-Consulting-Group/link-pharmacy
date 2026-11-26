import { ServicePage } from "@/components/service-page";

export const metadata = { title: "Blood pressure checks" };

// General wording to review before launch.
export default function BloodPressureChecksPage() {
  return (
    <ServicePage
      title="Blood pressure checks"
      icon="lucide:heart-pulse"
      intro="A quick, private blood pressure reading, with advice on what the numbers mean and when to see a doctor. Regular checks help you spot changes early."
      points={[
        { title: "Quick reading", text: "A fast, painless check that takes only a few minutes, with no appointment needed at most branches." },
        { title: "Understanding your numbers", text: "We will explain your readings in plain language, so you know what is healthy and what is not." },
        { title: "Advice on next steps", text: "Guidance on lifestyle changes and on when to speak to a doctor about your results." },
        { title: "Keep track", text: "Ask us how often you should check, and how to keep a simple record between visits." },
      ]}
      actions={[
        { label: "Find a branch", href: "/find-a-pharmacy" },
        { label: "Read the guide", href: "/blog/understanding-blood-pressure-numbers" },
      ]}
    />
  );
}
