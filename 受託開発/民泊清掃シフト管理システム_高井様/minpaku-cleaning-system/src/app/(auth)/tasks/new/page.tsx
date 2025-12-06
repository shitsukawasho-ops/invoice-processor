import prisma from "@/lib/prisma";
import NewTaskForm from "./NewTaskForm";
import { Plus } from "lucide-react";

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
    <div className="p-8 max-w-3xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-sky-600" />
          </div>
          新規タスク作成
        </h1>
        <p className="text-slate-500 mt-1 ml-14">新しい清掃タスクを作成し、スタッフに割り当てます</p>
      </div>
      <NewTaskForm properties={properties} staff={staff} />
    </div>
  );
}
