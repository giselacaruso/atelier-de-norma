import { redirect } from "next/navigation";
import { esNorma } from "@/lib/sesion";
import { NuevaPieza } from "./NuevaPieza";

export default async function Nueva() {
  if (!(await esNorma())) redirect("/taller");
  return <NuevaPieza />;
}
