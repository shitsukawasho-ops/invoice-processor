import prisma from "@/lib/prisma";
import NewStaffForm from "./NewStaffForm";

async function getProperties() {
  return prisma.property.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export default async function NewStaffPage() {
  const properties = await getProperties();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">👤 新規スタッフ登録</h1>
      <NewStaffForm properties={properties} />
    </div>
  );
}
