import { repo } from "@/lib/data";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { MenuTranslations } from "@/components/admin/MenuTranslations";
import { QrCard } from "@/components/admin/QrCard";

export const metadata = { title: "Menu" };

export default async function AdminMenuPage() {
  const menu = await repo().getMenu({ includeHidden: true });
  return (
    <>
      <MenuEditor categories={menu.categories} dishes={menu.dishes}>
        <MenuTranslations categories={menu.categories} dishes={menu.dishes} />
      </MenuEditor>
      <div className="mt-10">
        <QrCard />
      </div>
    </>
  );
}
