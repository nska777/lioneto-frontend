export function getKnowledgeCreatorLogins(): string[] {
  return String(process.env.DEALER_KNOWLEDGE_CREATORS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function canDealerCreateKnowledgeNote(login?: string | null): boolean {
  if (!login) return false;

  return getKnowledgeCreatorLogins().includes(login);
}