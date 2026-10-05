import { repo } from "@/lib/data";
import { MenuEditor } from "@/components/admin/MenuEditor";

export const metadata = { title: "Menu" };

export default async function AdminMenuPage() {
  const menu = await repo().getMenu({ includeHidden: true });
  return <MenuEditor categories={menu.categories} dishes={menu.dishes} />;
}
