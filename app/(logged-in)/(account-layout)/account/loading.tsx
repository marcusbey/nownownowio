import { Loader } from "@/components/feedback/loader";

export default async function RouteLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader size={32} />
    </div>
  );
}
