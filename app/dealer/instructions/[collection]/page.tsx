// app/dealer/instructions/[collection]/page.tsx
import InstructionsModulesClient from "./InstructionsModulesClient";

type Params = { collection: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { collection } = await params;
  return <InstructionsModulesClient collection={collection} />;
}
