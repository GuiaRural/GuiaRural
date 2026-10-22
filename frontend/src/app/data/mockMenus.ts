export type Shift = "almoco" | "jantar";

export type Menu = {
  id: string;
  date: string; // AAAA-MM-DD
  shift: Shift;
  main: string;
  vegetarian: string;
  sides: string;
  salad: string;
  dessert: string;
  drink: string;
};

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Cardápios fictícios relativos à data atual, para que a semana corrente sempre tenha conteúdo.
export const MOCK_MENUS: Menu[] = [
  { id: "m1", date: isoDate(0), shift: "almoco", main: "Frango grelhado ao molho de ervas", vegetarian: "Escondidinho de macaxeira com legumes", sides: "Arroz, feijão carioca e farofa", salad: "Alface, tomate e cenoura", dessert: "Banana", drink: "Suco de acerola" },
  { id: "m2", date: isoDate(0), shift: "jantar", main: "Carne moída com legumes", vegetarian: "Omelete de espinafre", sides: "Arroz e cuscuz", salad: "Repolho com cenoura", dessert: "Doce de leite", drink: "Suco de caju" },
  { id: "m3", date: isoDate(1), shift: "almoco", main: "Peixe ao molho de coco", vegetarian: "Moqueca de banana-da-terra", sides: "Arroz, feijão preto e pirão", salad: "Pepino e tomate", dessert: "Laranja", drink: "Suco de goiaba" },
];
