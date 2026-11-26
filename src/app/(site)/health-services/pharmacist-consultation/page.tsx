import { ServicePage } from "@/components/service-page";

export const metadata = { title: "Pharmacist consultation" };

// General wording to review before launch.
export default function PharmacistConsultationPage() {
  return (
    <ServicePage
      title="Pharmacist consultation"
      icon="lucide:message-circle"
      intro="Talk to a pharmacist privately about your medicines, symptoms or a new prescription. We will explain what you need to know and help you use your medicine safely."
      points={[
        { title: "Medicine questions", text: "How and when to take a medicine, what to avoid while taking it, and what side effects to watch for." },
        { title: "Advice on symptoms", text: "Practical advice for minor complaints, and guidance on when you should see a doctor instead." },
        { title: "Understanding your prescription", text: "Help reading your label, checking the dose, and making sure you have the right information." },
        { title: "Everyday health", text: "Quick, friendly answers to questions about vitamins, supplements and other products you are considering." },
      ]}
      actions={[
        { label: "Find a pharmacy", href: "/find-a-pharmacy" },
        { label: "Contact customer care", href: "/customer-care" },
      ]}
    />
  );
}
