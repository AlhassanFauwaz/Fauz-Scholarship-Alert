import { useState, useEffect } from 'react';
import API from '../../services/api';

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: '',
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;

      const res = await API.get('/admin/reports', { params });
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleExportCSV = () => {
    // Simple JSON to CSV (optional, we can implement later)
    alert('CSV export can be added later.');
  };

  if (loading) return <div className="text-center p-8">Loading reports...</div>;
  if (!reports) return <div className="text-center p-8 text-red-500">Failed to load reports.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-primary-500 mb-6">Reports & Analytics</h1>

      {/* Filters */}
      <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} className="border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} className="border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="border rounded p-2">
            <option value="">All</option>
            <option value="scholarship">Scholarship</option>
            <option value="internship">Internship</option>
            <option value="fellowship">Fellowship</option>
            <option value="grant">Grant</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input type="text" placeholder="e.g. STEM" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="border rounded p-2" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition">Apply</button>
          <button type="button" onClick={handleExportCSV} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition">Export CSV</button>
        </div>
      </form>

      {/* User Reports */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">User Reports</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded"><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold">{reports.userReports.totalUsers}</p></div>
          <div className="bg-green-50 p-4 rounded"><p className="text-sm text-gray-500">Verified</p><p className="text-2xl font-bold">{reports.userReports.verifiedUsers}</p></div>
          <div className="bg-yellow-50 p-4 rounded"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold">{reports.userReports.activeUsers}</p></div>
          <div className="bg-red-50 p-4 rounded"><p className="text-sm text-gray-500">Suspended</p><p className="text-2xl font-bold">{reports.userReports.suspendedUsers}</p></div>
        </div>
      </div>

      {/* Opportunity Reports */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Opportunity Reports</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{reports.opportunityReports.totalOpportunities}</p></div>
          <div className="bg-green-50 p-4 rounded"><p className="text-sm text-gray-500">Published</p><p className="text-2xl font-bold">{reports.opportunityReports.publishedOpps}</p></div>
          <div className="bg-yellow-50 p-4 rounded"><p className="text-sm text-gray-500">Draft</p><p className="text-2xl font-bold">{reports.opportunityReports.draftOpps}</p></div>
          <div className="bg-red-50 p-4 rounded"><p className="text-sm text-gray-500">Expired</p><p className="text-2xl font-bold">{reports.opportunityReports.expiredOpps}</p></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">By Type</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-1">Type</th><th className="text-right p-1">Count</th></tr></thead>
              <tbody>
                {reports.opportunityReports.byType.map((item, i) => (
                  <tr key={i} className="border-b"><td className="p-1 capitalize">{item._id || 'N/A'}</td><td className="text-right p-1">{item.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-medium mb-2">By Country</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-1">Country</th><th className="text-right p-1">Count</th></tr></thead>
              <tbody>
                {reports.opportunityReports.byCountry.map((item, i) => (
                  <tr key={i} className="border-b"><td className="p-1">{item._id || 'N/A'}</td><td className="text-right p-1">{item.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notification Reports */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Notification Reports</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{reports.notificationReports.totalNotifications}</p></div>
          <div className="bg-green-50 p-4 rounded"><p className="text-sm text-gray-500">Email</p><p className="text-2xl font-bold">{reports.notificationReports.emailNotifications}</p></div>
          <div className="bg-purple-50 p-4 rounded"><p className="text-sm text-gray-500">In-App</p><p className="text-2xl font-bold">{reports.notificationReports.inAppNotifications}</p></div>
          <div className="bg-yellow-50 p-4 rounded"><p className="text-sm text-gray-500">SMS</p><p className="text-2xl font-bold">{reports.notificationReports.smsNotifications}</p></div>
          <div className="bg-green-100 p-4 rounded"><p className="text-sm text-gray-500">Delivered</p><p className="text-2xl font-bold">{reports.notificationReports.deliveredNotifications}</p></div>
          <div className="bg-red-100 p-4 rounded"><p className="text-sm text-gray-500">Failed</p><p className="text-2xl font-bold">{reports.notificationReports.failedNotifications}</p></div>
        </div>
      </div>

      {/* Engagement Reports */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Saved Opportunities</h2>
        {reports.engagementReports.mostSaved.length === 0 ? (
          <p className="text-gray-500">No saved data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left p-2">Opportunity</th><th className="text-right p-2">Saves</th></tr></thead>
            <tbody>
              {reports.engagementReports.mostSaved.map((item, i) => (
                <tr key={i} className="border-b"><td className="p-2">{item.title}</td><td className="text-right p-2">{item.count}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}