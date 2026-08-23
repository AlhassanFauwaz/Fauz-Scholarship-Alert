import { useState, useEffect } from 'react';
import API from '../../services/api';

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [responseText, setResponseText] = useState({});

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;

      const res = await API.get('/admin/feedback', { params });
      setFeedbackList(res.data.feedback);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id) => {
    const response = responseText[id]?.trim();
    if (!response) return alert('Please write a response.');

    try {
      await API.put(`/admin/feedback/${id}`, {
        adminResponse: response,
        status: 'resolved',
      });
      setResponseText(prev => ({ ...prev, [id]: '' }));
      fetchFeedback();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/admin/feedback/${id}`, { status: newStatus });
      fetchFeedback();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFeedback();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-primary-500 mb-6">User Feedback</h1>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-lg shadow">
        <select
          value={filters.category}
          onChange={e => setFilters({ ...filters, category: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          <option value="incorrect-info">Incorrect Information</option>
          <option value="expired-opp">Expired Opportunity</option>
          <option value="technical">Technical Problem</option>
          <option value="suggestion">Suggestion</option>
          <option value="general">General</option>
          <option value="report-opp">Report Opportunity</option>
        </select>
        <select
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
        <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition">
          Filter
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Loading feedback...</p>
      ) : (
        <div className="space-y-4">
          {feedbackList.length === 0 ? (
            <div className="bg-white p-6 rounded-lg border text-center text-gray-500">
              No feedback found.
            </div>
          ) : (
            feedbackList.map(fb => (
              <div key={fb._id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{fb.user?.fullName} ({fb.user?.email})</p>
                    <p className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    fb.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    fb.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {fb.status}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-xs font-medium uppercase text-gray-500">Category: {fb.category}</span>
                </div>
                <p className="text-gray-700 mb-3">{fb.message}</p>

                {fb.adminResponse && (
                  <div className="bg-blue-50 p-3 rounded mb-3">
                    <p className="text-xs font-medium text-blue-800">Admin Response:</p>
                    <p className="text-sm text-blue-700">{fb.adminResponse}</p>
                  </div>
                )}

                {fb.status !== 'resolved' && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a response..."
                      className="flex-1 p-2 border rounded text-sm"
                      value={responseText[fb._id] || ''}
                      onChange={e => setResponseText(prev => ({ ...prev, [fb._id]: e.target.value }))}
                    />
                    <button
                      onClick={() => handleRespond(fb._id)}
                      className="bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Respond
                    </button>
                  </div>
                )}

                <div className="mt-2 flex gap-2">
                  {fb.status !== 'resolved' && fb.status !== 'reviewed' && (
                    <button
                      onClick={() => handleStatusChange(fb._id, 'reviewed')}
                      className="text-xs text-yellow-600 hover:underline"
                    >
                      Mark Reviewed
                    </button>
                  )}
                  {fb.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange(fb._id, 'resolved')}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}