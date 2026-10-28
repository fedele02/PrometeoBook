import type { Metadata } from "next";
import { TableMenu } from "@/components/menu/MenuPages";

export const metadata: Metadata = {
  title: "Menu",
  robots: { index: false, follow: false },
};

export default function TableMenuPage() {
  return <TableMenu lang="it" />;
}
