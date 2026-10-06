"use client";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="w-full h-11 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md">
      {label}
    </button>
  );
}
