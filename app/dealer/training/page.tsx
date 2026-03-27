import { getDealerTrainingData } from "@/app/lib/dealer/training";
import { getDealerKnowledgePosts } from "@/app/lib/dealer/knowledge";
import { getCurrentDealer } from "@/app/lib/get-current-dealer";
import { canDealerCreateKnowledgeNote } from "@/app/lib/dealer/knowledge-access";
import TrainingClient from "./TrainingClient";

export default async function Page() {
  const [data, knowledgePosts, dealer] = await Promise.all([
    getDealerTrainingData(),
    getDealerKnowledgePosts(),
    getCurrentDealer(),
  ]);

  const canManageNotes = canDealerCreateKnowledgeNote(dealer?.login);

  return (
    <TrainingClient
      data={data}
      knowledgePosts={knowledgePosts}
      canManageNotes={canManageNotes}
      dealerLogin={dealer?.login ?? null}
    />
  );
}
