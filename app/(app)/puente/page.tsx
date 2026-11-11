import { requireUser } from "@/lib/session";
import DetailHeader from "@/components/DetailHeader";
import BridgePanel from "@/components/BridgePanel";

export default async function Puente() {
  await requireUser();
  return (
    <>
      <DetailHeader title="Puente del teléfono" />
      <main className="flex-1 w-full bg-surface pt-20 pb-12">
        <div className="px-margin py-4">
          <BridgePanel />
        </div>
      </main>
    </>
  );
}
