import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit3, Upload, AlertCircle, MapPin } from 'lucide-react';
import { useToast } from '../Context/ToastContext';

const EditComplaint = () => {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'Medium'
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const fallbackCategories = [
    'Road/Pothole',
    'Garbage Collection',
    'Water Leakage',
    'Streetlight Problem',
    'Electricity Issue',
    'Drainage Problem',
    'Other'
  ];

  useEffect(() => {
    const initData = async () => {
      try {
        setFetching(true);
        // Load categories
        const catRes = await axios.get('/api/categories');
        if (catRes.data.success && Array.isArray(catRes.data.categories)) {
          setCategories(catRes.data.categories.map((c) => c.name));
        } else {
          setCategories(fallbackCategories);
        }

        // Load complaint details
        const compRes = await axios.get(`/api/complaints/${id}`);
        if (compRes.data.success) {
          const c = compRes.data.complaint;
          if (c.status !== 'Pending') {
            setError('Only pending complaints can be modified before departmental allocation.');
          }
          setFormData({
            title: c.title,
            description: c.description,
            category: c.category,
            location: c.location,
            priority: c.priority
          });
          if (c.image) {
            setImagePreview(c.image);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch complaint details.');
        toast.error('Could not load complaint');
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { title, description, category, location } = formData;
    if (!title.trim() || !description.trim() || !category || !location.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);

    const submissionData = new FormData();
    submissionData.append('title', title.trim());
    submissionData.append('description', description.trim());
    submissionData.append('category', category);
    submissionData.append('location', location.trim());
    submissionData.append('priority', formData.priority);
    if (image) {
      submissionData.append('image', image);
    }

    try {
      const res = await axios.put(`/api/complaints/${id}`, submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success('Complaint updated successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update complaint.');
      toast.error('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="text-slate-600 text-xs font-medium">Loading grievance data...</span>
      </div>
    );
  }

  const isLocked = Boolean(error && error.includes('Only pending'));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
            <Edit3 className="h-3.5 w-3.5" />
            <span>Grievance Modification Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Edit Pending Grievance
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            You may adjust information while the status is Pending Review before it is assigned to an inspection officer.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-start space-x-3 text-xs text-rose-800">
              <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Notice</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Grievance Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                disabled={isLocked}
                value={formData.title}
                onChange={handleChange}
                className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-600">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  disabled={isLocked}
                  value={formData.category}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans disabled:opacity-60"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Urgency Rating
                </label>
                <select
                  id="priority"
                  name="priority"
                  disabled={isLocked}
                  value={formData.priority}
                  onChange={handleChange}
                  className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans disabled:opacity-60"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location / Landmark Address <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  disabled={isLocked}
                  value={formData.location}
                  onChange={handleChange}
                  className="pl-9 pr-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows="4"
                disabled={isLocked}
                value={formData.description}
                onChange={handleChange}
                className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans disabled:opacity-60"
              ></textarea>
            </div>

            {/* Photographic Evidence */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Attached Photographic Evidence
              </label>

              {!isLocked && (
                <div className="flex justify-center px-6 pt-4 pb-5 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-7 w-7 text-slate-400" />
                    <div className="flex text-xs text-slate-600 justify-center">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded font-bold text-blue-900 hover:text-blue-950 px-1.5 py-0.5 border border-slate-200"
                      >
                        <span>Replace File</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          accept="image/*"
                          disabled={isLocked}
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <span className="pl-1 text-slate-500 self-center">PNG, JPG up to 5MB</span>
                    </div>
                  </div>
                </div>
              )}

              {imagePreview && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <img
                    src={imagePreview}
                    alt="Current Photograph"
                    className="h-16 w-16 object-cover rounded border border-slate-200"
                  />
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 rounded border border-rose-200 cursor-pointer font-medium"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200 flex justify-end space-x-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComplaint;
