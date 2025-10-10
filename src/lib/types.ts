export interface Page {
  id: string;
  title: string;
  content: string;
  slug: string;
  author: {
    id: string;
    username: string;
  }
  createdAt: Date;
  updatedAt: Date;
  tags: {
    id: string;
    name: string;
  }[];
}