export interface Page {
  id: string;
  title: string;
  content: string;
  slug: string;
  author: {
    id: string;
    name: string;
  }
  createdAt: Date;
  updatedAt: Date;
  tags: {
    id: string;
    name: string;
  }[];
}