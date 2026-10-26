
export type HelpStep = {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

export type RelatedGuide = {
  title: string;
  description: string;
  href: string;
};

export type HelpArticleData = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  overviewTitle?: string;
  overview: string;
  steps: HelpStep[];
  relatedGuides?: RelatedGuide[];
};
