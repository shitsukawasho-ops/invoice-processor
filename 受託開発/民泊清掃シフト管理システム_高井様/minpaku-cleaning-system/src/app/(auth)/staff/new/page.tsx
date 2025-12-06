import prisma from "@/lib/prisma";
import NewStaffForm from "./NewStaffForm";
import { UserPlus } from "lucide-react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getProperties() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return [];
  }

  const properties = await prisma.property.findMany({
    where: {
      isActive: true,
      organizationId: session.user.organizationId
    },
    orderBy: { name: "asc" },
  });

  return properties;
}

export default async function NewStaffPage() {
  const properties = await getProperties();

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
          新規スタッフ登録
        </h1>
        <p className="text-slate-500 mt-1 ml-14">新しい清掃スタッフを登録します</p>
      </div>
      <NewStaffForm properties={properties} />
    </div>
  );
}
