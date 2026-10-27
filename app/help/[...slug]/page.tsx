
import { Suspense } from "react";
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

export default function HelpArticlePage(props: HelpPageProps) {
  return (
    <Suspense fallback={<HelpArticleLoading />}>
      <HelpArticleContent {...props} />
    </Suspense>
  );
}

async function HelpArticleContent({ params }: HelpPageProps) {
  const { slug } = await params;
  const articleSlug = slug.join("/");

  const article = helpArticles.find(
    (item) => item.slug === articleSlug
  );

  if (!article) {
    notFound();
  }

  return <HelpArticle article={article} />;
}

function HelpArticleLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-8 w-2/3 rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-4/6 rounded bg-gray-200" />
        </div>
        <div className="h-56 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
