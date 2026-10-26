
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  LayoutDashboard,
} from "lucide-react";
import { HelpArticleData } from "@/lib/help/type";


type HelpArticleProps = {
  article: HelpArticleData;
};

export default function HelpArticle({
  article,
}: HelpArticleProps) {
  const isDashboard = article.slug === "dashboard";

  return (
    <article className="mx-auto w-full">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#718078]"
      >
        <Link href="/help" className="hover:text-[#176B55]">
          Help Center
        </Link>

        <ChevronRight className="h-4 w-4" />

        <span>{article.category}</span>

        {!isDashboard && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[#53645D]">
              {article.title}
            </span>
          </>
        )}
      </nav>

      {/* Article header */}
      <header className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF3E7] text-[#176B55]">
          {isDashboard ? (
            <LayoutDashboard className="h-6 w-6" />
          ) : (
            <BookOpen className="h-6 w-6" />
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#173F35] sm:text-4xl">
          {article.title}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-[#53645D]">
          {article.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#718078]">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {article.category}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            {article.readTime}
          </span>
        </div>
      </header>

      {/* Overview */}
      <section className="mb-10 rounded-2xl border border-[#DDE5DE] bg-[#F7F9F6] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#176B55]">
            <CircleHelp className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-[#173F35]">
              {article.overviewTitle ?? "Overview"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#53645D]">
              {article.overview}
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="space-y-8">
        <h2 className="text-xl font-bold text-[#173F35]">
          Step-by-step instructions
        </h2>

        {article.steps.map((step, index) => (
          <section
            key={`${article.slug}-${step.title}`}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3E7] text-sm font-semibold text-[#176B55]">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="min-w-0 pt-1">
              <h3 className="font-semibold text-[#173F35]">
                {step.title}
              </h3>

              <p className="mt-2 leading-7 text-[#53645D]">
                {step.description}
              </p>

              {step.image && (
                <figure className="mt-4 overflow-hidden rounded-xl border border-[#DDE5DE] bg-[#F7F9F6]">
                  {/* Use a regular img so this works without
                      additional next/image configuration. */}
                  <img
                    src={step.image}
                    alt={step.imageAlt ?? step.title}
                    className="h-auto w-full"
                    loading="lazy"
                  />
                  {step.imageAlt && (
                    <figcaption className="border-t border-[#DDE5DE] px-4 py-2 text-xs text-[#718078]">
                      {step.imageAlt}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          </section>
        ))}
      </section>

      {/* Related guides */}
      {article.relatedGuides &&
        article.relatedGuides.length > 0 && (
          <section className="mt-12 border-t border-[#E5EBE5] pt-8">
            <h2 className="text-xl font-bold text-[#173F35]">
              Related guides
            </h2>

            <div className="mt-4 divide-y divide-[#E5EBE5] rounded-xl border border-[#E5EBE5]">
              {article.relatedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group flex items-center gap-4 p-4 transition hover:bg-[#F7F9F6] sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                    {guide.href.includes("bookings") ? (
                      <CalendarCheck className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[#173F35]">
                      {guide.title}
                    </h3>

                    <p className="mt-1 text-sm text-[#718078]">
                      {guide.description}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-[#82A995] transition group-hover:translate-x-1 group-hover:text-[#176B55]" />
                </Link>
              ))}
            </div>
          </section>
        )}
    </article>
  );
}
