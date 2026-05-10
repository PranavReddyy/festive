import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-[40vh] grid place-items-center">
      <LoadingSpinner />
    </div>
  );
}
