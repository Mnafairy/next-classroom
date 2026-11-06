export type ExerciseDraft = {
  selected: number;
  completed: number[];
  notes: Record<string, string>;
  extension: number;
};
export const emptyExercises: ExerciseDraft = {
  selected: 0,
  completed: [],
  notes: {},
  extension: 0,
};
export function restoreExercises(raw: unknown): ExerciseDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<ExerciseDraft>;
  if (
    !Number.isInteger(value.selected) ||
    value.selected! < 0 ||
    value.selected! > 5 ||
    !Number.isInteger(value.extension) ||
    value.extension! < 0 ||
    value.extension! > 1000000 ||
    !Array.isArray(value.completed) ||
    value.completed.some((n) => !Number.isInteger(n) || n < 0 || n > 5) ||
    !value.notes ||
    typeof value.notes !== "object" ||
    Object.entries(value.notes).some(
      ([key, note]) =>
        !/^[0-5]$/.test(key) || typeof note !== "string" || note.length > 12000,
    )
  )
    return null;
  return {
    selected: value.selected!,
    completed: [...new Set(value.completed)],
    notes: value.notes,
    extension: value.extension!,
  };
}

export const extensionPrompts = [
  "Эх даалгаврын үр дүнг хэвээр шалгаад хоёр шинэ өгөгдөл эсвэл нөхцөл нэм. Шинэ тохиолдол бүрийн хүлээх үр дүнг эхлээд бичээд бүтээлээрээ батал.",
  "Энэ даалгаварт алдаа гарч болох өөр нэг нөхцөл ол. Алдааг давтах жишээ, тайлбар, зассан шийдэл, дахин шалгасан үр дүнгээ бэлтгэ.",
  "Ижил зорилгыг өөр аргаар шийд. Хоёр аргын үр дүнг ижил гурван тохиолдлоор харьцуулж, аль нь ойлгомжтойг тайлбарла.",
  "Хэрэглэгчийн нэг шинэ шаардлага өөрөө зохио. Хүлээн авах хоёр шалгуур бичээд бүтээлдээ нэмж, өмнөх шаардлагууд хэвээр биелснийг шалга.",
  "Энэ чадвараар өөр сэдэвтэй жижиг бүтээл хий. Шинэ хэрэглэгч, өгөгдөл, хүлээх үр дүнгээ нэрлээд ажилладаг жишээ эсвэл загвар болон гурван шалгалт үзүүл.",
] as const;
