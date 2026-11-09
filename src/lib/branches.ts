// Sample branch data. Replace with your real locations (or load them from Odoo or a CMS) before launch.
export type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  services: string[];
};

export const SERVICES = ["Prescriptions", "Vaccinations", "Clinic", "Consultations"] as const;

export const BRANCHES: Branch[] = [
  {
    id: "central",
    name: "Link Pharmacy Central",
    address: "1 Example Street, Central",
    city: "Central",
    phone: "+00 000 000 001",
    hours: "Mon to Fri 8:00 to 20:00, Sat 9:00 to 18:00",
    services: ["Prescriptions", "Vaccinations", "Clinic", "Consultations"],
  },
  {
    id: "north",
    name: "Link Pharmacy North",
    address: "22 Sample Avenue, North",
    city: "North",
    phone: "+00 000 000 002",
    hours: "Mon to Sat 8:30 to 19:00, Sun closed",
    services: ["Prescriptions", "Consultations"],
  },
  {
    id: "riverside",
    name: "Link Pharmacy Riverside",
    address: "7 Placeholder Road, Riverside",
    city: "Riverside",
    phone: "+00 000 000 003",
    hours: "Mon to Sun 9:00 to 21:00",
    services: ["Prescriptions", "Vaccinations", "Clinic"],
  },
];
