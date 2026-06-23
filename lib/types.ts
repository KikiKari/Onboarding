export type Platform = "Claude" | "Perplexity";

export type Project = {
  slug: string;
  title: string;
  platform: Platform;
  summary: string;
  detail: string;
  tags: string[];
  github: string;
  demo?: string;
  media: string;
  accent: "accent" | "teal" | "amber";
};

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};
