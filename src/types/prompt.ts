export type PromptFormat = 'text' | 'json';

export type PromptImage = {
  url: string;
  alt: string;
};

export interface Prompt {
  slug: string;
  title: string;
  description: string;
  content: string;
  format: PromptFormat;
  images: PromptImage[];
  howToUse: string | null;
  tags: string[];
  publishedAt: string;
}
