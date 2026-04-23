export type PromptFormat = 'text' | 'json';

export interface Prompt {
  slug: string;
  title: string;
  description: string;
  content: string;
  format: PromptFormat;
  referenceImage: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  tags: string[];
  publishedAt: string;
}
