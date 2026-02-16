// app/catalog/page.tsx
import CatalogClient from "./ui/CatalogClient";
import { fetchAllProductsLite } from "@/app/lib/strapi/products";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const brand = typeof sp.brand === "string" ? sp.brand : "";
  const category = typeof sp.category === "string" ? sp.category : "";

  // ✅ грузим ВСЕ страницы Strapi
  const { items, total } = await fetchAllProductsLite({ pageSize: 250 });

  // 🔎 быстрая проверка в логах сервера
  console.log("[catalog] strapi items:", items.length, "total:", total);

  return (
    <CatalogClient
      initialBrand={brand}
      initialCategory={category}
      initialProducts={items}
    />
  );
}
