import Interpretation from "@/app/interpret/[dateKey]/Interpretation";

type Params = Promise<{ dateKey: string }>;
export default async function Page({ params }: { params: Params}) {
  const { dateKey } = await params;
  return <Interpretation dateKey={dateKey}/>
}