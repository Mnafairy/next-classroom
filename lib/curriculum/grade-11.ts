import { file, snippet } from "./examples";
import type { GradePlan } from "./types";

const foundations = {
  label: "Next Classroom · Суурь дасгалууд",
  href: "/next-classroom",
};
const localProject =
  "App Router ба TypeScript сонгож үүсгэсэн дасгалын төсөл. npm run dev ажиллуулаад терминалд гарсан хаягийг браузерт нээнэ.";

export const grade11: GradePlan = {
  grade: 11,
  summary: "Next.js, судалгааны веб, AI-тай хөгжүүлэлт ба багийн төсөл",
  units: [
    {
      title: "1. Next.js суурь",
      lessons: [
        {
          id: "next-setup",
          sourceRow: 9,
          periods: 3,
          coverage: "existing",
          title: "Next.js танилцуулга ба орчин бэлдэх",
          existing: {
            summary:
              "Next Classroom-ийн Get set up болон Meet Next.js модулиар Node.js, create-next-app, npm run dev, төслийн бүтэц, эхний хуудсаа өөрчлөхийг үзнэ.",
            links: [foundations],
          },
        },
        {
          id: "pages-and-links",
          sourceRow: 10,
          periods: 3,
          coverage: "extended",
          title: "App Router · Хуудас ба Link",
          existing: {
            summary:
              "Meet Next.js-д page.tsx болон layout.tsx-ийн үүргийг танилцуулдаг. Энд бодит зам үүсгэж, Link-ээр холбож ажиллуулна.",
            links: [foundations],
          },
          objective:
            "app хавтсаар гурван зам үүсгэн, холбоос болон браузерийн Back үйлдлийг шалгана.",
          materials: localProject,
          example: {
            explanation:
              "app/page.tsx нь / зам, app/about/page.tsx нь /about зам. Link-д файлын нэрийн оронд хуудасны хаягийг өгнө.",
            files: [
              file(
                "app/page.tsx",
                `import Link from "next/link";

export default function Home() {
  return <main><h1>Клубийн нүүр</h1><Link href="/about">Клубийн тухай</Link></main>;
}`,
              ),
              file(
                "app/about/page.tsx",
                `import Link from "next/link";

export default function About() {
  return <main><h1>Клубийн тухай</h1><Link href="/">Нүүр</Link></main>;
}`,
              ),
            ],
          },
          practice: [
            "Хоёр файлыг заасан хавтаст байрлуул. /about хаягийг шууд нээж шалга.",
            "app/contact/page.tsx үүсгэ. Бодит холбоо барих мэдээллийн оронд зохиомол клубийн ажиллах цаг бич.",
            "Гурван хуудаснаас нэг нэг рүү шилжих цэс нэм. Шууд хаяг, Back, буруу замыг турш.",
          ],
          deliverable: "Гурван замтай жижиг Next.js сайт.",
          criteria: [
            "Хавтас ба URL зөв таарна.",
            "Link бүр зорьсон хуудас руу очно.",
            "Шууд хаяг болон Back шалгагдсан.",
          ],
          check: {
            question: "app/events/page.tsx файлыг ямар URL-аар нээх вэ?",
            answer: "/events. app болон page.tsx нь URL-ийн хэсэг болохгүй.",
          },
        },
        {
          id: "components-map",
          sourceRow: 11,
          periods: 4,
          coverage: "extended",
          title: "JSX, props ба map-аар картын жагсаалт",
          existing: {
            summary:
              "Build a component, Use props, Build a Card модулиудад компонент ба props бий. Энд массивын өөрчлөлтөөр жагсаалтаа бүрдүүлнэ.",
            links: [foundations],
          },
          objective:
            "Картын нэг компонентыг массивын бичлэг бүрд map-аар дүрсэлнэ.",
          materials: localProject,
          example: {
            explanation:
              "Props нь компонентын оролт. map нь бичлэг бүрээс JSX карт үүсгэнэ. key нь байрлал өөрчлөгдөхөд React-д бичлэгийг id-аар нь танихад тусална.",
            files: [
              file(
                "app/ClubCard.tsx",
                `export default function ClubCard({ name, time }: { name: string; time: string }) {
  return <li><h2>{name}</h2><p>{time}</p></li>;
}`,
              ),
              file(
                "app/page.tsx",
                `import ClubCard from "./ClubCard";

const clubs = [
  { id: "robot", name: "Робот", time: "15:00" },
  { id: "chess", name: "Шатар", time: "16:00" },
];

export default function Home() {
  return <main><h1>Клубүүд</h1><ul>
    {clubs.map(club => <ClubCard key={club.id} name={club.name} time={club.time} />)}
  </ul></main>;
}`,
              ),
            ],
          },
          practice: [
            "JSX доторх {} ба компонент дуудах мөрийг тэмдэглэ.",
            "Массивд гурав дахь клуб нэм. Шинэ карт автоматаар гарсныг шалга.",
            "Картын props-д room нэм. Бичлэг бүрт өөр өрөө харуул.",
            "Массивын дарааллыг соль. Картуудын мэдээлэл id-тайгаа таарч байгааг шалга.",
          ],
          deliverable: "Дахин ашиглагдах компонент ба дор хаяж гурван карт.",
          criteria: [
            "Карт нэг удаа тодорхойлогдсон.",
            "map ба тогтвортой key ашигласан.",
            "Өөр өгөгдөлтэй картууд зөв харагдана.",
          ],
          check: {
            question:
              "Шинэ клуб нэмэхэд JSX-д тусдаа ClubCard бичих шаардлагатай юу?",
            answer: "Массивд нэг бичлэг нэмэхэд map шинэ ClubCard үүсгэнэ.",
          },
        },
        {
          id: "styles-and-state",
          sourceRow: 12,
          periods: 3,
          coverage: "extended",
          title: "CSS Modules, public файл ба төлөв",
          existing: {
            summary:
              "Товчийн inline загвар, click болон useState тоолуур бэлэн. Энэ хичээл нийтлэг CSS, CSS Module, статик зурагтай бодит хуудсыг нэмнэ.",
            links: [foundations],
          },
          objective:
            "Компонентод хамаарах CSS, нийтлэг загвар, статик зургийг ялган хэрэглэж, товчоор төлөв өөрчилнө.",
          materials: localProject,
          example: {
            explanation:
              "globals.css-д суурь загвар, .module.css-д тухайн компонентын загвар орно. public доторх club.svg нь /club.svg хаягтай. useState ашигладаг файл ‘use client’ заалттай.",
            files: [
              file(
                "app/Counter.tsx",
                `"use client";
import { useState } from "react";
import styles from "./Counter.module.css";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button className={styles.button} onClick={() => setCount(n => n + 1)}>
    Санал {count}
  </button>;
}`,
              ),
              file(
                "app/Counter.module.css",
                ".button { padding: 12px 16px; background: #234baa; color: white; border-radius: 8px; }",
              ),
              file(
                "public/club.svg",
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#234baa"/><circle cx="32" cy="32" r="16" fill="white"/></svg>',
              ),
              file(
                "app/page.tsx",
                `import Image from "next/image";
import Counter from "./Counter";

export default function Home() {
  return <main><h1>Робот клуб</h1>
    <Image src="/club.svg" alt="Робот клубийн тэмдэг" width={64} height={64} />
    <Counter />
  </main>;
}`,
              ),
            ],
          },
          practice: [
            "Файлуудаа байрлуулаад зураг, товчийг нээ. Товчийг хоёр удаа дар.",
            "globals.css-д body-ийн дэвсгэр, Counter.module.css-д товчийн загвар өөрчил. Аль элемент өөрчлөгдсөнийг тэмдэглэ.",
            "Reset товч нэм. 0 → 2 → 0 → 1 дарааллаар турш.",
          ],
          deliverable:
            "Статик зураг, тусдаа CSS Module, ажиллагаатай тоолуур бүхий хуудас.",
          criteria: [
            "Статик файлын зам ба alt зөв.",
            "Товчийн загвар модульд тусгаарлагдсан.",
            "Нэмэх, reset, дахин нэмэх ажиллана.",
          ],
          check: {
            question: "setCount(n => n + 1) дотор n ямар утга вэ?",
            answer:
              "React-аас өгсөн өмнөх төлөвийн утга. Шинэ төлөвт түүн дээр 1 нэмнэ.",
          },
        },
        {
          id: "mini-site",
          sourceRow: 13,
          periods: 3,
          coverage: "new",
          title: "Жижиг төсөл · Гурван хуудаст сайт",
          objective:
            "Сонгосон сэдвээр гурван хуудас, дундын цэс, дахин ашиглах компоненттой сайт бүтээнэ.",
          materials: localProject,
          example: {
            explanation:
              "Клубийн сайт нүүрэнд товч танилцуулга, тухай хуудсанд хуваарь, холбоо хуудсанд зохиомол лавлах мэдээлэлтэй. Цэс layout-д байвал бүх хуудаст харагдана.",
            files: [
              snippet(
                "Хуудасны зураглал",
                "/ → Нүүр\n/about → Клубийн тухай\n/contact → Холбоо барих\napp/layout.tsx → Дундын цэс",
              ),
            ],
          },
          practice: [
            "Клуб, хобби эсвэл сургуулийн арга хэмжээнээс сэдэв сонго. Хуудас бүрийн нэг гол зорилгыг бич.",
            "Өмнөх Link, Card, CSS Module жишээг ашиглаж гурван хуудас бүтээ. Дундын цэсээр холбо.",
            "Гар утасны өргөн, шууд зам, Tab ба Enter-ээр турш. Хоёр минутын демогоор гурван хуудас үзүүл.",
          ],
          deliverable: "Гурван хуудаст төсөл, замын зураглал, демо.",
          criteria: [
            "Зам бүр тодорхой агуулгатай.",
            "Компонент дахин ашигласан.",
            "Цэс жижиг дэлгэц ба гараар ажилладаг.",
          ],
          check: {
            question:
              "Дундын цэсийг аль файлд байрлуулбал гурван хуудас ашиглах вэ?",
            answer:
              "app/layout.tsx дотор байрлуулбал тухайн layout-ийн хүүхэд бүх замд харагдана.",
          },
        },
      ],
    },
    {
      title: "2. Судалгаа, шийдэл, дүгнэлтийн төсөл",
      lessons: [
        {
          id: "research-plan",
          sourceRow: 14,
          periods: 3,
          coverage: "new",
          title: "Судалгааны төслийн сэдэв ба бүтцээ сонгох",
          objective:
            "Шалгаж болох асуулт тавьж, судалгаа, шийдэл, дүгнэлтийг дөрвөн замд төлөвлөнө.",
          materials: "Өмнөх мини сайт, төсөл төлөвлөх нэг хуудас.",
          example: {
            explanation:
              "‘Номын сангийн ачаалал’ сэдвийг ‘Үдийн завсарлагаар ном зээлэхэд хүлээлт хэзээ их байдаг вэ?’ гэж нарийсга. Нэр цуглуулахгүйгээр гурван үеийн хүлээлтийг тоолж болно.",
            files: [
              snippet(
                "Замын төлөвлөгөө",
                "/ → Асуудал ба асуулт\n/research → Ажиглалт, эх сурвалж\n/solutions → Хоёр боломжит шийдэл\n/conclusion → Сонгосон арга, хэмжих үзүүлэлт",
              ),
            ],
          },
          practice: [
            "Гурван сэдвээс нэгийг сонго. Зорилтот хэрэглэгч ба хэмжиж болох асуулт бич.",
            "Хоёр эх сурвалж эсвэл зөвшөөрөгдсөн нэргүй ажиглалт сонго. Ямар баримт дүгнэлтэд хэрэгтэйг бич.",
            "Дөрвөн route-д эхний гарчиг, нэг өгүүлбэр оруулж цэсээр холбо.",
          ],
          deliverable:
            "Судалгааны асуулт, баримт цуглуулах төлөвлөгөө, дөрвөн замтай эхний хувилбар.",
          criteria: [
            "Асуулт тодорхой, хэмжиж болохуйц.",
            "Зам бүрийн үүрэг ялгаатай.",
            "Дөрвөн замыг цэсээр нээдэг.",
          ],
          check: {
            question:
              "‘Номын санг сайжруулна’ гэдгийг хэмжих асуулт болгон яаж бичих вэ?",
            answer:
              "Жишээ нь ‘Үдийн завсарлагаар ном зээлэх хүлээлтийн дундаж хэдэн минут вэ?’ гэж тодорхойлно.",
          },
        },
        {
          id: "research-content",
          sourceRow: 15,
          periods: 3,
          coverage: "new",
          title: "Эх сурвалжтай судалгааны хуудас",
          objective:
            "Хоёр баримтыг эх сурвалжтай холбож, эх сурвалжийн жагсаалтыг map-аар харуулна.",
          materials:
            "Судалгааны төсөл, хоёр баталгаажуулсан эх сурвалж эсвэл багшийн өгөгдөл.",
          example: {
            explanation:
              "Ажиглалтын мөрд огноо, хэмжсэн зүйл, хэмжээ, хамрах хүрээ орно. Доорх нь бичлэгийн хэлбэрийг харуулсан сургалтын өгөгдөл.",
            files: [
              file(
                "app/research/page.tsx",
                `const evidence = [
  { id: "a", period: "Даваа · үдийн завсарлага", minutes: 5 },
  { id: "b", period: "Мягмар · үдийн завсарлага", minutes: 3 },
];
export default function Research() {
  return <main><h1>Хүлээлтийн ажиглалт</h1>
    <p>Сургалтын жишээ өгөгдөл</p>
    <ul>{evidence.map(row =>
      <li key={row.id}>{row.period} · {row.minutes} минут</li>
    )}</ul>
  </main>;
}`,
              ),
            ],
          },
          practice: [
            "Эх сурвалж тус бүрийн эзэмшигч, огноо, ямар баримтыг батлахыг тэмдэглэ.",
            "Судалгааны хуудсанд нэг тайлбар, нэг хүснэгт эсвэл тайлбартай зураг нэм.",
            "Эх сурвалжийн массивд title, href, date талбар өгч map-аар холбоос үүсгэ. Холбоос бүрийг нээж шалга.",
          ],
          deliverable:
            "Хоёр баримт ба тэдгээрийг шалгах холбоос бүхий /research хуудас.",
          criteria: [
            "Баримт бүр эх сурвалжтай.",
            "Зураг эсвэл хүснэгтийн утга тайлбартай.",
            "Жагсаалтыг өгөгдлөөс үүсгэдэг.",
          ],
          check: {
            question:
              "Эх сурвалжийн хаяг дангаараа баримтыг шалгахад хангалттай юу?",
            answer:
              "Ямар мэдэгдлийг баталж байгааг нэрлэж, огноо эсвэл хэсгийг заавал уншигч хурдан тулгаж чадна.",
          },
        },
        {
          id: "solution-cards",
          sourceRow: 16,
          periods: 3,
          coverage: "new",
          title: "Хоёр шийдлийг картаар харьцуулах",
          objective:
            "Судалгаанаас хоёр бодит шийдэл гаргаж, өртөг, хэрэгжүүлэх хугацаа, үр дүнгээр харьцуулна.",
          materials: "Судалгааны хуудас, өмнөх Card ба CSS Modules жишээ.",
          example: {
            explanation:
              "Хүлээлт их үед ‘Зээлийн хоёр дахь цэг’ ба ‘Урьдчилан захиалах’ гэсэн хоёр шийдэл байж болно. Карт бүр ижил хэмжүүртэй бол хэрэглэгч шууд харьцуулна.",
            files: [
              snippet(
                "SolutionCard.tsx",
                `type Solution = { title: string; effort: string; evidence: string };
export default function SolutionCard({ title, effort, evidence }: Solution) {
  return <article><h2>{title}</h2><p>{effort}</p><p>{evidence}</p></article>;
}`,
              ),
            ],
          },
          practice: [
            "Судалгааны нэг баримттай холбогдох хоёр эсвэл гурван шийдэл бич. Хэрэгжүүлэх хугацаа, шаардлагатай нөөцийг жиш.",
            "Шийдлийн массив үүсгэж SolutionCard-д props дамжуул. CSS Module-аар картын зай, хүрээг загварчил.",
            "360 ба 1024 пикселд уншигдах байдлыг шалга. Аль шийдлийг яагаад сонгосноо дүгнэлтийн эхний мөрд бич.",
          ],
          deliverable: "Баримтад тулгуурласан хоёр шийдлийн responsive хуудас.",
          criteria: [
            "Шийдэл бүр ижил хэмжүүрээр тайлбарлагдсан.",
            "Нэг компонентыг props-оор дахин ашигласан.",
            "Жижиг дэлгэцэд агуулга бүрэн.",
          ],
          check: {
            question:
              "Нэг картыг хувилахын оронд props-д ямар өгөгдөл дамжуулах вэ?",
            answer:
              "Шийдэл бүрийн гарчиг, хэрэгжүүлэх нөөц эсвэл хугацаа, тулгуур баримтыг дамжуулна.",
          },
        },
        {
          id: "conclusion-feedback",
          sourceRow: 17,
          periods: 3,
          coverage: "extended",
          title: "Дүгнэлт, саналын товч ба дундын цэс",
          existing: {
            summary:
              "Remember with state модульд useState тоолуур бий. Энэ хичээлээр саналын үйлдлийг судалгааны дүгнэлт ба бүх хуудасны layout-тай холбоно.",
            links: [foundations],
          },
          objective:
            "Баримт, санал болгох шийдэл, хэмжих үр дүнтэй дүгнэлт бичиж, төлөвтэй саналын товч нэмнэ.",
          materials:
            "Дөрвөн замтай судалгааны төсөл, CSS Module, useState жишээ.",
          example: {
            explanation:
              "Дүгнэлтдээ ямар баримтаар ямар шийдэл сонгосноо бич. Саналын товч нэг хэрэглэгчийн тухайн харагдац дахь сонголтыг солих жишээ.",
            files: [
              file(
                "app/conclusion/Vote.tsx",
                `"use client";
import { useState } from "react";

export default function Vote() {
  const [selected, setSelected] = useState(false);
  return <button type="button" aria-pressed={selected} onClick={() => setSelected(value => !value)}>
    {selected ? "Санал өгсөн" : "Дэмжиж байна"}
  </button>;
}`,
              ),
            ],
          },
          practice: [
            "Дүгнэлтэд баримт, сонгосон шийдэл, хэмжих үр дүн гэсэн гурван хэсэг оруул.",
            "Vote-ийг conclusion/page.tsx-д импортол. Хоёр удаа дарж төлөв солигдохыг шалга.",
            "Header, Footer-ийг root layout-д байрлуул. Дөрвөн хуудаст цэс ба footer харагдаж, холбоос ажиллахыг батал.",
          ],
          deliverable:
            "Дүгнэлтийн хуудас, ажилладаг саналын товч, дундын навигаци.",
          criteria: [
            "Дүгнэлт баримтаа дурдсан.",
            "Товч хоёр төлөвт шилжинэ.",
            "Бүх хуудас нэг цэс ашиглана.",
          ],
          check: {
            question: "Хуудсыг дахин ачаалахад энэ жишээний санал яах вэ?",
            answer:
              "useState(false) дахин эхэлнэ. Одоогийн жишээний төлөв тухайн харагдацад хадгалагдана.",
          },
        },
        {
          id: "individual-project-demo",
          sourceRow: 18,
          periods: 4,
          coverage: "new",
          title: "Бие даасан судалгааны төслийг хамгаалах",
          objective:
            "Бүрэн сайтыг угсарч, бодит тестээр шалгаад асуудлаас шийдэл хүртэл танилцуулна.",
          materials: "Судалгааны төсөл, браузер, тестийн хүснэгт.",
          example: {
            explanation:
              "Демо нь нүүрний асуултаас эхэлж, судалгааны нэг баримт, хоёр шийдлийн харьцуулалт, саналын товчийг дарааллаар үзүүлнэ.",
          },
          practice: [
            "Дөрвөн хуудасны гарчиг, эх сурвалж, цэсийг бүрэн болго.",
            "Шууд URL, буцах, 360 пиксел, Tab, саналын товч, алга замыг шалга. npm run build ажиллуул.",
            "Нэг алдааг засаж, дахин шалгасан үр дүнгээ бич. Демо хийх гурван минутын төлөвлөгөө гарга.",
            "Сурагч бүр асуудал, баримт, шийдэл, дүгнэлт, демогоо танилцуулж нэг асуултад хариул.",
          ],
          deliverable:
            "Бүрэн Next.js сайт, тестийн баримт, бие даасан танилцуулга.",
          criteria: [
            "Дөрвөн зам, цэс, интерактив ажиллана.",
            "Тест ба засварын баримттай.",
            "Шийдэл судалгааны үр дүнтэй холбогдсон.",
          ],
          check: {
            question:
              "Build амжилттай болсны дараа браузерт ямар зүйл шалгах вэ?",
            answer:
              "Бодит хаяг, холбоос, гарын удирдлага, дэлгэцийн өргөн болон интерактивийн үр дүнг туршина.",
          },
        },
      ],
    },
    {
      title: "3. AI-тай Next.js хөгжүүлэлт",
      lessons: [
        {
          id: "ai-workflow",
          sourceRow: 19,
          periods: 3,
          coverage: "new",
          title: "AI-аас кодын санал авч шалгах",
          objective:
            "Тодорхой шаардлагатай prompt бичиж, санал болгосон кодыг уншиж, туршиж засна.",
          materials:
            "App Router төсөл, багшийн зөвшөөрсөн AI хэрэгсэл эсвэл доорх сургалтын жишээ.",
          example: {
            explanation:
              "AI-д файлын зам, TypeScript props, хүлээх үр дүн, хоёр тестээ бич. Жишээний функц name авсан боловч тогтмол гарчиг буцааж байна. Өөр хоёр нэрээр дуудахад алдаа харагдана.",
            files: [
              snippet(
                "Шалгах код · ClubTitle.tsx",
                `export default function ClubTitle({ name }: { name: string }) {
  return <h2>Робот</h2>;
}`,
              ),
            ],
          },
          practice: [
            "ClubTitle name prop-ийг харуулах, хоёр өөр нэрээр шалгах, гаднын сан нэмэхгүй байх шаардлагатай prompt бич. Зохиомол өгөгдөл хэрэглэ.",
            "Гарсан саналыг мөрөөр тайлбарла. Жишээнд тогтмол ‘Робот’-ыг JSX доторх {name}-аар соль.",
            "Хоёр өөр нэрээр браузерт турш. Анхны санал, олсон зөрүү, эцсийн өөрчлөлт, тестээ тэмдэглэ.",
          ],
          deliverable:
            "Prompt, зассан компонент, хоёр тестийн үр дүн, AI ашигласан тэмдэглэл.",
          criteria: [
            "Prompt шалгаж болох шаардлагатай.",
            "Кодын өөрчлөлтийг сурагч өөрөө тайлбарлана.",
            "Өөр props-той хоёр тест ажиллана.",
          ],
          check: {
            question:
              "‘Шатар’ дамжуулсан ч ‘Робот’ харагдвал аль мөрийг шалгах вэ?",
            answer:
              "JSX доторх гарчгийг шалгана. Тогтмол текстийн оронд {name} хэрэглэнэ.",
          },
        },
        {
          id: "dynamic-routes",
          sourceRow: 20,
          periods: 3,
          coverage: "new",
          title: "Layout, metadata ба динамик [id] зам",
          objective:
            "Нэг динамик загвараар жагсаалтын хоёр бичлэгт тусдаа дэлгэрэнгүй хуудас, гарчиг үүсгэнэ.",
          materials: localProject,
          example: {
            explanation:
              "app/clubs/[id]/page.tsx нь /clubs/robot зэрэг замыг авна. Одоогийн App Router-д params-ийг await хийж id уншина. Танихгүй id-д notFound дуудна.",
            files: [
              file(
                "app/clubs/data.ts",
                `export const clubs = [
  { id: "robot", name: "Робот", description: "Загвар угсарна" },
  { id: "chess", name: "Шатар", description: "Бодлого бодно" },
];`,
              ),
              file(
                "app/clubs/layout.tsx",
                `import type { ReactNode } from "react";
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
  return <section><nav><Link href="/clubs">Бүх клуб</Link></nav>{children}</section>;
}`,
              ),
              file(
                "app/clubs/page.tsx",
                `import Link from "next/link";
import { clubs } from "./data";

export default function Clubs() {
  return <main><h1>Клубүүд</h1><ul>{clubs.map(club =>
    <li key={club.id}><Link href={"/clubs/" + club.id}>{club.name}</Link></li>
  )}</ul></main>;
}`,
              ),
              file(
                "app/clubs/[id]/page.tsx",
                `import { notFound } from "next/navigation";
import { clubs } from "../data";

type Props = { params: Promise<{ id: string }> };

async function getClub(params: Props["params"]) {
  const { id } = await params;
  const club = clubs.find(entry => entry.id === id);
  if (!club) notFound();
  return club;
}
export async function generateMetadata({ params }: Props) {
  const club = await getClub(params);
  return { title: club.name };
}
export default async function ClubPage({ params }: Props) {
  const club = await getClub(params);
  return <main><h1>{club.name}</h1><p>{club.description}</p></main>;
}`,
              ),
            ],
          },
          practice: [
            "Файлыг заасан замд байрлуулаад /clubs-ээс хоёр өөр бичлэг нээ. Tab-ийн гарчгийг тус бүр шалга.",
            "Өгөгдөлд гурав дахь id нэм. Шинэ хавтас үүсгэлгүйгээр шинэ зам ажиллаж байгааг батал.",
            "Танихгүй id-г шууд нээ. AI эсвэл найзынхаа санал болгосон өөр хувилбарыг await params, metadata, 404 гэсэн гурван шалгуураар хяна.",
          ],
          deliverable:
            "Дундын layout-тай жагсаалт, гурван дэлгэрэнгүй зам, 404 тест.",
          criteria: [
            "Өөр id өөр өгөгдөл ба гарчигтай.",
            "Дундын цэс хэвээр харагдана.",
            "Танихгүй id 404 дэлгэц үзүүлнэ.",
          ],
          check: {
            question: "Яагаад id авахдаа await params хэрэглэсэн бэ?",
            answer:
              "Энэ App Router-ийн params нь Promise хэлбэртэй. Шийдэгдсэн утгаас id-г уншина.",
          },
        },
        {
          id: "fetch-json",
          sourceRow: 21,
          periods: 3,
          coverage: "new",
          title: "JSON өгөгдөл татаж жагсаалтаар харах",
          objective:
            "fetch, response.ok, JSON, map ашиглан ачаалж буй, амжилттай, хоосон, алдаатай төлөв харуулна.",
          materials: localProject,
          example: {
            explanation:
              "public/clubs.json нь туршилтын эх үүсвэр. Браузер fetch-ээр JSON авна. 404 хариунд response.ok худал. Өгөгдлийн бүтэц таарсан үед л жагсаалт зурна.",
            files: [
              file(
                "public/clubs.json",
                '[{"id":"robot","name":"Робот"},{"id":"chess","name":"Шатар"}]',
              ),
              file(
                "app/live-clubs/page.tsx",
                `"use client";
import { useEffect, useState } from "react";

type Club = { id: string; name: string };
type View = { kind: "loading" | "error" } | { kind: "ready"; clubs: Club[] };

function isClub(value: unknown): value is Club {
  return typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "string" &&
    "name" in value && typeof value.name === "string";
}

export default function LiveClubs() {
  const [view, setView] = useState<View>({ kind: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/clubs.json", { signal: controller.signal });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(isClub)) throw new Error("JSON format");
        if (!controller.signal.aborted) setView({ kind: "ready", clubs: data });
      } catch {
        if (!controller.signal.aborted) setView({ kind: "error" });
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  return <main><h1>Клубийн жагсаалт</h1>
    {view.kind === "loading" && <p role="status">Уншиж байна…</p>}
    {view.kind === "error" && <p role="alert">Жагсаалт уншсангүй. Дахин ачаална уу.</p>}
    {view.kind === "ready" && (view.clubs.length === 0 ? <p>Клуб алга.</p> :
      <ul>{view.clubs.map(club => <li key={club.id}>{club.name}</li>)}</ul>)}
  </main>;
}`,
              ),
            ],
          },
          practice: [
            "Хоёр клуб, дараа нь [] өгөгдлөөр /live-clubs нээ. Гаралтыг тэмдэглэ.",
            "Сүлжээг удаашруулж ачаалж буй мессежийг хар. JSON файлын нэрийг түр сольж 404 төлөвийг турш.",
            "JSON-д name талбаргүй бичлэг нэм. Алдаа гарсныг шалгаад зөв бүтцийг сэргээ. Багш өгсөн нийтийн API байвал түүний талбаруудыг Club хэлбэрт хөрвүүлэх төлөвлөгөө бич.",
          ],
          deliverable:
            "JSON жагсаалтын хуудас ба ачаалалт, хоосон, алдааны тест.",
          criteria: [
            "Хариуны код ба өгөгдлийн хэлбэр шалгадаг.",
            "map зөв жагсаалт үүсгэнэ.",
            "Дөрвөн төлөв ялгаатай харагдана.",
          ],
          check: {
            question: "fetch 404 хариу авбал аль мөрөөр илрүүлэх вэ?",
            answer:
              "response.ok худал болох тул if (!response.ok) ажиллана. JSON гэж задлахаас өмнө алдааг мэдэгдэнэ.",
          },
        },
        {
          id: "forms-and-crud",
          sourceRow: 22,
          periods: 3,
          coverage: "new",
          title: "Controlled form, useEffect ба жагсаалтын үйлдэл",
          objective:
            "Төлөвөөр удирддаг формоор бичлэг нэмэх, харуулах, устгах ба засах үйлдэл хийнэ.",
          materials: localProject,
          example: {
            explanation:
              "input-ийн value нь text төлөвтэй холбоотой. onChange төлөв шинэчилнэ. Нэмэх, устгахдаа шинэ массив үүсгэнэ. useEffect нь мөрийн тоог браузерийн tab-ийн гарчигтай уялдуулна.",
            files: [
              file(
                "app/tasks/page.tsx",
                `"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";

export default function Tasks() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<{ id: number; label: string }[]>([]);
  const nextId = useRef(1);
  useEffect(() => {
    const previous = document.title;
    document.title = "Ажил · " + items.length;
    return () => { document.title = previous; };
  }, [items.length]);

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = text.trim();
    if (!label) return;
    const id = nextId.current++;
    setItems(current => [...current, { id, label }]);
    setText("");
  }
  return <main><h1>Хийх ажил</h1>
    <form onSubmit={add}>
      <label>Ажил <input value={text} onChange={event => setText(event.target.value)} /></label>
      <button>Нэмэх</button>
    </form>
    <ul>{items.map(item => <li key={item.id}>{item.label}
      <button type="button" onClick={() => setItems(current => current.filter(row => row.id !== item.id))}>
        Устгах
      </button>
    </li>)}</ul>
  </main>;
}`,
              ),
            ],
          },
          practice: [
            "Хоёр ажил нэм. Хоосон текст буцаагдаж, нэг id устахад нөгөө мөр үлдэхийг шалга.",
            "editingId төлөв нэм. ‘Засах’ дарахад text-д хуучин утгыг ачаалж, submit дээр map-аар тэр мөрийн label-ийг соль.",
            "Өөрчлөхөд тоо хэвээр, устгахад буурч байгааг tab-ийн гарчгаас хар. AI санал авбал зөвхөн шаардлагатай хэсгийг авч тестээ давт.",
          ],
          deliverable: "Нэмэх, унших, засах, устгах үйлдэлтэй жагсаалт.",
          criteria: [
            "Оролт төлөвөөс утгаа авдаг.",
            "Ижил нэртэй мөрүүд id-аар ялгаатай.",
            "Засах ба устгах зөв мөрд үйлчилнэ.",
          ],
          check: {
            question: "setItems-д filter-ийн үр дүн өгөхөд юу өөрчлөгдөх вэ?",
            answer:
              "Тухайн id-гүй шинэ массив төлөвт орж, React жагсаалтыг дахин зурна.",
          },
        },
        {
          id: "ai-mini-app",
          sourceRow: 23,
          periods: 4,
          coverage: "new",
          title: "AI-тай жижиг апп · Өгөгдөл ба хувийн жагсаалт",
          objective:
            "Татсан өгөгдөл, форм, хадгалах сонголттой жижиг апп бүтээж, AI-ийн саналд кодын үнэлгээ хийнэ.",
          materials: "JSON татах ба жагсаалтын хоёр жишээ, App Router төсөл.",
          example: {
            explanation:
              "Клуб сонгогч апп JSON-оос клубүүд уншиж, хэрэглэгч сонголтыг өөрийн жагсаалтад нэмнэ. Нэг id-г давхар нэмэхэд анхааруулна. Сонгосон мөрийг устгаж болно.",
            files: [
              snippet(
                "Кодын үнэлгээний тэмдэглэл",
                "Санал · ID-аар шүүх\nТест · Нэг клубийг хоёр удаа нэмэх\nИлэрсэн зөрүү · Давхар мөр орсон\nЗасвар · Нэмэхийн өмнө some-аар id шалгасан",
              ),
            ],
          },
          practice: [
            "Өгөгдлийн эх, хоёр хэрэглэгчийн үйлдэл, дөрвөн тестээ бич. AI-д нэг жижиг компонентын шаардлагыг өг.",
            "Татах жишээг ашиглан өгөгдлөө харуул. Сонгосон id-г формоор авч жагсаалтад нэм.",
            "Давхардал, хоосон жагсаалт, API алдаа, устгалын тестээ гүйцэтгэ. Давтагдсан кодыг нэг ойлгомжтой функцэд гарга.",
            "Анхны санал, зассан хэсэг, тестийг хоёр минутын демогоор тайлбарла.",
          ],
          deliverable:
            "Өгөгдөл татдаг жижиг апп, AI ашигласан тэмдэглэл, тестийн үр дүн.",
          criteria: [
            "Өгөгдөл татах ба форм ажиллана.",
            "Алдааны үед ойлгомжтой төлөв харагдана.",
            "AI-аас авсан өөрчлөлтийг сурагч тайлбарлана.",
          ],
          check: {
            question:
              "AI-аас санал болгосон засварыг зөв гэдгийг ямар баримтаар харуулах вэ?",
            answer:
              "Засвараас өмнө унасан нэг тест, засварын дараа гарсан хүлээгдсэн үр дүнг үзүүлнэ.",
          },
        },
      ],
    },
    {
      title: "4. Багаар бодит асуудал шийдэх төсөл",
      lessons: [
        {
          id: "team-scope",
          sourceRow: 24,
          periods: 3,
          coverage: "new",
          title: "Баг байгуулах ба хэрэглэгчийн асуудал",
          objective:
            "2–3 хүний баг хэрэглэгчийн хэрэгцээг судалж, хэмжигдэхүйц хамрах хүрээ тогтооно.",
          materials:
            "Төслийн саналын нэг хуудас, багшийн зөвшөөрсөн нэргүй ажиглалт.",
          example: {
            explanation:
              "Арга хэмжээний мэдээлэл өөр өөр газар байвал сурагч хэрэгтэй өдрөө олоход удна. Нэг шийдэл нь огноогоор шүүж, дэлгэрэнгүй үздэг календарийн жагсаалт.",
          },
          practice: [
            "Үүргээ хуваа. Хэрэглэгчийн одоогийн ажлыг ажиглаад нэг асуудлыг нэг өгүүлбэрээр бич.",
            "Хэрэглэгчийн гурван хэрэгцээг ‘огноогоор шүүхэд зөв мөр л үлдэнэ’ гэх мэт шалгаж болох шаардлага болго.",
            "Эхний хувилбарт багтах гурван үйлдэл, дараагийн хувилбарт шилжүүлэх ажлыг тусад нь бич. Багшаар хүрээг нягтлуул.",
          ],
          deliverable:
            "Асуудал, хэрэглэгч, багийн үүрэг, гурван шалгууртай төслийн санал.",
          criteria: [
            "Хэрэгцээ ажиглалтад тулгуурласан.",
            "Үүрэг бүр тодорхой үр дүнтэй.",
            "Хамрах хүрээ хэрэгжихүйц.",
          ],
          check: {
            question:
              "‘Хэрэглэхэд хялбар’ шаардлагыг яаж шалгаж болохуйц болгох вэ?",
            answer:
              "Жишээ нь ‘Хэрэглэгч огноог сонгоод тухайн өдрийн арга хэмжээг нэг дэлгэцээс харна’ гэж үйлдэл, үр дүнг нэрлэнэ.",
          },
        },
        {
          id: "team-design-git",
          sourceRow: 25,
          periods: 3,
          coverage: "new",
          title: "Wireframe, ажлын хуваарь ба Git",
          objective:
            "Хуудас, өгөгдөл, компонентын зааг гаргаж, багийн ажил тусдаа Git салбар дээр төлөвлөнө.",
          materials:
            "Багийн App Router төсөл, Git, цаас эсвэл загварын хэрэгсэл.",
          example: {
            explanation:
              "Нэг гишүүн /events жагсаалт, нөгөө нь /events/[id] дэлгэрэнгүй дээр ажиллана. Хоёулаа id, title, date гэсэн өгөгдлийн хэлбэрээ урьдчилан тохирно.",
            files: [
              snippet(
                "Git · Дасгалын салбар",
                'git status\ngit switch -c events-list\ngit add app/events/page.tsx\ngit commit -m "Add events list"',
              ),
            ],
          },
          practice: [
            "Гар утас ба компьютерийн хоёр ноорог зур. Хуудасны зам, өгөгдлийн талбараа тохир.",
            "Ажил бүрд эзэн, файл, дуусах шалгуур оноо. Багшийн тохируулсан Git төслийн үндсэн салбараас тусдаа салбар үүсгэ.",
            "Өөрчлөлтөө git status-аар шалгаж зөвхөн өөрийн файлаа commit хий. AI-аас санал авах бол зохиомол өгөгдөл ба зөвшөөрсөн код ашигла.",
          ],
          deliverable:
            "Хоёр wireframe, ажлын хуваарь, багийн Git төсөл ба гишүүний эхний commit.",
          criteria: [
            "Файл ба үүрэг давхцахааргүй хуваарилсан.",
            "Өгөгдлийн хэлбэр тохирсон.",
            "Тодорхой нэртэй commit хийсэн.",
          ],
          check: {
            question:
              "Хоёр гишүүн ижил файлыг засах хэрэг гарвал эхлээд юу тохирох вэ?",
            answer:
              "Аль хэсгийг хэн, ямар дарааллаар засаж нэгтгэхийг тохирно. Нэгдсэн өгөгдлийн хэлбэрээ хадгална.",
          },
        },
        {
          id: "team-build",
          sourceRow: 26,
          periods: 3,
          coverage: "new",
          title: "Багийн хөгжүүлэлт · Эхний ажиллагаатай хувилбар",
          objective:
            "Тусдаа хуудсыг тохирсон өгөгдлөөр бүтээж, эхний хэрэглэгчийн урсгалыг нэгтгэнэ.",
          materials: "Багийн Git төсөл, тохирсон өгөгдлийн жишээ ба wireframe.",
          example: {
            explanation:
              "Жагсаалт /events/e1 рүү Link үүсгэнэ. Дэлгэрэнгүй хуудас ижил e1 id-тай өгөгдлийг олно. Бичлэг байхгүй үед алга төлөв үзүүлнэ.",
          },
          practice: [
            "Богино уулзалтаар өчигдрийн ажил, өнөөдрийн зорилго, саадыг гишүүн бүр хэл.",
            "Өөрийн салбарт нэг хуудас эсвэл нэг компонент гүйцээ. Жишээ өгөгдөл, хоосон төлөвөөр ажиллуул.",
            "Хоёр гишүүн өөрчлөлтийг харилцан уншаад нэгтгэ. Жагсаалт → дэлгэрэнгүй → буцах урсгалыг эхнээс нь турш.",
          ],
          deliverable:
            "Холбогдсон гол хуудсууд, нэгтгэсэн commit, туршилтын тэмдэглэл.",
          criteria: [
            "Гишүүн бүрийн өөрчлөлт ялгагдана.",
            "Нэг гол урсгал төгсгөл хүртэл ажиллана.",
            "Нэгтгэх үеийн асуудлыг тэмдэглэсэн.",
          ],
          check: {
            question:
              "Холбоос e1 явуулсан ч дэлгэрэнгүй нь event-1 хайвал юу засах вэ?",
            answer:
              "Багийн тохирсон нэг id-г өгөгдөл, Link, дэлгэрэнгүй хуудасны хайлтад ижил хэрэглэнэ.",
          },
        },
        {
          id: "team-integration",
          sourceRow: 27,
          periods: 3,
          coverage: "new",
          title: "Багийн хөгжүүлэлт · Нэгтгэл, тест, засвар",
          objective:
            "Төслийн бүх үйлдлийг нэгтгэж, хэвийн, хоосон, буруу оролт ба утасны дэлгэцээр шалгана.",
          materials: "Нэгтгэсэн Git төсөл, тестийн хүснэгт, браузер.",
          example: {
            explanation:
              "Нэгтгэлийн тест огноогоор шүүхээс эхэлж тохирох арга хэмжээг нээгээд буцна. Алдааны тайланд алхам, хүлээсэн үр дүн, бодит үр дүн, засварын commit орно.",
          },
          practice: [
            "Дутуу үйлдэл, өгөгдөл, холбоосыг нэгтгэ. npm run build ажиллуул.",
            "Дөрвөн хэрэглэгчийн урсгал, 360 пиксел, 404 зам, алдаатай оролтыг шалга. Нэг давтагдах алдааг тэмдэглэ.",
            "Алдааг засаж анхны тест болон зэргэлдээ үйлдлүүдийг давт. Сургууль зөвшөөрсөн бол танилцуулах орчноо багштай тохир.",
          ],
          deliverable:
            "Бүтдэг, ажилладаг багийн сайт, тестийн хүснэгт, нэг алдааны засвар.",
          criteria: [
            "Гол урсгал бүр шалгагдсан.",
            "Алдаа дахин гаргах алхам тодорхой.",
            "Засварын дараа өмнөх үйлдлүүд ажилласан.",
          ],
          check: {
            question:
              "Нэг алдааг зассаны дараа яагаад ойролцоох үйлдлүүдийг дахин шалгах вэ?",
            answer:
              "Нэгтгэсэн өөрчлөлт өөр хуудас эсвэл хэрэглэгчийн урсгалд нөлөөлсөн эсэхийг мэднэ.",
          },
        },
        {
          id: "team-defense",
          sourceRow: 28,
          periods: 4,
          coverage: "new",
          title: "Багийн төсөл · Танилцуулга ба хувь нэмрийн үнэлгээ",
          objective:
            "Асуудал, шийдэл, ажилладаг демо, нотолгоо болон гишүүн бүрийн хувь нэмрийг танилцуулна.",
          materials:
            "Бэлэн сайт, зохиомол демо өгөгдөл, Git-ийн өөрчлөлт, багийн тестийн тайлан.",
          example: {
            explanation:
              "Арга хэмжээ хайдаг аппын демо нь хэрэгцээ, огноо сонгох, үр дүн нээх, алга өдөр харах гэсэн дарааллаар явна. Гишүүн бүр хийсэн нэг өөрчлөлт, нэг шийдвэрээ тайлбарлана.",
          },
          practice: [
            "Асуудал → шийдэл → демо → тестийн үр дүн гэсэн дөрвөн хэсэгтэй танилцуулга бич.",
            "Нэг гишүүнээр туршилтын хэрэглэгч болгож демогоо давт. Холбоос, жишээ өгөгдөл, хугацаагаа шалга.",
            "Багийн демо хий. Гишүүн бүр өөрийн хэсгийн код эсвэл загварын нэг шийдвэрийг үзүүл.",
            "Багийн ба хувийн үнэлгээг тусад нь бич. Нэг амжилттай ажилласан шаардлага, сайжруулах нэг алхмаа нэрлэ.",
          ],
          deliverable:
            "Ажилладаг веб, демо, тестийн баримт, багийн болон хувийн эргэцүүлэл.",
          criteria: [
            "Демо хэрэглэгчийн бодит урсгалыг үзүүлнэ.",
            "Тестийн үр дүн баримттай.",
            "Гишүүн бүрийн хувь нэмэр тодорхой.",
          ],
          check: {
            question: "Хувийн хувь нэмрийг ямар нотолгоогоор харуулах вэ?",
            answer:
              "Өөрийн хийсэн commit, загвар, эсвэл тестийн мөрөөс нэгийг нээж, шийдвэр ба үр дүнгээ тайлбарлана.",
          },
        },
      ],
    },
  ],
};
