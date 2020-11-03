import shortid from "shortid";
import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";

export type ID = string | number;

export const readableId = (): ID => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals, colors],
    length: 3,
    separator: "",
    style: "capital",
  });
};

export const stringId = (): ID => {
  return shortid();
};

export const numericId = (): ID => {
  const typedArray = new Uint8Array(5);
  const randomValues = window.crypto.getRandomValues(typedArray);

  return +randomValues.join("");
};
