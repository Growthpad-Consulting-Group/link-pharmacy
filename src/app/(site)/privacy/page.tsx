import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata = { title: "Privacy policy" };

const sections: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      "Link Pharmacy Ltd. operates this website and the Link Pharmacy and Link Mediclinic services. This policy explains what personal information we collect when you use the site, why we collect it, and the choices you have.",
    ],
  },
  {
    heading: "Information we collect",
    body: [
      "When you place an order we collect your name, email address, phone number and delivery address. When you contact us, sign up to the newsletter or use the Patient Portal, we collect the details you choose to send us.",
      "Your shopping cart is stored in your browser so it is still there when you return. We also collect basic technical information, such as your device type and the pages you visit, to keep the site working and to improve it.",
    ],
  },
  {
    heading: "Health information",
    body: [
      "Prescription and clinic information is sensitive. Please share only what we ask for, and only through the secure prescription and Patient Portal pages. We do not use health information for marketing.",
    ],
  },
  {
    heading: "How we use your information",
    body: [
      "We use your information to process and deliver orders, confirm stock and prices, answer your questions, provide pharmacy and clinic services, and send order updates. With your consent, we may also send newsletters, which you can stop at any time.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We share information only with the service providers that help us run the business, such as our order and inventory system, payment providers, delivery partners and website hosting. We may also share it when the law requires it. We do not sell your personal information.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep order and account records for as long as the law requires for pharmacy and tax purposes, and delete other information when it is no longer needed.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can ask to see, correct or delete the personal information we hold about you, and you can object to or restrict certain uses. You can also withdraw marketing consent at any time. To make a request, use the Help & contact page.",
    ],
  },
  {
    heading: "Security",
    body: [
      "We protect your information with secure connections and access controls. No online service is completely secure, so please keep your account details private.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "We may update this policy from time to time. The date at the top of this page shows when it last changed. Significant changes will be shown clearly on the site.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="Your privacy matters to us. This page explains how Link Pharmacy handles your personal and health information."
      sections={sections}
    />
  );
}
