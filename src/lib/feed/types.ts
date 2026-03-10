export type FeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  category?: string;
};

export type FeedConfig = {
  siteUrl: string;
  siteTitle: string;
  siteDescription: string;
  language: string;
};
