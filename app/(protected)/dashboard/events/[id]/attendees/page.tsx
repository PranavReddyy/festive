import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyAttendeesPage({ params }: Props) {
  const { id } = await params;
  redirect(`/dashboard/events/${id}`);
}
