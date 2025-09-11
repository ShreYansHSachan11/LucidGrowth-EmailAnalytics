import RowActions from "../components/RowActions";
import Time from "../components/Time";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

async function fetchEmailsByFolder(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const u = new URL(`${base}/emails/folder`);
  u.searchParams.set("path", path);
  const res = await fetch(u.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return [] as any[];
  return res.json();
}

export default async function FolderPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const params = await searchParams;
  const path = params?.path || "";
  const emails = path ? await fetchEmailsByFolder(path) : [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="m-0 text-xl font-semibold">
          Folder: {path || "(none)"}
        </h2>
        <a href="/" className="text-xs text-blue-600 hover:underline">
          Back to Recent
        </a>
      </div>

      {emails.length === 0 ? (
        <Card className="p-6 text-center text-gray-600 shadow-sm">
          <CardContent>No emails found in this folder.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2 max-w-[1000px]">
          {emails.map((e: any) => {
            const sender = (e.from || [])[0] || "";
            const subject = e.subject || "(no subject)";
            const snippet = (e.text || e.html || "")
              .toString()
              .replace(/<[^>]+>/g, "")
              .slice(0, 90);
            const unread = !(e.flags?.seen);

            return (
              <Card
                key={e._id}
                className={`hover:bg-blue-50 transition border ${
                  unread ? "border-blue-300 shadow-sm" : "border-gray-200"
                }`}
              >
                <a
                  href={`/emails/${e._id}`}
                  className="grid grid-cols-[220px_1fr_160px] items-center gap-3 px-3 py-2.5"
                >
                  <div className="truncate font-medium text-gray-900">
                    {sender}
                  </div>
                  <div className="truncate text-gray-900">
                    <span className={unread ? "font-semibold" : ""}>
                      {subject}
                    </span>{" "}
                    <span className="text-gray-500">- {snippet}</span>
                  </div>
                  <div className="flex items-center justify-end text-gray-700 text-xs">
                    <Time value={e.date} />
                    <span className="ml-2">
                      <RowActions
                        id={e._id}
                        seen={e.flags?.seen}
                        flagged={e.flags?.flagged}
                      />
                    </span>
                  </div>
                </a>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
