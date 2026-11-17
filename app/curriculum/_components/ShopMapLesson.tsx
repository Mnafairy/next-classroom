import { js } from "@/lib/curriculum/examples";
import {
  notebookSource,
  numbersSource,
  productPageSource,
  productsSource,
  shopPageSource,
} from "@/lib/curriculum/shop-map";
import styles from "../curriculum.module.css";
import FlowLab from "./FlowLab";
import PracticeRunner from "./PracticeRunner";
import ShopJsxPreview from "./ShopJsxPreview";

export default function ShopMapLesson() {
  return (
    <>
      <section className={styles.block}>
        <h2>1. Тоо бүрийг map()-аар хувиргах</h2>
        <p>
          <code>numbers.map((number) =&gt; number * 2)</code> гэдэг мөрийг
          зүүнээс баруун тийш уншъя. <code>numbers</code> нь эх массив.
          <code> map()</code> элемент бүрийг дарааллаар нь arrow function-д
          өгнө. Эхний дуудалтад <code>number</code> нь <code>2</code>, дараагийн
          дуудалтад <code>4</code>, гурав дахь дуудалтад <code>6</code> байна.
        </p>
        <p>
          <code>=&gt;</code> сумны баруун талд ганц илэрхийлэл байвал JavaScript
          утгыг нь шууд буцаана. Функцийн биеийг <code>{"{ }"}</code>-ээр
          хүрээлбэл диаграммд үзүүлсэн шиг <code>return</code> бичнэ. Буцаасан{" "}
          <code>4</code>, <code>8</code>, <code>12</code> утгууд
          <code> doubled</code> гэсэн шинэ массивд орно. Энэ жишээнд эх массивын
          утгууд хэвээр байна.
        </p>
        <PracticeRunner
          file={js("numbers.js", numbersSource)}
          draftKey="curriculum/11/shop-map/numbers"
        />
        <p>
          Дасгал. <code>number * 2</code>-ыг <code>number + 10</code> болгоод
          ажиллуул. Эхний хэвлэлтэд <code>[12, 14, 16]</code> гарна.
        </p>
        <FlowLab mapMode="map-numbers" />
      </section>

      <section className={styles.block}>
        <h2>2. Нэг барааг объект болгох</h2>
        <p>
          Объект нэг барааны мэдээллийг нэг дор хадгална. <code>name</code> нь
          текст, <code>price</code> нь тоо, <code>inStock</code> нь
          <code> true</code> эсвэл <code>false</code> утгатай. <code>id</code>
          нь барааг ялгах тогтвортой дугаар буюу код.{" "}
          <code>notebook.price</code>
          гэдэг нь notebook объектын price талбараас <code>3500</code> утгыг
          уншина.
        </p>
        <PracticeRunner
          file={js(
            "product.js",
            `${notebookSource}

console.log(notebook.name);
console.log(notebook.price);

// Энд бараа бэлэн эсэх болон хоёр дэвтрийн үнийг хэвлэ.`,
          )}
          draftKey="curriculum/11/shop-map/object"
        />
        <p>
          Дасгал. Бараа бэлэн эсэх, хоёр дэвтрийн үнийг хоёр мөрөөр хэвлэ.{" "}
          <code>true</code>, <code>7000</code> гарах ёстой.
        </p>
        <details>
          <summary>Хариу харах</summary>
          <p>
            <code>console.log(notebook.inStock);</code> ба{" "}
            <code>console.log(notebook.price * 2);</code>
          </p>
        </details>
      </section>

      <section className={styles.block}>
        <h2>3. Барааны массив үүсгэж, утгыг нь унших</h2>
        <p>
          <code>products</code> массивд дэвтрийн объектыг эхэнд нь оруулаад бал,
          харандааны савын объектыг нэмлээ. Индекс <code>0</code>-ээс эхэлнэ.{" "}
          <code>products[1]</code> хоёр дахь барааг бүхлээр нь өгнө. Араас нь{" "}
          <code>.price</code> бичвэл тэр объектын үнэ гарна.
          <code> products.length</code> нь массивд хэдэн бараа байгааг өгнө.
        </p>
        <PracticeRunner
          file={js(
            "products.js",
            `${notebookSource}

${productsSource}

console.log(products[0].name);
console.log(products.length);

// Энд хоёр дахь барааны үнэ болон гурав дахь барааны төлөвийг хэвлэ.`,
          )}
          draftKey="curriculum/11/shop-map/array"
        />
        <p>
          Дасгал. Балын үнэ болон харандааны савын төлөвийг уншиж хэвлэ.{" "}
          <code>1500</code>, <code>false</code> гарах ёстой.
        </p>
        <details>
          <summary>Хариу харах</summary>
          <p>
            <code>console.log(products[1].price);</code> ба{" "}
            <code>console.log(products[2].inStock);</code>
          </p>
        </details>
      </section>

      <section className={styles.block}>
        <h2>4. Утгаа Next.js хуудсанд харуулах</h2>
        <p>
          Next.js App Router төсөлд <code>app/shop/page.tsx</code> файл
          <code> /shop</code> хуудсыг үүсгэнэ. <code>ShopPage</code> компонент
          JSX буцаана. JSX доторх <code>{"{notebook.name}"}</code> нь JavaScript
          утгыг уншиж дэлгэцэд оруулна. React үүнийг браузерт
          <code>{" <p>Дэвтэр — 3500 ₮</p>"}</code> хэлбэрээр дүрсэлнэ.
        </p>
        <p>
          Дасгал. <code>secondProduct</code>-ыг <code>thirdProduct</code>
          болгож, <code>products[2]</code>-оос унш. Доод мөрийг «Гурав дахь
          бараа» гэж өөрчлөхөд HTML үр дүнд «Харандааны сав — 6000 ₮» харагдах
          ёстой. Кодоо засаад «JSX ажиллуулах» товчийг дарж үр дүнгээ шалга.
        </p>
        <ShopJsxPreview code={productPageSource} />
      </section>

      <section className={styles.block}>
        <h2>5. map()-аар бүх барааг JSX жагсаалт болгох</h2>
        <ol className={styles.steps}>
          <li>
            <code>{"{products.map(…)}"}</code> нь JSX дотор JavaScript
            ажиллуулж, үр дүнг <code>{"<ul>"}</code> дотор оруулна.
          </li>
          <li>
            <code>(product) =&gt; (...)</code> нь бараа бүрээр нэг удаа
            дуудагдана. Эхний удаад <code>product</code> нь дэвтрийн объект
            байна.
          </li>
          <li>
            Сумны дараах дугуй хаалт олон мөртэй JSX-ийг нэг илэрхийлэл болгож,{" "}
            <code>{"<li>"}</code> элементийг шууд буцаана.
          </li>
          <li>
            <code>{"key={product.id}"}</code> нь нэмэх, хасах эсвэл эрэмбэлэх
            үед React-д мөрийг тухайн бараатай нь холбоход тусална. Нэг жагсаалт
            дотор <code>id</code> бүр өөр байна.
          </li>
        </ol>
        <FlowLab mapMode="map-products" />
        <p>
          Дасгал. Массивд{" "}
          <code>
            {'{ id: "eraser", name: "Баллуур", price: 800, inStock: true }'}
          </code>{" "}
          нэм. Нийт тоо дөрөв болж, жагсаалтын доор «Баллуур — 800 ₮» гарна.
          Дараа нь мөр бүрийн үнийн ард төлөвийг нь харуул.
        </p>
        <ShopJsxPreview code={shopPageSource} />
        <details>
          <summary>Үлдэгдэл харуулах жишээ</summary>
          <p>
            Үнийн ард <code>{'{product.inStock ? "Бэлэн" : "Дууссан"}'}</code>{" "}
            нэм. Нөхцөл үнэн үед «Бэлэн», худал үед «Дууссан» утга гарна.
          </p>
        </details>
        <p>
          Өөрийн Next.js төсөлд дээрх кодыг <code>app/shop/page.tsx</code>
          файлд хуул. <code>npm run dev</code> ажиллуулаад терминалд гарсан
          хаягийн <code>/shop</code> замыг нээ.
        </p>
      </section>
    </>
  );
}
