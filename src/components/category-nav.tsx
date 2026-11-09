"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";

// An item with an image replaces the feature image while it is hovered or focused.
type MenuItem = { label: string; href: string; image?: string };
type MenuColumn = { title: string; items: MenuItem[] };
type Feature = { caption: string; href: string; image?: string; icon?: string }; // icon is used where no image exists yet
type Menu = {
  label: string;
  columns: MenuColumn[];
  feature: Feature;
  viewAll: MenuItem;
};

/** The category must match the product's category name exactly for the shop filter to find it. */
function shopItem(label: string, { category = label, image }: { category?: string; image?: string } = {}): MenuItem {
  return { label, href: `/shop?category=${encodeURIComponent(category)}`, image };
}

// Shown in the header search dropdown.
export const SHOP_CATEGORIES: MenuItem[] = [
  shopItem("Vitamins & Supplements"),
  shopItem("Personal Care"),
  shopItem("Medical Devices"),
  shopItem("Wellness"),
];

const CONSULTATION_IMAGE = "/consultation-image.webp";

const MENUS: Menu[] = [
  {
    label: "Shop products",
    columns: [
      {
        title: "Health & Wellbeing",
        items: [
          shopItem("Medicines & treatments", { image: "/categories/medicines.svg" }),
          shopItem("Vitamins & supplements", { category: "Vitamins & Supplements", image: "/categories/supplements.svg" }),
          shopItem("Fitness & Nutrition"),
          shopItem("Home health care", { category: "Medical Devices", image: "/categories/home-care.svg" }),
        ],
      },
      {
        title: "Personal & Family Care",
        items: [
          shopItem("Personal care", { category: "Personal Care", image: "/categories/personal-care.svg" }),
          shopItem("Baby & Kids", { image: "/categories/kids.svg" }),
          shopItem("Beauty", { image: "/categories/beauty.svg" }),
          shopItem("Sexual wellness"),
        ],
      },
      {
        title: "More to explore",
        items: [
          shopItem("Contact lenses & Glasses"),
          shopItem("Grocery"),
          shopItem("Household"),
          shopItem("Veterinary"),
        ],
      },
    ],
    feature: { caption: "Explore Personal care", href: shopItem("", { category: "Personal Care" }).href, image: "/categories/personal-care.svg" },
    viewAll: { label: "View all products", href: "/shop" },
  },
  {
    label: "Prescriptions",
    columns: [
      {
        title: "Manage prescriptions",
        items: [
          { label: "Upload a prescription", href: "/info/prescriptions", image: "/categories/medicines.svg" },
          { label: "Refill a prescription", href: "/info/prescriptions", image: "/categories/supplements.svg" },
          { label: "Transfer a prescription", href: "/info/prescriptions" },
        ],
      },
    ],
    feature: { caption: "Explore Prescriptions", href: "/info/prescriptions", image: "/categories/medicines.svg" },
    viewAll: { label: "View all prescription services", href: "/info/prescriptions" },
  },
  {
    label: "Health services",
    columns: [
      {
        title: "In-store care",
        items: [
          { label: "Pharmacist consultation", href: "/info/health-services", image: CONSULTATION_IMAGE },
          { label: "Vaccinations", href: "/info/health-services" },
          { label: "Health checks", href: "/info/health-services", image: "/categories/home-care.svg" },
        ],
      },
    ],
    feature: { caption: "Explore Health services", href: "/info/health-services", image: "/categories/home-care.svg" },
    viewAll: { label: "View all health services", href: "/info/health-services" },
  },
  {
    label: "Ear Piercings",
    columns: [
      {
        title: "Ear piercings",
        items: [
          { label: "Book an ear piercing", href: "/info/ear-piercings" },
          { label: "Find a pharmacy", href: "/find-a-pharmacy" },
        ],
      },
    ],
    feature: { caption: "Explore Ear piercings", href: "/info/ear-piercings", icon: "lucide:gem" },
    viewAll: { label: "View all ear piercing services", href: "/info/ear-piercings" },
  },
  {
    label: "Mediclinic",
    columns: [
      {
        title: "Clinic care",
        items: [
          { label: "Book an appointment", href: "/info/mediclinic", image: CONSULTATION_IMAGE },
          { label: "Our services", href: "/info/mediclinic" },
          { label: "Clinic hours", href: "/info/mediclinic" },
        ],
      },
    ],
    feature: { caption: "Explore Mediclinic", href: "/info/mediclinic", image: CONSULTATION_IMAGE },
    viewAll: { label: "View all clinic services", href: "/info/mediclinic" },
  },
];

function ArrowLink({ item, onSelect }: { item: MenuItem; onSelect: () => void }) {
  return (
    <Link href={item.href} onClick={onSelect} className="group inline-flex items-center gap-2 font-semibold text-ink hover:underline underline-offset-4">
      {item.label}
      <Icon icon="lucide:arrow-right" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}

function MenuPanel({ menu, onSelect }: { menu: Menu; onSelect: () => void }) {
  const { columns, viewAll } = menu;
  const [preview, setPreview] = useState<Feature | null>(null);
  const feature = preview ?? menu.feature;

  function showPreview(item: MenuItem) {
    if (item.image) setPreview({ caption: `Explore ${item.label}`, href: item.href, image: item.image });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-12">
        <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-ink">{column.title}</h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                {column.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onSelect}
                      onMouseEnter={() => showPreview(item)}
                      onFocus={() => showPreview(item)}
                      className="text-ink/80 hover:text-ink hover:underline underline-offset-4"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Link href={feature.href} onClick={onSelect} className="group flex shrink-0 flex-col gap-2 md:w-72">
          <span className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm bg-[#F4F8D5]">
            {feature.image ? (
              <motion.img
                key={feature.image}
                src={feature.image}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              feature.icon && <Icon icon={feature.icon} className="h-12 w-12 text-ink" aria-hidden />
            )}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            {feature.caption}
            <Icon icon="lucide:arrow-right" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-sm">
        <ArrowLink item={viewAll} onSelect={onSelect} />
        <p className="flex items-center gap-2 text-muted">
          Need help?
          {/* TODO: replace placeholder href with the real contact page. */}
          <ArrowLink item={{ label: "Contact Us", href: "#" }} onSelect={onSelect} />
        </p>
      </div>
    </div>
  );
}

export function CategoryNav() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const openMenu = MENUS.find((menu) => menu.label === openLabel);

  useEffect(() => {
    if (!openLabel) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpenLabel(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenLabel(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openLabel]);

  return (
    <div ref={ref} className="relative bg-brand text-ink shadow-sm">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-wrap items-center px-4">
        {MENUS.map((menu, index) => {
          const isOpen = menu.label === openLabel;
          return (
            <div key={menu.label} className="flex items-center">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenLabel(isOpen ? null : menu.label)}
                className={`flex items-center gap-1 whitespace-nowrap px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink/10 ${isOpen ? "bg-ink/10" : ""}`}
              >
                {menu.label}
                <Icon
                  icon="lucide:chevron-down"
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {index === 0 && <span aria-hidden className="mx-1 h-6 w-px bg-ink/20" />}
            </div>
          );
        })}
      </nav>

      <AnimatePresence>
        {openMenu && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-50 bg-white shadow-lg"
          >
            <MenuPanel key={openMenu.label} menu={openMenu} onSelect={() => setOpenLabel(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
