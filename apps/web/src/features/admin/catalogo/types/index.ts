export type PratoListItem = {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  available: boolean;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
