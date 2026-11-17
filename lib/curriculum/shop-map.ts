export const shopNumbers = [2, 4, 6];

export const shopProducts = [
  { id: "notebook", name: "Дэвтэр", price: 3500, inStock: true },
  { id: "pen", name: "Бал", price: 1500, inStock: true },
  { id: "case", name: "Харандааны сав", price: 6000, inStock: false },
];

export const productSource = (product: (typeof shopProducts)[number]) =>
  `{ id: "${product.id}", name: "${product.name}", price: ${product.price}, inStock: ${product.inStock} }`;

export const productsSource = `const products = [
  notebook,
  ${shopProducts.slice(1).map(productSource).join(",\n  ")},
];`;

export const notebookSource = `const notebook = ${productSource(shopProducts[0])};`;

export const numbersSource = `const numbers = [${shopNumbers.join(", ")}];
const doubled = numbers.map((number) => number * 2);

console.log(doubled); // [4, 8, 12]
console.log(numbers); // [2, 4, 6]`;

export const productPageSource = `${notebookSource}

${productsSource}

export default function ShopPage() {
  const secondProduct = products[1];

  return (
    <main>
      <h1>Сургуулийн дэлгүүр</h1>
      <h2>Онцлох бараа</h2>
      <p>{notebook.name} — {notebook.price} ₮</p>
      <p>Нийт бараа: {products.length}</p>
      <p>Хоёр дахь бараа: {secondProduct.name} — {secondProduct.price} ₮</p>
    </main>
  );
}`;

export const shopPageSource = `${notebookSource}

${productsSource}

export default function ShopPage() {
  return (
    <main>
      <h1>Сургуулийн дэлгүүр</h1>
      <p>Нийт бараа: {products.length}</p>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name} — {product.price} ₮</li>
        ))}
      </ul>
    </main>
  );
}`;
