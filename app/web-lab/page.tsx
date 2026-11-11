import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { sampleImageName } from "@/lib/web-lab/lessons";
import WebLab from "./WebLab";

export const metadata: Metadata = {
  title: "HTML & CSS · Карт бүтээе · КодЛаб",
  description:
    "6–8-р ангийн HTML, CSS хичээл. Кодоо бичиж, картаа шууд хараарай.",
};

export default async function WebLabPage() {
  const image = await readFile(
    join(process.cwd(), "public", "web-lab", sampleImageName),
  );
  return (
    <WebLab
      sampleImage={`data:image/jpeg;base64,${image.toString("base64")}`}
    />
  );
}
