import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit3, Image, Upload, AlertCircle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
        if (catRes.data.success) {
          setCategories(catRes.data.categories.map((c) => c.name));
        } else {
          setCategories(fallbackCategories);
        }

        // Load complaint details
        const compRes = await axios.get(`/api/complaints/${id}`);
        if (compRes.data.success) {
          const c = compRes.data.complaint;
          if (c.status !== 'Pending') {
            setError('Only pending complaints can be edited before assignment.');
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
      setError('Please fill in all required fields.');
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="text-slate-500 text-sm font-medium">Loading grievance data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-slate-700 font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="gov-header-bg p-6 text-white select-none">
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Edit3 className="h-4 w-4" />
            <span>Grievance Modification</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Edit Pending Grievance</h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            You can modify the complaint details, description, and attached photo while status is still Pending.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-800 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Grievance Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                disabled={error.includes('Only pending')}
                value={formData.title}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                disabled={error.includes('Only pending')}
                value={formData.category}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Priority */}
            <div>
              <label htmlFor="priority" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency Level
              </label>
              <select
                id="priority"
                name="priority"
                disabled={error.includes('Only pending')}
                value={formData.priority}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Location Address */}
            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Precise Location / Landmark <span className="text-rose-500">*</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                disabled={error.includes('Only pending')}
                value={formData.location}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              />
            </div>

            {/* Detailed Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows="4"
                disabled={error.includes('Only pending')}
                value={formData.description}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              ></textarea>
            </div>

            {/* Supporting Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Upload New Image (Optional, replaces existing)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all">
                <div className="space-y-1.5 text-center">
                  <Upload className="mx-auto h-9 w-9 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-semibold text-blue-600 hover:text-blue-500 px-1"
                    >
                      <span>Choose file</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/*"
                        disabled={error.includes('Only pending')}
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or browse</p>
                  </div>
                  <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Supporting Photograph
                </label>
                <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden p-1 bg-white shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 max-w-full rounded object-contain"
                  />
                  {!error.includes('Only pending') && (
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 text-xs shadow transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || error.includes('Only pending')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComplaint;
