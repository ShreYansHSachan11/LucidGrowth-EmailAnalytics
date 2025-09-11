import Time from "../../components/Time";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

async function fetchEmail(id: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${base}/emails/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error("Failed to fetch email:", res.status, res.statusText);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching email:", error);
    return null;
  }
}

export default async function EmailDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const email = await fetchEmail(p.id);
  if (!email)
    return <div className="text-center text-gray-500 mt-10">Not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Subject + ESP */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          {email.subject || "(no subject)"}
        </h2>
        {email.analytics?.esp && (
          <Badge variant="outline">{email.analytics.esp}</Badge>
        )}
      </div>

      {/* Meta Info */}
      <Card>
        <CardContent className="p-4 text-sm text-gray-700 space-y-1">
          <div>
            <span className="font-medium">From:</span>{" "}
            {(email.from || []).join(", ")}
          </div>
          <div>
            <span className="font-medium">To:</span>{" "}
            {(email.to || []).join(", ")}
          </div>
          <div>
            <span className="font-medium">Date:</span>{" "}
            <Time value={email.date} />
          </div>
        </CardContent>
      </Card>

      {/* Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Flags</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Badge variant={email.flags?.seen ? "secondary" : "outline"}>
            Read
          </Badge>
          <Badge variant={email.flags?.answered ? "secondary" : "outline"}>
            Answered
          </Badge>
          <Badge
            variant={email.flags?.flagged ? "destructive" : "outline"}
            className={email.flags?.flagged ? "bg-yellow-100 text-yellow-800" : ""}
          >
            Flagged
          </Badge>
          <Badge
            variant={email.flags?.deleted ? "destructive" : "outline"}
            className={email.flags?.deleted ? "bg-red-100 text-red-800" : ""}
          >
            Deleted
          </Badge>
          <Badge
            variant={email.flags?.draft ? "secondary" : "outline"}
            className={email.flags?.draft ? "bg-indigo-100 text-indigo-800" : ""}
          >
            Draft
          </Badge>
        </CardContent>
      </Card>

      {/* Analytics */}
      {email.analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-medium">ESP</p>
              <p>{email.analytics.esp || "Unknown"}</p>
            </div>
            <div>
              <p className="font-medium">Domain</p>
              <p>{email.analytics.sendingDomain || ""}</p>
            </div>
            <div>
              <p className="font-medium">Server</p>
              <p>{email.analytics.sendingServer || ""}</p>
            </div>
            <div>
              <p className="font-medium">Latency</p>
              <p>
                {typeof email.analytics.sentToReceivedDeltaMs === "number"
                  ? `${email.analytics.sentToReceivedDeltaMs} ms`
                  : ""}
              </p>
            </div>
            <div>
              <p className="font-medium">TLS</p>
              <p>{email.analytics.tlsSupported ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="font-medium">Valid Cert</p>
              <p>{email.analytics.tlsValidCert ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="font-medium">Open Relay</p>
              <p>{email.analytics.openRelay ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Headers */}
      {email.headers && (
        <Card>
          <CardHeader>
            <CardTitle>Headers</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-xs overflow-auto border">
              {JSON.stringify(email.headers, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Text & HTML */}
      <Card>
        <CardHeader>
          <CardTitle>Body</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="w-full">
            <TabsList>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <pre className="whitespace-pre-wrap text-sm">
                {email.text || ""}
              </pre>
            </TabsContent>
            <TabsContent value="html">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: email.html || "" }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
