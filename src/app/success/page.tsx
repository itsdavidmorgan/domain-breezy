import SuccessClient from "./SuccessClient";

type SuccessPageProps = {
  searchParams: Promise<{
    domain?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  return <SuccessClient domain={params.domain ?? ""} />;
}
