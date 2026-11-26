import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata = { title: "Terms of use" };

const sections: LegalSection[] = [
  {
    heading: "Using this website",
    body: [
      "By using this website you agree to these terms. If you do not agree, please do not use the site. You must be at least 18, or use the site with a parent or guardian, to place an order.",
    ],
  },
  {
    heading: "Products and prices",
    body: [
      "We make every effort to show accurate product information, prices and stock levels. Prices include applicable taxes unless stated otherwise. If a price or product is shown in error, we may cancel the order and tell you.",
    ],
  },
  {
    heading: "Orders",
    body: [
      "Placing an order is an offer to buy. We confirm each order by email, and the contract is formed when we confirm it. We may decline or cancel an order, for example when a product is out of stock or the details cannot be verified.",
    ],
  },
  {
    heading: "Prescription medicines",
    body: [
      "Some products require a valid prescription, and we may ask you to upload one or to speak with a pharmacist before we dispense. Prescription items are supplied only when the requirements are met. Upload only genuine prescriptions.",
    ],
  },
  {
    heading: "Delivery",
    body: [
      "Delivery times are estimates and depend on your location and the product. Risk passes to you when the order is delivered to the address you gave us. Please check your order on arrival and tell us promptly about any damage or missing items.",
    ],
  },
  {
    heading: "Returns and refunds",
    body: [
      "For reasons of health and safety, medicines and some personal care products cannot be returned once opened. Faulty or incorrect items can be returned or exchanged. Refunds are issued to the original payment method.",
    ],
  },
  {
    heading: "Use of medical advice",
    body: [
      "Information on this site is for general guidance and does not replace advice from a doctor or pharmacist. Always read the product label and speak to a healthcare professional if you are unsure.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "You must not misuse the site, attempt to gain unauthorised access to our systems, copy our content without permission, or use the site for unlawful purposes.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "To the extent permitted by law, we are not liable for indirect or consequential losses. Nothing in these terms limits liability for death or personal injury caused by negligence, or any other liability that cannot be limited by law.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      "These terms are governed by the laws of the jurisdiction in which Link Pharmacy Ltd. is registered. Replace this clause with the governing law and courts that apply to your business before launch.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro="These terms set out the rules for using the Link Pharmacy website and buying from us."
      sections={sections}
    />
  );
}
