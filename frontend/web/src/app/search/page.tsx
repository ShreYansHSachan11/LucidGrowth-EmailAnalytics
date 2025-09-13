import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

async function searchEmails(q: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
    const url = `${baseUrl}/search/emails?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { 
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) {
      console.error("Search failed:", res.status, res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error searching emails:", error);
    return [];
  }
}

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params?.q || "";
  const results = q ? await searchEmails(q) : [];

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center float">
            <div className="w-6 h-6 bg-white rounded-lg"></div>
          </div>
          <h1 className="heading-primary">
            Email Search
          </h1>
          <p className="subheading">Find exactly what you're looking for</p>
        </div>

        {/* Search Form */}
        <div className="glass-card p-6">
          <form action="/search" className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                name="q"
                placeholder="Search emails, subjects, senders..."
                defaultValue={q}
                className="pl-12 h-12 text-lg border-0 bg-white/50 backdrop-blur-sm focus:bg-white/80 transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              </div>
            </div>
            <Button 
              type="submit" 
              className="btn-gradient h-12 px-8 text-lg"
            >
              Search
            </Button>
          </form>
          
          {q && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>Searching for:</span>
              <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full font-medium">
                "{q}"
              </span>
              <span className="text-gray-400">•</span>
              <span>{results.length} results found</span>
            </div>
          )}
        </div>

        {/* Results */}
        {!q ? (
          <div className="glass-card p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-sky-500 rounded-lg"></div>
            </div>
            <h3 className="heading-tertiary">Start Your Search</h3>
            <p className="text-gray-600">Enter keywords to find emails, subjects, or senders</p>
          </div>
        ) : results.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg"></div>
            </div>
            <h3 className="heading-tertiary">No Results Found</h3>
            <p className="text-gray-600 mb-4">
              No emails found for <strong>"{q}"</strong>
            </p>
            <p className="text-sm text-gray-500">Try different keywords or check your spelling</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="heading-secondary">
                Search Results
                <span className="text-sm font-normal text-gray-500 ml-2">({results.length})</span>
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {results.map((e: any) => (
                <div key={e._id} className="group hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 transition-all duration-200">
                  <a
                    href={`/emails/${e._id}`}
                    className="block p-6"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        <div className="w-4 h-4 bg-white rounded"></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {e.subject || "(no subject)"}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="text-emphasis">
                            From: {(e.from || []).join(", ") || "Unknown"}
                          </span>
                          <span className="text-professional">
                            {e.date ? new Date(e.date).toLocaleDateString() : "No date"}
                          </span>
                        </div>
                        
                        {e.text && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {e.text.replace(/<[^>]+>/g, "").slice(0, 150)}...
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sky-500">
                        <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}