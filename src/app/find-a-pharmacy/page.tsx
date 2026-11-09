import { PageRibbon } from "@/components/page-ribbon";
import { BranchList } from "@/components/branch-list";
import { BRANCHES } from "@/lib/branches";

export const metadata = { title: "Find a pharmacy" };

export default function FindAPharmacyPage() {
  return (
    <div className="space-y-10">
      <PageRibbon crumbs={[{ label: "Home", href: "/" }, { label: "Find a pharmacy" }]} title="Find a pharmacy" />
      <p className="max-w-2xl text-lg leading-relaxed text-ink/80">
        Search for the Link Pharmacy nearest you, check opening hours and services, and get directions.
      </p>
      <BranchList branches={BRANCHES} />
    </div>
  );
}
