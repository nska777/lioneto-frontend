export type RegionKey = "uz" | "ru";

export type StoreLegalDetails = {
  ogrn?: string;
  inn?: string;
  kpp?: string;
  legalAddress?: string;
};

export type Store = {
  id: string;
  title: string;
  phone?: string;
  address: string;
  hours?: string;
  mapQuery: string;
  legalDetails?: StoreLegalDetails;
};

export const UZ_STORES: Store[] = [
  {
    id: "uz-1",
    title: "Ташкент • Rich House",
    phone: "+998 (90) 925 60 06 / +998 (90) 003 80 08",
    address: "ул. Мирзо-Улугбека, 18 • Rich House",
    hours: "09:00 — 18:00",
    mapQuery: "Ташкент, улица Мирзо-Улугбека 18 Rich House",
  },
  {
    id: "uz-2",
    title: "Ташкент • Arca Mebel",
    phone: "+998 (90) 927 40 04",
    address: "Ташкент, Яшнабадский район, улица Махтумкули, 75",
    hours: "09:00 — 18:00",
    mapQuery: "г. Ташкент, Яшнабадский район, улица Махтумкули, 75",
  },
  {
    id: "uz-3",
    title: "Ташкент • Arca Premium",
    phone: "+998 (90) 002 12 30",
    address: "г. Ташкент, Яшнабадский район, улица Махтумкули, 75/4",
    hours: "09:00 — 18:00",
    mapQuery: "г. Ташкент, Яшнабадский район, улица Махтумкули, 75/4",
  },
  {
    id: "uz-4",
    title: "Ташкент • Ecobazar Atlas Mebel",
    phone: "+998 (90) 042 68 17",
    address: "г. Ташкент, Мирзо-Улугбекский район, улица Тимура Малика, 3А",
    hours: "09:00 — 18:00",
    mapQuery: "г. Ташкент, Мирзо-Улугбекский район, улица Тимура Малика, 3А",
  },
];

export const RU_STORES: Store[] = [
  {
    id: "ru-comfort-plus",
    title: 'ООО "КОМФОРТ ПЛЮС"',
    address:
      "109443, г. Москва, вн.тер.г. муниципальный округ Кузьминки, пр-кт Волгоградский, д. 135 к. 3, помещ. 7М",
    mapQuery:
      "109443, Москва, Волгоградский проспект, 135 к 3, помещение 7М",
    legalDetails: {
      ogrn: "1267700104352",
      inn: "9721264165",
      kpp: "772101001",
      legalAddress:
        "109443, г. Москва, вн.тер.г. муниципальный округ Кузьминки, пр-кт Волгоградский, д. 135 к. 3, помещ. 7М",
    },
  },
];