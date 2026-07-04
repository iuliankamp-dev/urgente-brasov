import { Link } from "wouter";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

export default function Blog() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery({ limit: 12 });

  return (
    <PublicLayout>
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-14">
        <div className="container text-center">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3">Blog Urgențe Brașov</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Sfaturi utile, ghiduri și noutăți despre serviciile de urgență din Brașov
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="bg-white rounded-2xl overflow-hidden card-hover shadow-card group cursor-pointer">
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {post.category && <Badge variant="secondary" className="text-xs mb-2">{post.category}</Badge>}
                      <h2 className="font-display font-bold text-gray-900 mb-2 group-hover:text-[oklch(0.52_0.22_25)] transition-colors line-clamp-2">{post.title}</h2>
                      {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ro-RO") : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.max(1, Math.ceil((post.content?.length ?? 0) / 1000))} min citire
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="font-display font-bold text-xl text-gray-700 mb-2">Niciun articol publicat încă</h2>
              <p className="text-gray-500">Revino curând pentru articole și sfaturi utile.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
