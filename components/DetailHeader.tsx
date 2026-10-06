import BackLink from "./BackLink";

export default function DetailHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-primary-container/95 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.12)]">
      <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <BackLink />
          <h1 className="font-headline-sm text-headline-sm text-inverse-on-surface truncate">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  );
}
