export type Regulation = {
  id: string;
  type: string;
  title: string;
  tentang: string;
  year: number | null;
  pdf_url: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  regulation_id: string;
  pasal: string;
  content: string;
  type: string;
  created_at: string;
};

export type RegulationWithArticles = Regulation & {
  articles: Article[];
};
