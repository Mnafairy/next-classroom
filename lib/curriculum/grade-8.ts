import { file, html, js, py, snippet } from "./examples";
import type { GradePlan } from "./types";

export const grade8: GradePlan = {
  grade: 8,
  summary:
    "JavaScript функц ба массив, өгөгдөл хадгалдаг веб, Cambridge Computing 9",
  pacing:
    "Мөрийн «Цаг» багана 72 болж нийлнэ. Массивын нэгтгэл ба дүрэмд суурилсан системийн тайлбарт 59–62-р цаг давхацсан тул багш эдгээр дөрвөн цагийг хуваарийн дагуу уялдуулна.",
  units: [
    {
      title: "1. JavaScript функц, массив ба үйл явдал",
      lessons: [
        {
          id: "functions",
          sourceRow: 9,
          periods: 4,
          coverage: "new",
          title: "Функц, параметр ба return",
          objective:
            "Тооцоог параметртэй функцэд бичиж, буцаасан утгаар дараагийн тооцоо хийнэ.",
          materials: "JavaScript талбар, цаасан тооцооны гурван жишээ.",
          example: {
            explanation:
              "price, count нь зарлалын параметр. 2500, 3 нь дуудах үеийн аргумент. return нь үр дүнг дуудсан газар өгдөг тул нийлбэрийг дахин тооцоонд ашиглаж болно.",
            files: [
              js(
                "cost.js",
                `function lineTotal(price, count) {
  return price * count;
}
const notebooks = lineTotal(2500, 3);
const pencils = lineTotal(800, 2);
console.log(notebooks, pencils, notebooks + pencils);`,
              ),
            ],
          },
          practice: [
            "Жишээний гурван гаралтыг тооцоод ажиллуул. Дуудлага бүрийн аргументыг соль.",
            "Хувийн хөнгөлөлт тооцдог applyDiscount(total, percent) функц бич. 10000, 15 оруулахад 8500 буцаа.",
            "Бараа 0 ширхэгтэй болон хөнгөлөлт 0, 100 хувьтай тохиолдлыг шалга.",
            "Тооцооны хоёр функцээ ашиглан гурван бараатай сагсны нийт үнийг нэг мөрд хэвлэ.",
          ],
          deliverable:
            "Дахин ашиглагддаг хоёр функц, хэвийн ба заагийн тооцооны жишээ.",
          criteria: [
            "Тооцоонд параметр ашигласан.",
            "Үр дүнг return-оор өгч дараагийн тооцоонд ашигласан.",
            "Өөр аргументтай олон дуудлага зөв.",
          ],
          check: {
            question:
              "Функц зөвхөн console.log хийвэл const total-д ямар утга оноогдох вэ?",
            answer:
              "Тодорхой return байхгүй учир undefined оноогдоно. console.log нь утгыг дэлгэцэд бичдэг.",
          },
        },
        {
          id: "arrays",
          sourceRow: 10,
          periods: 4,
          coverage: "new",
          title: "Массив ба онооны статистик",
          objective:
            "Оноог массиваар хадгалж, индексээр өөрчлөн, давталтаар нийлбэр, дундаж, их ба бага утгыг олно.",
          materials: "JavaScript талбар, зохиомол онооны багц.",
          example: {
            explanation:
              "scores[0] нь эхний утга. push төгсгөлд элемент нэмнэ. 75, 92, 80, 90-ийн нийлбэр 337, дундаж 84.25. Хоосон массивыг тусад нь шалгаж 0-д хуваахаас сэргийлнэ.",
            files: [
              js(
                "scores.js",
                `const scores = [75, 92, 80];
scores.push(90);
let sum = 0;
for (let i = 0; i < scores.length; i++) {
  sum += scores[i];
}
console.log(scores.length ? sum / scores.length : "Өгөгдөл алга");`,
              ),
            ],
          },
          practice: [
            "Хоёр дахь оноог 88 болгож шинэчил. Эхний ба сүүлийн утгыг индексээр хэвлэ.",
            "Давталтад min, max хувьсагч нэм. Хоосон массив биш үед эхний утгаар эхлүүл.",
            "90 байгаа эсэхийг давталтаар олоод индексийг харуул. Байхгүй тохиолдолд −1 гэж хэвлэ.",
            "Нэг оноо, давхардсан оноо, хоосон массив гурвыг турш. Хүлээсэн гаралтаа эхлээд бич.",
          ],
          deliverable: "Онооны статистик, хайлтын .js файл ба гурван тест.",
          criteria: [
            "Индекс ба length зөв ашигласан.",
            "Дундаж, min, max зөв.",
            "Хоосон оролтод ойлгомжтой гаралттай.",
          ],
          check: {
            question: "Дөрвөн элементтэй массивын сүүлийн индекс хэд вэ?",
            answer: "3. Массив 0, 1, 2, 3 индекстэй.",
          },
        },
        {
          id: "filter-sort",
          sourceRow: 11,
          periods: 4,
          coverage: "new",
          title: "Объектын массивыг шүүх, эрэмбэлэх",
          objective: "Шалгуураар шинэ массив үүсгэж, тоон талбараар эрэмбэлнэ.",
          materials: "JavaScript талбар, сурагчийн зохиомол бүртгэл.",
          example: {
            explanation:
              "filter шалгуур хангасан бичлэгээр шинэ массив үүсгэнэ. sort-д b.score − a.score гэж өгвөл их оноо эхэлж гарна. Жишээ ‘Номин’, ‘Тэмүүжин’ гэж гаргана.",
            files: [
              js(
                "rank.js",
                `const students = [
  { name: "Тэмүүжин", score: 80 },
  { name: "Ану", score: 79 },
  { name: "Номин", score: 95 }
];
const ranking = students.filter(student => student.score >= 80);
ranking.sort((a, b) => b.score - a.score);
for (const student of ranking) console.log(student.name);`,
              ),
            ],
          },
          practice: [
            "Бичлэгүүдийг гараар шүүж, эрэмбэл. Дараа нь программаар шалга.",
            "Ижил шүүлтийг for ба push-аар бичээд filter хувилбартай тулга.",
            "Дөрөв дэх ижил оноотой бичлэг нэм. Ижил оноонд name.localeCompare() ашиглан нэрээр эрэмбэл.",
            "80, 81 гэсэн босго болон 100-аас дээш босгоор турш. Анхны students массивын дарааллыг шалга.",
          ],
          deliverable: "Шүүлт, эрэмбэ, ижил онооны дүрэмтэй жагсаалт.",
          criteria: [
            "Босго дээрх оноо багтсан.",
            "Тоон эрэмбэ зөв.",
            "Эх массивын дарааллыг хадгалсан.",
          ],
          check: {
            question:
              "students.sort(...) ба students.filter(...).sort(...) хоёрын аль нь эх массивыг эрэмбэлэх вэ?",
            answer:
              "Эхнийх нь students-ийг шууд эрэмбэлнэ. Хоёр дахь нь шүүж үүсгэсэн шинэ массивыг эрэмбэлнэ.",
          },
        },
        {
          id: "events-gradebook",
          sourceRow: 12,
          periods: 4,
          coverage: "new",
          title: "Үйл явдлаар шинэчлэгддэг дүнгийн самбар",
          objective:
            "addEventListener ашиглан хэрэглэгчийн товч даралтаар массивын өгөгдлийг өөрөөр дүрсэлнэ.",
          materials:
            "HTML файлыг татаж браузерт нээнэ. Зохиомол оноогоор ажиллана.",
          example: {
            explanation:
              "render нь DOM-ийг өгөгдлөөс бүтээнэ. click бүр onlyPassing төлөвийг солиод render дуудна. Анхны хоёр мөрөөс 80-аас дээш болон тэнцүү оноотой нэг мөр харагдана.",
            files: [
              html(
                "Дүнгийн самбар",
                `<h1>Дүнгийн самбар</h1>
<button id="filter" type="button" aria-pressed="false">80-аас дээш ба тэнцүү</button>
<ul id="scores"></ul>
<script>
  const students = [{ name: "Ану", score: 78 }, { name: "Номин", score: 91 }];
  const filter = document.querySelector("#filter");
  const list = document.querySelector("#scores");
  let onlyPassing = false;
  function render() {
    const visible = onlyPassing ? students.filter(s => s.score >= 80) : students;
    list.replaceChildren();
    for (const student of visible) {
      const item = document.createElement("li");
      item.textContent = student.name + " · " + student.score;
      list.append(item);
    }
  }
  filter.addEventListener("click", () => {
    onlyPassing = !onlyPassing;
    filter.setAttribute("aria-pressed", String(onlyPassing));
    render();
  });
  render();
</script>`,
              ),
            ],
          },
          practice: [
            "HTML, өгөгдөл, render, event handler дөрвийг кодоос ялга.",
            "80 ба 79 оноотой бичлэг нэм. Товчийг хоёр удаа дарж зааг, сэргээх үйлдлийг шалга.",
            "Дэлгэцэд харагдаж байгаа мөрийн тоо болон дунджийг render дотор харуул.",
            "Оноогоор эрэмбэлэх хоёр дахь товч нэм. Гарны Tab, Enter-ээр хоёр товчийг ажиллуул.",
          ],
          deliverable: "Шүүлт, эрэмбэ, дундажтай интерактив дүнгийн самбар.",
          criteria: [
            "Үйл явдлаар DOM шинэчлэгдэнэ.",
            "Анхны массив бүрэн үлдэнэ.",
            "Гарнаас шүүлт, эрэмбийг удирдана.",
          ],
          check: {
            question:
              "render() зөвхөн хуудсыг нээхэд ажиллавал товч дарсны дараа ямар асуудал гарах вэ?",
            answer:
              "Төлөв өөрчлөгдсөн ч дэлгэц хуучин мөрүүдээ харуулна. Төлөв солих бүрд render хэрэгтэй.",
          },
        },
      ],
    },
    {
      title: "2. Форм, responsive загвар ба хадгалалт",
      lessons: [
        {
          id: "form-validation",
          sourceRow: 13,
          periods: 3,
          coverage: "new",
          title: "Формын оролтыг баталгаажуулах",
          objective:
            "HTML-ийн required, pattern болон JavaScript-ийн утгын шалгалтыг хослуулна.",
          materials: "Браузер, текст засварлагч, татсан HTML файл.",
          example: {
            explanation:
              "required нь хоосон, pattern нь буруу бүтэцтэй кодыг хориглоно. Утгаас хамаарсан дүрмийг JavaScript шалгана. Жишээнд A000-ийн формат зөв боловч сургалтын бүртгэлд нөөцөлсөн код.",
            files: [
              html(
                "Клубийн код",
                `<h1>Клубийн бүртгэл</h1>
<form id="register">
  <label>Код (A123 хэлбэртэй)
    <input name="code" required pattern="[A-Z][0-9]{3}">
  </label>
  <label>Цаг (1–5)
    <input name="hours" type="number" required min="1" max="5">
  </label>
  <button>Шалгах</button>
</form>
<p id="status" role="status"></p>
<script>
  const form = document.querySelector("#register");
  const status = document.querySelector("#status");
  form.addEventListener("input", () => { status.textContent = ""; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const code = data.get("code");
    const hours = Number(data.get("hours"));
    status.textContent = code === "A000" ? "Энэ код нөөцөлсөн" :
      !Number.isInteger(hours) || hours < 1 || hours > 5 ? "Цагаа засна уу" : "Бүртгэл зөв";
  });
</script>`,
              ),
            ],
          },
          practice: [
            "A123, abc, хоосон код, A000-ийг турш. Аль шалгалт ажилласныг бич.",
            "Цагт 0, 1, 5, 6, 2.5 оруулж хүлээсэн үр дүнг тэмдэглэ.",
            "Бүлэг сонгох талбар нэм. ‘Робот’ бүлгийн цаг дор хаяж 2 байх дүрмийг JS-ээр шалга.",
          ],
          deliverable: "Форм, JS дүрэм, хэвийн ба алдаатай оролтын хүснэгт.",
          criteria: [
            "Формат болон утгын дүрэм хоёул ажиллана.",
            "Засах ёстой утгыг мессеж тодорхой хэлнэ.",
            "Хязгаарын утгуудыг шалгасан.",
          ],
          check: {
            question:
              "A000 яагаад pattern-д тэнцээд JS шалгалтад тэнцэхгүй вэ?",
            answer:
              "Тэмдэгтийн бүтэц нь зөв. Бүртгэлийн дүрмээр A000 нөөцөлсөн тул утгын шалгалт буцаана.",
          },
        },
        {
          id: "responsive-grid",
          sourceRow: 14,
          periods: 2,
          coverage: "new",
          title: "CSS Grid ба дэлгэцэд тохирох байрлал",
          objective:
            "Grid-ийн багана, gap, @media ашиглан картын байрлалыг дэлгэцийн өргөнөөр өөрчилнө.",
          materials: "HTML файл, браузерийн дэлгэцийн өргөн солих горим.",
          example: {
            explanation:
              "Жижиг дэлгэцэд нэг багана. 42rem-ээс эхлээд grid нь тэнцүү гурван багана гаргана. minmax(0, 1fr) нь баганын зайг тэнцүү хуваана.",
            files: [
              html(
                "Мэдээллийн карт",
                `<h1>Сургуулийн клуб</h1>
<section class="grid">
  <article>Робот</article><article>Шатар</article><article>Хөгжим</article>
</section>`,
                `.grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.grid article { padding: 16px; border: 1px solid #789; overflow-wrap: anywhere; }
@media (min-width: 42rem) {
  .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}`,
              ),
            ],
          },
          practice: [
            "360 ба 900 пикселд хэдэн багана үүсэж байгааг шалга. Дөрөв дэх карт нэм.",
            "36rem-д хоёр, 60rem-д гурван багана болго. 320, 640, 1024 пикселд текст хальж байгаа эсэхийг шалга.",
          ],
          deliverable:
            "Гурван өргөнд ажилладаг картын байрлал ба дэлгэцийн зураг.",
          criteria: [
            "Нэг, хоёр, гурван баганын төлөв харагдана.",
            "Урт текст дэлгэцээс хальдаггүй.",
            "Картуудын дараалал жижиг дэлгэцэд ойлгомжтой.",
          ],
          check: {
            question: "42rem хүрэхээс өмнө жишээ хэдэн багана үүсгэх вэ?",
            answer: "Нэг багана. Media query-ийн дүрэм 42rem-ээс үйлчилнэ.",
          },
        },
        {
          id: "local-storage",
          sourceRow: 15,
          periods: 3,
          coverage: "new",
          title: "JSON ба localStorage",
          objective:
            "Объектын массивыг JSON текст болгон хадгалж, дахин ачаалахад сэргээнэ.",
          materials:
            "Татсан HTML файлыг тусдаа хавтаст хадгал. Тухайн хавтаст python3 -m http.server 8000 --bind 127.0.0.1 ажиллуулж, http://localhost:8000 нээнэ.",
          example: {
            explanation:
              "localStorage текст хадгалдаг. JSON.stringify массиваас текст үүсгэнэ. JSON.parse текстийг буцааж өгөгдөл болгоно. Түлхүүр байхгүй үед хоосон массиваас эхэлнэ.",
            files: [
              html(
                "Хадгалалтын жишээ",
                `<h1>Хадгалсан сонголт</h1>
<button id="save" type="button">Жишээ хадгалах</button>
<output id="data"></output>
<script>
  const key = "kodlab-grade8-storage-demo";
  const data = document.querySelector("#data");
  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(key) ?? "[]");
      data.textContent = Array.isArray(value) ? JSON.stringify(value) : "[]";
    } catch {
      data.textContent = "Өгөгдлийг уншиж чадсангүй";
    }
  }
  document.querySelector("#save").addEventListener("click", () => {
    try {
      localStorage.setItem(key, JSON.stringify([{ title: "Шатар" }]));
      load();
    } catch {
      data.textContent = "Хадгалж чадсангүй";
    }
  });
  load();
</script>`,
              ),
            ],
          },
          practice: [
            "Хадгалахаас өмнө, дараа, дахин ачаалсны дараа дэлгэцийг ажигла.",
            "Хоёр дахь объект нэм. DevTools-ийн Storage хэсгээс түлхүүр, JSON бичвэрийг ол.",
            "Түлхүүрийн утгыг санаатайгаар эвдэж унших алдааг турш. removeItem(key)-тай ‘Цэвэрлэх’ товч нэм.",
          ],
          deliverable:
            "JSON хадгалж сэргээдэг модуль, дахин ачаалах ба эвдэрсэн өгөгдлийн тест.",
          criteria: [
            "Массив дахин ачаалахад сэргэсэн.",
            "Хоосон ба эвдэрсэн утгад хариу харагдана.",
            "Цэвэрлэхдээ зөвхөн аппын түлхүүрийг устгасан.",
          ],
          check: {
            question:
              "Массивыг setItem-д JSON.stringify-гүй өгвөл юуг алдах вэ?",
            answer:
              "Объектын талбарын бүтцийг хадгалах JSON текст үүсэхгүй. Дараа нь массив болгон сэргээхэд шаардлагатай бүтэц алдагдана.",
          },
        },
        {
          id: "notes-app",
          sourceRow: 16,
          periods: 2,
          coverage: "new",
          title: "Тэмдэглэл хадгалдаг веб апп",
          objective:
            "Тэмдэглэл нэмэх, устгах, дахин ачаалсны дараа сэргээх үйлдлүүдийг холбоно.",
          materials: "Өмнөх хадгалалтын жишээ, браузер ба localhost сервер.",
          example: {
            explanation:
              "Өөрчлөлт бүрд эхлээд шинэ массивыг хадгал. Хадгалалт амжилттай бол notes болон DOM-ийг шинэчил. Давхардсан бичвэртэй тэмдэглэлийг тусдаа id-аар танина.",
            files: [
              snippet(
                "notes.js · хадгалах үйлдэл",
                `let notes = [];
const key = "kodlab-grade8-notes";
function commit(nextNotes) {
  try {
    localStorage.setItem(key, JSON.stringify(nextNotes));
    notes = nextNotes;
    render();
    status.textContent = "Хадгаллаа";
  } catch {
    status.textContent = "Хадгалж чадсангүй";
  }
}
// Шинэ тэмдэглэл
// commit([...notes, { id: crypto.randomUUID(), text }]);
// Устгах
// commit(notes.filter(note => note.id !== id));`,
              ),
            ],
          },
          practice: [
            "Форм, жагсаалт, status бүхий HTML үүсгэ. Нээхэд өмнөх хичээлийн load аргаар notes сэргээ. Бичвэрийг trim хийж хоосон тэмдэглэлийг буцаа.",
            "render дотор textContent ба ‘Устгах’ товч хэрэглэ. Ижил нэртэй хоёр мөр нэмж нэгийг нь устгаад хуудсаа дахин ачаал.",
            "Бүх тэмдэглэл устахад хоосон төлөв харуул. Хадгалалт амжилтгүй үед өмнөх жагсаалтаа хадгал.",
          ],
          deliverable: "Нэмэх, устгах, сэргээх боломжтой тэмдэглэлийн апп.",
          criteria: [
            "Нэг id-д харгалзах мөр л устдаг.",
            "Өгөгдөл дахин ачаалахад таардаг.",
            "Хоосон текст ба хадгалалтын алдааг тайлбарладаг.",
          ],
          check: {
            question:
              "Устгасны дараа localStorage-д бичихгүй бол дахин ачаалахад юу болох вэ?",
            answer:
              "Хуучин массив сэргээгдэж, устгасан тэмдэглэл буцаад харагдана.",
          },
        },
      ],
    },
    {
      title: "3. Cambridge Computing 9 · 9.1–9.4",
      lessons: [
        {
          id: "chatbot",
          sourceRow: 17,
          periods: 6,
          coverage: "new",
          title: "Дараалал, сонголт, давталттай чатбот",
          objective:
            "Асуултын мөрүүдийг нэг нэгээр уншиж, дүрмийн дагуу хариулдаг ботыг Python болон JavaScript-ээр загварчилна.",
          materials: "Доорх хоёр кодын талбар. Зохиомол асуултаар ажиллана.",
          example: {
            explanation:
              "Эхлээд асуултаа цэвэрлэнэ. Дараа нь дүрэм сонгоно. Давталт дараагийн асуултад шилжинэ. ‘баяртай’ дээр дуусна. Хоёр хувилбар ижил гурван оролтод ижил хариу өгнө.",
            files: [
              py(
                "bot.py",
                `while True:
    text = input().strip().lower()
    if text == "баяртай":
        print("Дараа уулзъя")
        break
    elif text == "цаг":
        print("Клуб 15:00 цагт эхэлнэ")
    else:
        print("‘цаг’ гэж асуугаарай")`,
                " ЦАГ \nхаана\nбаяртай",
              ),
              js(
                "bot.js",
                `const messages = [" ЦАГ ", "хаана", "баяртай"];
for (const message of messages) {
  const text = message.trim().toLowerCase();
  if (text === "баяртай") {
    console.log("Дараа уулзъя");
    break;
  } else if (text === "цаг") {
    console.log("Клуб 15:00 цагт эхэлнэ");
  } else {
    console.log("‘цаг’ гэж асуугаарай");
  }
}`,
              ),
            ],
          },
          practice: [
            "Асуулт, хариу, дуусах нөхцөл бүхий шийдвэрийн зураг зур.",
            "Хоёр кодын дараалал, сонголт, давталтын хэсгийг тэмдэглэ.",
            "‘хаана’ ба ‘ямар клуб’ дүрмийг Python-д нэм.",
            "Ижил дүрмийг JS-д хөрвүүл. Хоёр хэлэнд ижил дарааллын оролт өг.",
            "Танихгүй, хоосон, том үсэгтэй асуулт ба ‘баяртай’-н дараах оролтыг турш.",
            "Дүрмийн хариуг функцэд ялгаж, өөр сэдэвтэй гурван асуултаар демо хий.",
          ],
          deliverable:
            "Хоёр хэл дээрх дүрэмт чатбот, оролт/гаралтын дөрвөн тест.",
          criteria: [
            "Оролтыг цэвэрлэж, давталтаар боловсруулдаг.",
            "Танихгүй асуултад чиглүүлэх хариутай.",
            "Дуусах нөхцөл хоёр хэл дээр ажиллана.",
          ],
          check: {
            question:
              "‘баяртай’ хамгийн эхний оролт бол дараагийн асуултад хариулах уу?",
            answer:
              "‘Дараа уулзъя’ гэж хэвлээд break ажиллана. Үлдсэн оролтыг боловсруулахгүй.",
          },
        },
        {
          id: "topology-parity",
          sourceRow: 18,
          periods: 6,
          coverage: "new",
          title: "Сүлжээний топологи ба parity bit",
          objective:
            "Bus, ring, star бүтцийг харьцуулж, тэгш parity bit-ээр нэг битийн өөрчлөлтийг илрүүлнэ.",
          materials: "Сүлжээ зурах цаас, 0/1 карт, JavaScript талбар.",
          example: {
            explanation:
              "1011 дотор гурван 1 байна. Тэгш parity-д төгсгөлд 1 нэмээд 10111 болгоно. Нэг бит солигдвол 1-ийн тоо сондгой болно.",
            files: [
              js(
                "parity.js",
                `function countOnes(bits) {
  return [...bits].filter(bit => bit === "1").length;
}
const data = "1011";
const packet = data + String(countOnes(data) % 2);
console.log(packet);
for (const received of [packet, "10011", "10001"]) {
  console.log(received, countOnes(received) % 2 === 0 ? "Тэгш" : "Алдаа илэрлээ");
}`,
              ),
            ],
          },
          practice: [
            "Тус бүр таван төхөөрөмжтэй bus, ring, star зур. Нэг холбоос тасрахад хэн хэнтэй холбогдохоо тэмдэглэ.",
            "Star-д шинэ төхөөрөмж нэмэхэд төв төхөөрөмжийн хэдэн порт шаардагдахыг тооц. Хаяг ба дамжуулах дүрэм тохир.",
            "0000, 1000, 1111 дээр parity bit-ийг гараар ол. JS-ийн үр дүнтэй тулга.",
            "Нэг бит, дараа нь хоёр бит солиод кодын гаралтыг тэмдэглэ.",
            "Шалгагчид зөвхөн 0/1, урт нь 5 байх оролтын шалгалт нэм.",
            "Алдаа илрүүлэх, шифрлэх, сүлжээнд орох эрх олгох гэсэн гурван өөр зорилгод тохирох жишээ нэрлэ.",
          ],
          deliverable:
            "Гурван сүлжээний зураг, parity үүсгэгч/шалгагч, эвдсэн багцын тест.",
          criteria: [
            "Топологи тус бүрийн холболтыг зөв зурсан.",
            "Нэг битийн алдаа илэрдэг.",
            "Хоёр битийн жишээгээр parity-ийн хязгаарыг тайлбарласан.",
          ],
          check: {
            question:
              "Тэгш parity бүхий 10111 багцын хоёр бит солигдвол шалгалт юуг харуулах вэ?",
            answer:
              "1-ийн тооны тэгш сондгой байдал хэвээр үлдэнэ. Ийм хоёр битийн өөрчлөлт энгийн parity шалгалтаар илрэхгүй.",
          },
        },
        {
          id: "game-testing",
          sourceRow: 19,
          periods: 6,
          coverage: "new",
          title: "Массивтай тоглоом ба гурван төрлийн тест",
          objective:
            "1D массивын тоглоомыг төлөвлөж, явцын хүснэгт, хэвийн, заагийн ба буруу өгөгдлийн тестээр шалгана.",
          materials:
            "JavaScript талбар, цаасан хүснэгт, боломжтой бол micro:bit симулятор.",
          example: {
            explanation:
              "Гэрэл ассан дарааллыг тоглогч давтана. Массивын индекс бүрийн тэмдэг таарвал нэг оноо. Тоглогчийн оролт 0, 1, 2 гэсэн тэмдэгтэй байна.",
            files: [
              js(
                "memory-game.js",
                `function score(pattern, attempt) {
  if (attempt.length !== pattern.length || attempt.some(x => ![0, 1, 2].includes(x))) {
    return "Оролт буруу";
  }
  let points = 0;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === attempt[i]) points++;
  }
  return points;
}
console.log(score([0, 2, 1], [0, 0, 1]));
console.log(score([0, 2, 1], [0, 2]));
console.log(score([0, 2, 1], [0, 3, 1]));`,
              ),
            ],
          },
          practice: [
            "Эхлэх, утга шалгах, тоолох, үр дүн харуулах урсгал зур.",
            "i, pattern[i], attempt[i], points баганатай мөрдөх хүснэгт бөглө.",
            "Бүгд таарсан, нэг ч таараагүй, буруу урттай, 3 гэсэн буруу тэмдэгтэй тест бич.",
            "Хоосон тоглоомын өгөгдөлд дүрэм тогтоо. Хамгийн богино зөв дараалал нэг элементтэй болго.",
            "micro:bit симуляторт A, B болон A+B даралтыг 0, 1, 2 гэсэн оролтод оноож төлөвлө. Боломжтой бол массивт хадгалж LED дээр оноог үзүүл.",
            "Найзынхаа туршилтын нэг зөрүүг засаж өмнөх бүх тестээ давт.",
          ],
          deliverable:
            "Массивтай тоглоом, урсгал зураг, мөрдөх хүснэгт ба тестийн төлөвлөгөө.",
          criteria: [
            "Оноо индекс бүрээр зөв нэмэгдэнэ.",
            "Хэвийн, заагийн, буруу оролттой тесттэй.",
            "Илэрсэн зөрүү ба засварыг тэмдэглэсэн.",
          ],
          check: {
            question:
              "Дээрх [0, 2, 1] ба [0, 0, 1] хоёрт хэдэн индекс таарах вэ?",
            answer: "2. Индекс 0 ба 2 дээр утгууд таарна.",
          },
        },
        {
          id: "cpu-logic",
          sourceRow: 20,
          periods: 6,
          coverage: "new",
          title: "Процессор, логик хаалга ба автоматжуулалт",
          objective:
            "Fetch–decode–execute мөчлөгийг мөрдөж, AND, OR, NOT, XOR хаалганы гаралтыг симуляцлана.",
          materials: "Зааврын карт, үнэний хүснэгт, JavaScript талбар.",
          example: {
            explanation:
              "Fetch нь дараагийн зааврыг санах ойгоос авна. Decode үйлдлийг танина. Execute зааврын утгаар бүртгэлийг шинэчилнэ. Жишээний ADD 4, ADD 3 хоёрын дараа accumulator 7.",
            files: [
              js(
                "processor.js",
                `const memory = [{ op: "ADD", value: 4 }, { op: "ADD", value: 3 }];
let accumulator = 0;
for (let address = 0; address < memory.length; address++) {
  const instruction = memory[address]; // Fetch
  const { op, value } = instruction;   // Decode
  if (op === "ADD") accumulator += value; // Execute
  console.log(address, accumulator);
}
for (const a of [false, true]) {
  for (const b of [false, true]) {
    console.log(Number(a), Number(b), Number(a && b), Number(a !== b));
  }
}`,
              ),
            ],
          },
          practice: [
            "Үйлдлийн систем, төхөөрөмжийн драйвер, хүснэгтийн аппыг системийн ба хэрэглээний программд ангил.",
            "Зааврын хаяг, опкод, accumulator баганатай хүснэгтэд хоёр мөчлөгийг мөрд.",
            "SUB үйлдэл нэмээд 4 + 3 − 2 үр дүнг шалга. Танихгүй опкодод алдаа мэдэгд.",
            "OR ба NOT гаралтыг нэм. Хоёр оролтын дөрвөн хослолыг цаасан хүснэгттэй тулга.",
            "Хоёр мэдрэгчийн аль нэг нь асвал гэрэл асаах дүрмийг логик хаалгаар дүрсэл.",
            "Тогтмол дүрмээр ажилладаг гэрэл ба шошготой жишээнээс ангилал сурдаг загварын оролт, гаралтыг харьцуул.",
          ],
          deliverable:
            "Зааврын мөчлөгийн мөрдөлт, дөрвөн логик хаалганы хүснэгт, JS симулятор.",
          criteria: [
            "Мөчлөгийн гурван үе шат зөв.",
            "Хаалга бүрийн гаралт хүснэгттэй таарна.",
            "Автомат дүрэм ба сурсан загварын жишээ тодорхой.",
          ],
          check: {
            question: "a = 1 ба b = 1 үед AND, XOR хоёр ямар гаралттай вэ?",
            answer: "AND = 1. XOR = 0. XOR нь хоёр оролт ялгаатай үед 1 өгнө.",
          },
        },
      ],
    },
    {
      title: "4. Өгөгдөл, дүрмийн систем ба эцсийн төсөл",
      lessons: [
        {
          id: "data-analysis",
          sourceRow: 21,
          periods: 6,
          coverage: "new",
          title: "Том өгөгдөл, холбоост сан ба хүснэгтийн шинжилгээ",
          objective:
            "Хоёр хүснэгтийг түлхүүрээр холбож, MIN, MAX, COUNT, IF болон шүүлтээр зохиомол өгөгдөл шинжилнэ.",
          materials:
            "Excel эсвэл Sheets, боломжтой бол Access, доорх хоёр CSV, JavaScript талбар.",
          example: {
            explanation:
              "clubs-ийн id нь клуб бүрийг танина. visits-ийн club_id аль клубт хамаарахыг заана. Дөрвөн ирцийн min = 2, max = 8, count = 4. Хурдан нэмэгддэг, олон төрлийн, асар их хэмжээтэй өгөгдөл боловсруулахад энэ жижиг жишээнээс өөр нөөц шаардлагатай.",
            files: [
              file("clubs.csv", "id,club\nC1,Шатар\nC2,Робот\n"),
              file(
                "visits.csv",
                "visit_id,club_id,attendance\nV1,C1,2\nV2,C2,8\nV3,C1,4\nV4,C2,6\n",
              ),
              js(
                "attendance.js",
                `const visits = [{ club: "C1", count: 2 }, { club: "C2", count: 8 },
  { club: "C1", count: 4 }, { club: "C2", count: 6 }];
const counts = visits.map(visit => visit.count);
console.log(Math.min(...counts), Math.max(...counts), counts.length);
console.log(visits.filter(visit => visit.club === "C2"));`,
              ),
            ],
          },
          practice: [
            "Ирцийн жижиг файл ба өдөр бүр нэмэгдэх мянга мянган зочлолтын өгөгдлийг хэмжээ, хурд, төрлөөр харьцуул.",
            "Хоёр CSV-г тусдаа хүснэгтэд импортол. id ба club_id-г тэмдэглэ. Access ашиглавал Clubs.id → Visits.club_id холбоос үүсгэ.",
            "Visits хүснэгтийн C2:C5 мужид MIN, MAX, COUNT хэрэглэж жишээтэй тулга.",
            'D2-д =IF(C2>=6,"Дүүрэн","Сул") бичээд доош хуул. Шүүлтээр C2 клубийн мөрүүдийг гарга.',
            "JavaScript-ийн үр дүнг хүснэгттэй тулга. Багтаамж 6 байснаа 8 болбол дүүрэн мөрийн тоо яаж өөрчлөгдөхийг тооц.",
            "Хүснэгтийн түлхүүрийг шалга. Байхгүй C3 клубийн зочлолт орвол яаж илрүүлэхээ тайлбарла.",
          ],
          deliverable:
            "Холбоосын зураг, шинжилгээтэй хүснэгт, JS тайлан ба багтаамжийн дүгнэлт.",
          criteria: [
            "Түлхүүр ба олон бичлэгийн холбоог зөв тайлбарласан.",
            "Томьёоны үр дүн кодтой таарсан.",
            "Багтаамжийн хоёр хувилбарыг харьцуулсан.",
          ],
          check: {
            question:
              "C2 клубийн нэрийг солиход visits хүснэгтийн аль баганыг өөрчлөх шаардлагатай вэ?",
            answer:
              "Нэрийг Clubs хүснэгтэд солино. C2 id хэвээр байгаа тул Visits-ийн club_id хэвээр байна.",
          },
        },
        {
          id: "array-grid",
          sourceRow: 22,
          periods: 6,
          coverage: "new",
          title: "Массивын нэгтгэл · Торны тоглоом",
          objective:
            "Нэг хэмжээст массиваар тор хадгалж, давтагдах индексийн тооцоог функцэд нэгтгэнэ.",
          materials: "3 × 3 цаасан тор, JavaScript талбар.",
          example: {
            explanation:
              "3 баганатай торны row 1, col 2 нүд 1 × 3 + 2 = 5 индекстэй. Нэг томьёог бүх нүдэд ашиглавал мөр бүрд тусдаа нөхцөл бичих ажил багасна.",
            files: [
              js(
                "grid.js",
                `const width = 3;
const board = Array(9).fill(".");
function place(row, col, symbol) {
  if (!Number.isInteger(row) || !Number.isInteger(col) ||
      row < 0 || row >= 3 || col < 0 || col >= width) return false;
  const index = row * width + col;
  if (board[index] !== ".") return false;
  board[index] = symbol;
  return true;
}
console.log(place(1, 2, "X"), place(1, 2, "O"));
for (let i = 0; i < board.length; i += width) {
  console.log(board.slice(i, i + width).join(" "));
}`,
              ),
            ],
          },
          practice: [
            "Цаасан торонд бүх индексийг бич. Эхний ба сүүлийн нүдийг томьёогоор ол.",
            "Кодоор булангийн нүднүүдэд тэмдэг тавь. Нэг нүдэнд давхар тавихыг шалга.",
            "Торыг 4 багана, 3 мөртэй болго. Хэмжээг тогтмол хувьсагчаар удирд.",
            "Хоосон нүдний тоо ба бүх X-ийн индексийг давталтаар гарга.",
            "Хэвлэх хэсгийг renderBoard функц болго. Хоёр өөр хэмжээтэй самбарт ажиллуул.",
            "Хязгаараас гадуурх, эзлэгдсэн, сүүлийн зөв нүдийг тестэлж тайлбарла.",
          ],
          deliverable:
            "Хэмжээ солих боломжтой торны загвар, хайлт ба гурван тест.",
          criteria: [
            "Индекс тооцох нэг дүрэмтэй.",
            "Буруу нүд өгөгдөл өөрчилдөггүй.",
            "Тор хэвлэх код дахин ашиглагддаг.",
          ],
          check: {
            question: "4 баганатай торны row 2, col 1 хэд дэх индекстэй вэ?",
            answer: "9. 2 × 4 + 1 = 9.",
          },
        },
        {
          id: "rule-system",
          sourceRow: 23,
          periods: 4,
          coverage: "new",
          title: "Дүрэмд суурилсан шийдвэр ба тест",
          objective:
            "Дүрмийн эрэмбийг төлөвлөж, давхцах нөхцөл ба хязгаарыг тестээр шалгана.",
          materials: "JavaScript талбар, шийдвэрийн хүснэгт.",
          example: {
            explanation:
              "Клубийн өрөөний хүсэлт эхлээд хүчинтэй эсэх, дараа нь хугацаа, багтаамж шалгана. Аль аль дүрэм таарах үед эхний return хэрэглэгчид түрүүлж харагдана.",
            files: [
              js(
                "booking-rules.js",
                `function decision(count, open, hasKey) {
  if (!Number.isInteger(count) || count < 1) return "Хүний тоогоо зас";
  if (!open || !hasKey) return "Өрөө ашиглах боломжгүй";
  if (count > 12) return "Багтаамж хэтэрсэн";
  return "Болно";
}
console.log(decision(12, true, true));
console.log(decision(13, true, true));
console.log(decision(13, false, true));`,
              ),
            ],
          },
          practice: [
            "Хүсэлт бүрийн нөхцөл, хариу, дүрмийн эрэмбийг хүснэгтэд бич.",
            "Зохион байгуулагчтай эсвэл багштай үед түлхүүр авч болох шинэ дүрэм нэм.",
            "0, 1, 12, 13 хүн болон хаалттай өрөөг шалга. Хоёр дүрэм давхацсан нэг мөр нэм.",
            "Найзын кодын нэг дүрмийг хүснэгттэй тулгаж санал өг. Саналаар зассан мөрөө дахин турш.",
          ],
          deliverable: "Дүрмийн функц, хүснэгт, тестийн нотолгоо, кодын санал.",
          criteria: [
            "Нөхцөлийн эрэмбэ ойлгомжтой.",
            "Давхцах дүрэм ба хязгаарыг туршсан.",
            "Саналын дараах засвар тэмдэглэгдсэн.",
          ],
          check: {
            question:
              "13 хүн, өрөө хаалттай, түлхүүртэй үед жишээ аль мессежийг өгдөг вэ?",
            answer:
              "‘Өрөө ашиглах боломжгүй’. Энэ шалгалт багтаамжийн дүрмээс өмнө байрласан.",
          },
        },
        {
          id: "capstone",
          sourceRow: 24,
          periods: 6,
          coverage: "new",
          title: "Эцсийн төсөл · Өгөгдөл хадгалдаг веб бүтээгдэхүүн",
          objective:
            "Функц, объектын массив, үйл явдал, валидаци, localStorage болон responsive байрлалыг нэг шийдэлд нэгтгэнэ.",
          materials:
            "Өмнөх тэмдэглэл эсвэл дүнгийн аппын загвар, браузер, текст засварлагч, localhost.",
          example: {
            explanation:
              "Жишээ төсөл нь клубийн хэрэгсэл захиалах бүртгэл. Бичлэг бүр id, item, quantity, returned талбартай. Хэрэглэгч нэмж, буцааснаар тэмдэглэж, идэвхтэй хүсэлтийг шүүнэ.",
            files: [
              snippet(
                "Хүлээн авах тест",
                "Нэмэх · 2 сагс → мөр нэмэгдэнэ\nЗааг · 0 сагс → тайлбар гарна\nДахин ачаалах · ижил хүсэлт үлдэнэ\nБуцаах · мөр идэвхтэй шүүлтээс гарна",
              ),
            ],
          },
          practice: [
            "Хэрэглэгчтэй ярилцаад нэг асуудал, гурван үйлдэл, хэмжиж болох гурван шалгуур бич.",
            "Дэлгэцийн ноорог, өгөгдлийн талбар, хадгалах түлхүүр, баталгаажуулах дүрмээ гарга.",
            "Формын submit-ээр бичлэг нэм. Жагсаалтыг массив болон тусдаа render функцээр зур.",
            "Төлөв солих, шүүх, хадгалах үйлдлийг холбо. Дахин ачаалсны дараах төлөвийг шалга.",
            "Хэвийн, заагийн, буруу оролт болон 360 пикселийн дэлгэцээр турш. Нэг алдааг зас.",
            "Асуудал, хэрэглэгчийн үйлдэл, хадгалалт, тестээ гурван минутын демогоор үзүүл.",
          ],
          deliverable:
            "Бүрэн ажиллагаатай апп, хэрэглэх товч заавар, тестийн хүснэгт ба демо.",
          criteria: [
            "Хэрэглэгчийн гурван үйлдэл ажилладаг.",
            "Хадгалалт ба жижиг дэлгэц шалгагдсан.",
            "Кодын үүргүүд салсан, тестийн баримттай.",
          ],
          check: {
            question: "Апп хадгалсан гэдгийг ямар тестээр батлах вэ?",
            answer:
              "Шинэ бичлэг нэмээд хуудсыг дахин ачаална. Өмнөх бичлэг болон төлөв нь ижил байгааг шалгана.",
          },
        },
      ],
    },
  ],
};
