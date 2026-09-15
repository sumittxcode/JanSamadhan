import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShieldAlert, Image, Upload, AlertCircle, Sparkles, Check, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const SubmitComplaint = () => {
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
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // Default fallback categories
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
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        if (res.data.success) {
          setCategories(res.data.categories.map((c) => c.name));
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.error('Error fetching categories, using fallback list:', err);
        setCategories(fallbackCategories);
      }
    };
    fetchCategories();
  }, []);

  // AI-Based Real-Time Categorization & Priority Estimation (PPT Slide 3 & 7)
  useEffect(() => {
    const text = `${formData.title} ${formData.description}`.toLowerCase();
    if (text.trim().length < 4) {
      setAiSuggestion(null);
      return;
    }

    let detectedCat = null;
    let detectedPriority = null;

    // Pattern matching rules
    if (/pothole|road|asphalt|tar|speed breaker|crater|pavement|highway/.test(text)) {
      detectedCat = 'Road/Pothole';
    } else if (/garbage|trash|waste|dustbin|dump|litter|smell|filth|sanitation/.test(text)) {
      detectedCat = 'Garbage Collection';
    } else if (/water|leak|pipeline|pipe|contamination|supply|drinking water|no water|tap/.test(text)) {
      detectedCat = 'Water Leakage';
    } else if (/streetlight|street light|dark|lamp|pole|light pole|night lamp/.test(text)) {
      detectedCat = 'Streetlight Problem';
    } else if (/electric|electricity|power|transformer|wire|voltage|blackout|short circuit|shock/.test(text)) {
      detectedCat = 'Electricity Issue';
    } else if (/drain|drainage|sewer|sewage|overflow|gutter|waterlogging|stagnant/.test(text)) {
      detectedCat = 'Drainage Problem';
    }

    // Priority inference
    if (/urgent|danger|emergency|hazard|fire|burst|accident|spark|open wire|flooding/.test(text)) {
      detectedPriority = 'High';
    }

    if (detectedCat) {
      setAiSuggestion({
        category: detectedCat,
        priority: detectedPriority || 'Medium'
      });

      // Auto-set category if citizen hasn't manually chosen yet
      if (!formData.category) {
        setFormData((prev) => ({
          ...prev,
          category: detectedCat,
          priority: detectedPriority || prev.priority
        }));
      }
    } else {
      setAiSuggestion(null);
    }
  }, [formData.title, formData.description]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData((prev) => ({
        ...prev,
        category: aiSuggestion.category,
        priority: aiSuggestion.priority
      }));
      toast.info(`Applied AI routing: ${aiSuggestion.category}`);
    }
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
      const res = await axios.post('/api/complaints', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        toast.success(`Complaint filed successfully! Tracking ID: ${res.data.complaint.complaintId}`);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please check fields.');
      toast.error('Submission failed.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="gov-header-bg p-6 text-white select-none">
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Digital Grievance Lodgement Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Register Civic Grievance</h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Complaints are automatically routed to the relevant municipal department officer for resolution.
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
                Grievance Title / Short Subject <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                placeholder="e.g. Deep Potholes on Krishna Nagar Main Road"
              />
            </div>

            {/* Category Dropdown with AI badge */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category <span className="text-rose-500">*</span>
                </label>
                {aiSuggestion && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                    <Sparkles className="h-2.5 w-2.5 text-blue-600" />
                    <span>Auto-classified</span>
                  </span>
                )}
              </div>
              <select
                id="category"
                name="category"
                required
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
                Estimated Urgency
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
              >
                <option value="Low">Low (Routine maintenance)</option>
                <option value="Medium">Medium (Standard SLA)</option>
                <option value="High">High (Dangerous / Emergency)</option>
              </select>
            </div>

            {/* AI Suggestion Banner if detected */}
            {aiSuggestion && formData.category !== aiSuggestion.category && (
              <div className="md:col-span-2 bg-blue-50/70 border border-blue-200 p-3 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-blue-900">
                  <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Smart Categorizer detected: <strong>{aiSuggestion.category}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyAiSuggestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1 rounded text-xs transition-colors"
                >
                  Apply Suggestion
                </button>
              </div>
            )}

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
                value={formData.location}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                placeholder="e.g. Near Krishna Nagar Metro Gate No. 2, East Delhi"
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
                value={formData.description}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                placeholder="Provide specific details about the issue (duration, hazard severity, landmarks) to help department officers resolve it swiftly."
              ></textarea>
            </div>

            {/* Supporting Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Photographic Evidence (Optional)
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
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or browse from device</p>
                  </div>
                  <p className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Selected Photographic Evidence
                </label>
                <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden p-1 bg-white shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 max-w-full rounded object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 text-xs shadow transition-colors"
                  >
                    Remove
                  </button>
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
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition-colors disabled:opacity-60 flex items-center space-x-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Submit Grievance</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
