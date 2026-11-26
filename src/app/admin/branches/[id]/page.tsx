import { BranchEditor } from "@/components/admin/branch-editor";

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BranchEditor id={id} />;
}
