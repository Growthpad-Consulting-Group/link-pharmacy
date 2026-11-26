import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata = { title: "Shipping & delivery" };

const sections: LegalSection[] = [
  { heading: "Delivery options", body: [
    "Collect from your nearest Link Pharmacy branch, or have your order delivered to your address. Collection is usually the quickest option when your order is ready.",
  ] },
  { heading: "Order confirmation", body: [
    "Orders are checked by our team before they are dispatched. Prescription items are only prepared once a pharmacist has approved them. We will contact you if anything needs confirming.",
  ] },
  { heading: "Delivery times", body: [
    "Delivery times are estimates and depend on your location, the time you order and the products in your basket. We will confirm an estimated time when your order is processed.",
  ] },
  { heading: "Delivery charges", body: [
    "Any delivery charge is shown before you pay. Collection from a branch is free of charge.",
  ] },
  { heading: "Cold-chain and sensitive items", body: [
    "Some medicines need to be kept cool or delivered with care. We pack these items to keep them safe, and we will tell you if a special delivery arrangement is needed.",
  ] },
  { heading: "Missed deliveries", body: [
    "If nobody is available to receive the order, our driver will try to contact you. Please make sure the address and phone number you give us are correct.",
  ] },
  { heading: "Problems with your delivery", body: [
    "If your order is late, damaged or incomplete, contact customer care with your order reference as soon as possible. We will investigate and put things right.",
  ] },
];

export default function Page() {
  return (
    <LegalPage
      title="Shipping & delivery"
      intro="How we deliver your medicines and products, what it costs, and how long it takes."
      sections={sections}
    />
  );
}
