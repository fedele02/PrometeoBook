import { repo } from "@/lib/data";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { QrCard } from "@/components/admin/QrCard";

export const metadata = { title: "Menu" };

export default async function AdminMenuPage() {
  const menu = await repo().getMenu({ includeHidden: true });
  return (
    <>
      <MenuEditor categories={menu.categories} dishes={menu.dishes} />
      <div className="mt-10">
        <QrCard />
      </div>
    </>
  );
}
