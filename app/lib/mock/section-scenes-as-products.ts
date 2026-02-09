// app/lib/mock/section-scenes-as-products.ts
import type { CatalogProduct } from "./catalog-base";
import { ALL_SCENES } from "./section-data";

/**
 * Превращает сцены (спальни / гостиные / молодежные)
 * в товары каталога, которые открываются через /product/[id]
 */
export function buildSectionSceneProducts(): CatalogProduct[] {
  return ALL_SCENES.map((scene) => {
    return {
      id: scene.id, // например: scene-bedrooms-scandi-white
      title: scene.title, // "Спальня"
      brand: scene.collection, // scandi / buongiorno / ...
      cat: scene.section, // bedrooms / living / youth
      badge: scene.badge,
      image: scene.cover || scene.gallery[0] || "",
      gallery: scene.gallery,
      priceRUB: scene.priceRUB,
      priceUZS: scene.priceUZS,
    };
  });
}
