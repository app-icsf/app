import BottomNav from "@/components/BottomNav";
import CreateFab from "@/components/CreateFab";
import ScrollToTop from "@/components/ScrollToTop";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[480px] min-h-screen flex flex-col relative">
      <ScrollToTop />
      {children}
      <CreateFab />
      <BottomNav />
    </div>
  );
}
