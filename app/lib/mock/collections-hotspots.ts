// Моки хотспотов ТОЛЬКО для CollectionsSlider
// Меняем ТОЛЬКО здесь: productId / xPct / yPct

export type Hotspot = {
  id: string;
  productId: string;
  xPct: number;
  yPct: number;
  side?: "left" | "right";
};

export type CollectionsHotspots = {
  [collectionId: string]: {
    [imageIndex: number]: Hotspot[];
  };
};

export const COLLECTIONS_HOTSPOTS: CollectionsHotspots = {
  amber: {
    0: [
      { id: "a-1", productId: "amber-tumbi-tumba", xPct: 12, yPct: 75 },
      { id: "a-2", productId: "amber-krovati-krovat", xPct: 50, yPct: 72 },
      { id: "a-3", productId: "amber-shkafy-shkaf-2d", xPct: 63, yPct: 46 },
      { id: "a-4", productId: "amber-komody-komod", xPct: 86, yPct: 65 },
      { id: "a-5", productId: "amber-zerkala-zerkalo-round", xPct: 91, yPct: 45 },
      { id: "a-6", productId: "amber-stellaji-stellaj-end", xPct: 50, yPct: 45 },
    ],
    1: [
      // второй слайд AMBER
      { id: "a2-1", productId: "amber-krovati-krovat", xPct: 48, yPct: 70 },
			{ id: "a2-2", productId: "amber-tumbi-tumba-tv-navesnaya", xPct: 80, yPct: 77 },
			{ id: "a2-3", productId: "amber-stoli-stol-na-nojkah", xPct: 28, yPct: 67 },
			{ id: "a2-4", productId: "amber-zerkala-zerkalo-round", xPct: 25, yPct: 55 },
			{ id: "a2-5", productId: "amber-shkafy-shkaf-2d", xPct: 18, yPct: 70 },
			{ id: "a2-6", productId: "amber-stellaji-stellaj-open", xPct: 12, yPct: 55 },
			{ id: "a2-7", productId: "amber-polki-antresol-2d", xPct: 6, yPct: 30 },
			{ id: "a2-8", productId: "amber-polki-antresol-1d", xPct: 12, yPct: 30 },
    ],
  },

  scandy: {
    0: [
      { id: "s-1", productId: "scandi-krovati-min-base", xPct: 44, yPct: 70 },
			{ id: "s-2", productId: "scandi-zerkala-on-dresser", xPct: 92, yPct: 45 },
			{ id: "s-3", productId: "scandi-shkafy-3d-mirror-combined", xPct: 66, yPct: 55 },
			{ id: "s-4", productId: "scandi-stoli-toilet", xPct: 87, yPct: 63 },
			{ id: "s-5", productId: "scandi-tumby-bedside", xPct: 10, yPct: 75 },
			{ id: "s-6", productId: "scandi-shkafy-1d-blind", xPct: 53, yPct: 55 },
    ],
    1: [
			{ id: "s-1", productId: "scandi-vitrini-2d-glass-shelves", xPct: 85, yPct: 50 },
			{ id: "s-2", productId: "scandi-tumby-tv", xPct: 67, yPct: 70 },
			{ id: "s-3", productId: "scandi-komody-3-drawers", xPct: 20, yPct: 65 },

		],
  },

  elizabeth: {
    0: [
			{ id: "с-1", productId: "elizabeth-komody-komod", xPct: 83, yPct: 50 },
			{ id: "с-2", productId: "elizabeth-krovati-bed", xPct: 50, yPct: 65 },
			{ id: "с-3", productId: "elizabeth-tumby-tumba-bedside-3drawers", xPct: 15, yPct: 65 },
		],
    1: [],
  },

  buongiorno: {
    0: [
			{ id: "d-1", productId: "buongiorno-krovati-bed-mattress", xPct: 65, yPct: 65 },
			{ id: "d-2", productId: "buongiorno-shkafy-shkaf-4d-drawers", xPct: 50, yPct: 45 },
			{ id: "d-3", productId: "buongiorno-zerkala-mirror", xPct: 15, yPct: 35 },
			{ id: "d-4", productId: "buongiorno-komody-komod-combined", xPct: 20, yPct: 65 },
		],
    1: [
			{ id: "d1-1", productId: "buongiorno-tumby-tv-tumba-tv", xPct: 65, yPct: 70 },
			{ id: "d1-2", productId: "buongiorno-vitrini-vitrina-2d", xPct: 45, yPct: 40 },
			{ id: "d1-3", productId: "buongiorno-vitrini-vitrina-1d", xPct: 87, yPct: 55 },
			
		],
  },

  pitti: {
    0: [
			{ id: "g-1", productId: "pitti-krovati-bed", xPct: 50, yPct: 70 },
			{ id: "g-2", productId: "pitti-stoli-stol-toilet-mirror", xPct: 85, yPct: 60 },
			{ id: "g-4", productId: "pitti-tumby-tumba-bedside", xPct: 22, yPct: 68 },
		],
    1: [],
  },

  salvador: {
    0: [
			{ id: "v-1", productId: "salvador-krovati-bed-mechanism", xPct: 35, yPct: 70 },
			{ id: "v-2", productId: "salvador-shkafy-4d-mirror", xPct: 63, yPct: 40 },
			{ id: "v-3", productId: "salvador-komody-komod", xPct: 83, yPct: 65},
			{ id: "v-4", productId: "salvador-zerkala-round", xPct: 88, yPct: 35},
			{ id: "v-5", productId: "salvador-tumby-tumba-bedside", xPct: 8, yPct: 75},
		],
    1: [
			{ id: "v1-1", productId: "salvador-krovati-bed-mechanism", xPct: 35, yPct: 70 },
		],
  },
};
