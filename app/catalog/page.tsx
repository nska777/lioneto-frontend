import CatalogClient from "./ui/CatalogClient";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const brand = typeof sp.brand === "string" ? sp.brand : "";
  const category = typeof sp.category === "string" ? sp.category : "";

  return <CatalogClient initialBrand={brand} initialCategory={category} />;
}
