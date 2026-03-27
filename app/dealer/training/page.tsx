import { getDealerTrainingData } from "@/app/lib/dealer/training";
import { getDealerKnowledgePosts } from "@/app/lib/dealer/knowledge";
import {
  getDealerKnowledgeNotes,
  type KnowledgeFeedItem,
} from "@/app/lib/dealer/notes";
import { getCurrentDealer } from "@/app/lib/get-current-dealer";
import { canDealerCreateKnowledgeNote } from "@/app/lib/dealer/knowledge-access";
import TrainingClient from "./TrainingClient";

function getTimestamp(value?: string | null) {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

export default async function Page() {
  const [data, knowledgePosts, notePosts, dealer] = await Promise.all([
    getDealerTrainingData(),
    getDealerKnowledgePosts(),
    getDealerKnowledgeNotes(),
    getCurrentDealer(),
  ]);

  const canManageNotes = canDealerCreateKnowledgeNote(dealer?.login);

  const mergedPosts: KnowledgeFeedItem[] = [
    ...knowledgePosts.map((post) => ({
      ...post,
      sourceType: "knowledge_post" as const,
      authorLogin: null,
      authorTitle: null,
    })),
    ...notePosts,
  ].sort((a, b) => {
    return (
      getTimestamp(b.publishedAt || b.createdAt) -
      getTimestamp(a.publishedAt || a.createdAt)
    );
  });

  return (
    <TrainingClient
      data={data}
      knowledgePosts={mergedPosts}
      canManageNotes={canManageNotes}
      dealerLogin={dealer?.login ?? null}
      dealerRole={dealer?.role ?? null}
    />
  );
}
