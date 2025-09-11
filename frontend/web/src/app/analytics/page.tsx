async function fetchSummary() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${base}/analytics/summary`, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.error('Failed to fetch analytics:', res.status, res.statusText);
      return { byEsp: [], byDomain: [] } as any;
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { byEsp: [], byDomain: [] } as any;
  }
}

function ModernBarChart({ data, labelKey, valueKey, title }: {
  data: any[];
  labelKey: string;
  valueKey: string;
  title: string;
}) {
  const max = data.reduce((m, d) => Math.max(m, d[valueKey] || 0), 0) || 1;
  const total = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded"></div>
        </div>
        <div>
          <h3 className="heading-quaternary">{title}</h3>
          <p className="text-sm text-gray-500">{total} total emails</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-400 rounded-lg"></div>
            <p>No data available</p>
          </div>
        ) : (
          data.map((d, index) => {
            const label = d[labelKey] || 'Unknown';
            const value = d[valueKey] || 0;
            const percentage = Math.round((value / total) * 100);
            const width = Math.max(8, Math.round((value / max) * 100));

            const colors = [
              'from-sky-500 to-blue-600',
              'from-emerald-500 to-teal-600',
              'from-purple-500 to-indigo-600',
              'from-orange-500 to-red-600',
              'from-pink-500 to-rose-600'
            ];

            return (
              <div key={label} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={label}>
                    {label}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">{value}</span>
                    <span className="text-xs text-gray-400">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-700 ease-out group-hover:scale-105`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default async function Analytics() {
  const summary = await fetchSummary();
  const totalEmails = [...summary.byEsp, ...summary.byDomain].reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center float">
            <div className="w-6 h-6 bg-white rounded-lg"></div>
          </div>
          <h1 className="heading-primary">
            Email Analytics
          </h1>
          <p className="subheading">Insights into your email patterns and usage</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalEmails}</div>
            <div className="text-sm text-gray-600">Total Emails</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{summary.byEsp?.length || 0}</div>
            <div className="text-sm text-gray-600">Email Providers</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{summary.byDomain?.length || 0}</div>
            <div className="text-sm text-gray-600">Unique Domains</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernBarChart
            data={summary.byEsp || []}
            labelKey="_id"
            valueKey="count"
            title="By Email Provider"
          />

          <ModernBarChart
            data={summary.byDomain || []}
            labelKey="_id"
            valueKey="count"
            title="By Domain"
          />
        </div>

        {/* Additional Insights */}
        <div className="glass-card p-8">
          <h2 className="heading-secondary">
            Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-100">
              <h3 className="font-semibold text-sky-800 mb-2">Most Active Provider</h3>
              <p className="text-sky-700">
                {summary.byEsp?.[0]?._id || 'No data'}
                {summary.byEsp?.[0]?.count && ` (${summary.byEsp[0].count} emails)`}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-2">Top Domain</h3>
              <p className="text-emerald-700">
                {summary.byDomain?.[0]?._id || 'No data'}
                {summary.byDomain?.[0]?.count && ` (${summary.byDomain[0].count} emails)`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}