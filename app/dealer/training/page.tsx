import { getDealerTrainingData } from "@/app/lib/dealer/training";
import TrainingClient from "./TrainingClient";

export default async function Page() {
  const data = await getDealerTrainingData();

  return <TrainingClient data={data} />;
}
