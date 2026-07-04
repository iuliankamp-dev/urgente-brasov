import { useParams, Link } from "wouter";
import { Calendar, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.blog.bySlug.useQuery({ slug: slug ?? "" }, { enabled: !!slug });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-12 max-w-3xl animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded-2xl mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Articolul nu a fost găsit</h1>
          <Link href="/blog"><Button variant="outline">Înapoi la blog</Button></Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="container py-10 max-w-3xl">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-600 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Înapoi la blog
          </Button>
        </Link>

        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8 shadow-md" />
        )}

        <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ro-RO", { year: "numeric", month: "long", day: "numeric" }) : ""}
          </span>
          {post.category && <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{post.category}</span>}
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>
    </PublicLayout>
  );
}
