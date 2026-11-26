import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata = { title: "Product recalls" };

const sections: LegalSection[] = [
  { heading: "What a recall is", body: [
    "A recall happens when a manufacturer or the regulator withdraws a product because of a quality, safety or labelling concern. We follow the regulator's instructions and act quickly to protect our customers.",
  ] },
  { heading: "How we contact you", body: [
    "If a product you have bought is recalled, we will contact you using the details on your order, and we will publish the notice on this website.",
  ] },
  { heading: "What to do if your product is recalled", body: [
    "Do not use the product. Keep it safe and bring it to any Link Pharmacy branch, or contact customer care. We will advise you and arrange a refund or replacement where appropriate.",
  ] },
  { heading: "Reporting a problem", body: [
    "If you think a product has caused you harm or a side effect, speak to a pharmacist or doctor straight away. You can also tell us through customer care so we can record and act on it.",
  ] },
];

export default function Page() {
  return (
    <LegalPage
      title="Product recalls"
      intro="How we tell you if a product you bought has been recalled, and what to do."
      sections={sections}
    />
  );
}
