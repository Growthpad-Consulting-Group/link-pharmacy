import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata = { title: "Special orders" };

const sections: LegalSection[] = [
  { heading: "What a special order is", body: [
    "If a product is not on our shelves or online, we can usually order it from a supplier. Special orders are useful for specialist medicines, imported products and items you buy regularly.",
  ] },
  { heading: "How to place a special order", body: [
    "Contact customer care or visit a branch with the product name, brand, strength or size, and any product code you have. Our team will check availability and confirm the price and an estimated arrival time.",
  ] },
  { heading: "Prescription items", body: [
    "Special orders for prescription medicines need a valid prescription. A pharmacist will check it before we order the medicine.",
  ] },
  { heading: "Payment and cancellation", body: [
    "You will be asked to confirm a special order before we place it with the supplier. Because the product is ordered for you, it may not be possible to cancel once the supplier has accepted the order.",
  ] },
  { heading: "When it arrives", body: [
    "We will contact you when the product arrives. Please collect it within the period we give you, after which the order may be returned to the supplier.",
  ] },
];

export default function Page() {
  return (
    <LegalPage
      title="Special orders"
      intro="Can't find what you need on the shop? We can often order it in for you."
      sections={sections}
    />
  );
}
