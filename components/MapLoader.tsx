"use client";
import dynamic from "next/dynamic";
import type { CityCluster } from "./MemberMap";

const MemberMap = dynamic(() => import("./MemberMap"), {
  ssr: false,
  loading: () => <div className="h-[min(62vh,520px)] bg-surface-container-low animate-pulse" />,
});

export default function MapLoader(props: { cities: CityCluster[]; missingCity: boolean }) {
  return <MemberMap {...props} />;
}
