import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';

export default function OpportunityForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    type: 'scholarship',
    category: '',
    organization: '',
    description: '',
    eligibility: {
      minEducationLevel: '',
      fieldOfStudy: '',
      countryEligibility: '',
      gender: '',
      other: '',
    },
    country: '',
    applicationUrl: '',
    deadline: '',
    status: 'draft',
    featured: false,
    imageFile: null,        // the actual File object
    imagePreview: null,     // local preview URL
    image: '',              // existing image URL from server
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchOpportunity = async () => {
        try {
          const res = await API.get(`/opportunities/${id}`);
          const opp = res.data.opportunity;
          setForm({
            title: opp.title || '',
            type: opp.type || 'scholarship',
            category: opp.category || '',
            organization: opp.organization || '',
            description: opp.description || '',
            eligibility: {
              minEducationLevel: opp.eligibility?.minEducationLevel || '',
              fieldOfStudy: opp.eligibility?.fieldOfStudy || '',
              countryEligibility: opp.eligibility?.countryEligibility?.join(', ') || '',
              gender: opp.eligibility?.gender || '',
              other: opp.eligibility?.other || '',
            },
            country: opp.country || '',
            applicationUrl: opp.applicationUrl || '',
            deadline: opp.deadline ? opp.deadline.slice(0, 10) : '',
            status: opp.status || 'draft',
            featured: opp.featured || false,
            imageFile: null,
            imagePreview: null,
            image: opp.image || '',
          });
        } catch (err) {
          console.error(err);
          navigate('/admin/opportunities');
        }
      };
      fetchOpportunity();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('eligibility.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        eligibility: { ...prev.eligibility, [field]: value },
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
   
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('type', form.type);
    payload.append('category', form.category);
    payload.append('organization', form.organization);
    payload.append('description', form.description);
    payload.append('country', form.country);
    payload.append('applicationUrl', form.applicationUrl);
    payload.append('deadline', form.deadline);
    payload.append('status', form.status);
    payload.append('featured', form.featured);

    // Eligibility as JSON string
    payload.append('eligibility', JSON.stringify({
      minEducationLevel: form.eligibility.minEducationLevel,
      fieldOfStudy: form.eligibility.fieldOfStudy,
      countryEligibility: form.eligibility.countryEligibility
        ? form.eligibility.countryEligibility.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      gender: form.eligibility.gender,
      other: form.eligibility.other,
    }));

    // Append image file if selected
    if (form.imageFile) {
      payload.append('image', form.imageFile);
    }

    try {
      if (isEditing) {
        await API.put(`/opportunities/${id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await API.post('/opportunities', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/admin/opportunities');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-primary-500 mb-6">
        {isEditing ? 'Edit Opportunity' : 'Create Opportunity'}
      </h1>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="scholarship">Scholarship</option>
              <option value="internship">Internship</option>
              <option value="fellowship">Fellowship</option>
              <option value="grant">Grant</option>
              <option value="competition">Competition</option>
              <option value="research">Research</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <input name="category" value={form.category} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Organization *</label>
            <input name="organization" value={form.organization} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required className="w-full p-2 border rounded" rows={5} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Education Level</label>
            <select name="eligibility.minEducationLevel" value={form.eligibility.minEducationLevel} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Any</option>
              <option value="highschool">High School</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="phd">PhD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Field of Study</label>
            <input name="eligibility.fieldOfStudy" value={form.eligibility.fieldOfStudy} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Eligible Countries (comma separated)</label>
            <input name="eligibility.countryEligibility" value={form.eligibility.countryEligibility} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Ghana, Nigeria" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select name="eligibility.gender" value={form.eligibility.gender} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Additional eligibility requirements</label>
            <textarea
              name="eligibility.other"
              value={form.eligibility.other}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="State any other requirements applicants must meet, such as age, GPA, work experience, or required documents."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input name="country" value={form.country} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Application URL *</label>
            <input name="applicationUrl" type="url" value={form.applicationUrl} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deadline *</label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="h-5 w-5" />
            <label className="text-sm">Featured</label>
          </div>

          {/* Image upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Banner Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setForm(prev => ({
                    ...prev,
                    imageFile: file,
                    imagePreview: URL.createObjectURL(file),
                  }));
                }
              }}
              className="w-full p-2 border rounded"
            />
            {form.imagePreview && (
              <img src={form.imagePreview} alt="New preview" className="mt-2 h-40 rounded object-cover" />
            )}
            {!form.imageFile && form.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Current image:</p>
                <img src={form.image} alt="Current banner" className="h-40 rounded object-cover" />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-green-500 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Opportunity' : 'Create Opportunity'}
        </button>
      </form>
    </div>
  );
}
