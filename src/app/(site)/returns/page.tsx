import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata = { title: "Returns" };

const sections: LegalSection[] = [
  { heading: "Faulty or incorrect items", body: [
    "If an item arrives damaged, faulty or is not what you ordered, contact us within 48 hours with your order reference and a photo of the item. We will replace it or refund you.",
  ] },
  { heading: "Medicines and health products", body: [
    "For your safety, medicines and products that affect your health cannot be returned once they have left the pharmacy, unless they are faulty or dispensed in error.",
  ] },
  { heading: "Unopened personal care and wellness products", body: [
    "Unopened, unexpired personal care and wellness products may be returned within 14 days of delivery or collection, in their original packaging with the receipt.",
  ] },
  { heading: "How to start a return", body: [
    "Contact customer care with your order reference and the reason for the return. We will confirm whether the item is eligible and tell you how to send it back or bring it to a branch.",
  ] },
  { heading: "Refunds", body: [
    "Approved refunds are paid to the original payment method. Please allow a few working days for the refund to appear, depending on your bank.",
  ] },
];

export default function Page() {
  return (
    <LegalPage
      title="Returns"
      intro="What you can return, how to start a return, and when you will be refunded."
      sections={sections}
    />
  );
}
