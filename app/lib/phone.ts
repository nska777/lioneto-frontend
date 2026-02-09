export function normalizePhone(input: string, region: "uz" | "ru") {
  const raw = String(input || "").trim();

  // оставляем только + и цифры
  let s = raw.replace(/[^\d+]/g, "");

  // если нет + — попробуем привести
  if (!s.startsWith("+")) {
    // RU: люди часто вводят 8xxxxxxxxxx
    if (region === "ru") {
      if (s.startsWith("8")) s = "+7" + s.slice(1);
      else if (s.startsWith("7")) s = "+7" + s.slice(1);
      else s = "+7" + s; // fallback
    }

    // UZ: часто вводят 998xxxxxxxxx или 9xxxxxxxx
    if (region === "uz") {
      if (s.startsWith("998")) s = "+" + s;
      else if (s.startsWith("0")) s = "+998" + s.slice(1);
      else s = "+998" + s;
    }
  }

  return s;
}

export function isPhoneValidE164(phone: string) {
  // очень базовая проверка: + и 9-15 цифр
  return /^\+\d{9,15}$/.test(phone);
}
