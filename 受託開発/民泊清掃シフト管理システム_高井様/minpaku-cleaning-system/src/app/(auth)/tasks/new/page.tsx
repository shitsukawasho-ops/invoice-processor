import prisma from "@/lib/prisma";
import NewTaskForm from "./NewTaskForm";

async function getProperties() {
  return prisma.property.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

async function getStaff() {
  return prisma.staff.findMany({
    where: { isActive: true },
    include: {
      propertyAssignments: true,
    },
    orderBy: { name: "asc" },
  });
}

export default async function NewTaskPage() {
  const [properties, staff] = await Promise.all([getProperties(), getStaff()]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">🧹 新規タスク作成</h1>
      <NewTaskForm properties={properties} staff={staff} />
    </div>
  );
}
