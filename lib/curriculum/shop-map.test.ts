import assert from "node:assert/strict";
import test from "node:test";
import { shopMapFlow } from "./shop-map-flow";

test("map flow collects each returned value in order, including an empty input", () => {
  const numbers = shopMapFlow("map-numbers", 3);
  assert.deepEqual(
    numbers.frames
      .filter(({ node }) => node === "save")
      .map(({ output }) => output),
    [["4"], ["4", "8"], ["4", "8", "12"]],
  );
  const products = shopMapFlow("map-products", 2);
  assert.deepEqual(products.frames.at(-1)?.output, [
    "<li>Дэвтэр — 3500 ₮</li>",
    "<li>Бал — 1500 ₮</li>",
  ]);
  const empty = shopMapFlow("map-numbers", 0);
  assert.ok(!empty.frames.some(({ node }) => node === "callback"));
  assert.deepEqual(empty.frames.at(-1)?.output, ["[]"]);
});
