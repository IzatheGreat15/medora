
import { notFound } from "next/navigation";
import HelpArticle from "@/components/help/HelpArticle";
import { helpArticles } from "@/lib/help/articles";

type HelpPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return helpArticles
    .filter((article) => article.slug !== "dashboard")
    .map((article) => ({
      slug: article.slug.split("/"),
    }));
}

export default async function HelpArticlePage({
  params,
}: HelpPageProps) {
  const { slug } = await params;
  const articleSlug = slug.join("/");

  const article = helpArticles.find(
    (item) => item.slug === articleSlug
  );

  if (!article) notFound();

  return <HelpArticle article={article} />;
}
