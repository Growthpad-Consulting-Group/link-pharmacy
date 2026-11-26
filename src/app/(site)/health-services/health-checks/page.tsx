import { ServicePage } from "@/components/service-page";

export const metadata = { title: "Health checks" };

// General wording to review before launch.
export default function HealthChecksPage() {
  return (
    <ServicePage
      title="Health checks"
      icon="lucide:clipboard-check"
      intro="Simple screening checks for everyday health, including blood sugar and weight, with clear advice on what the results mean and what to do next."
      points={[
        { title: "Blood sugar check", text: "A quick screening to help you understand your blood sugar and whether a follow-up is needed." },
        { title: "Weight and BMI", text: "A simple weight check with guidance on healthy goals that suit your lifestyle." },
        { title: "Clear next steps", text: "You leave with practical advice and, where needed, a referral to a doctor or clinic." },
        { title: "Private and friendly", text: "Checks are done in a private space, at a time that suits you." },
      ]}
      actions={[
        { label: "Book a health check", href: "/mediclinic#appointment" },
        { label: "Find a pharmacy", href: "/find-a-pharmacy" },
      ]}
    />
  );
}
