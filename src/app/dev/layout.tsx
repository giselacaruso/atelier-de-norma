import { notFound } from "next/navigation";

export default function SoloDesarrollo({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") notFound();
  return children;
}
