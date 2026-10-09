import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShieldAlert, Image, Upload, AlertCircle, Sparkles, Check, BrainCircuit, X, Info } from 'lucide-react';
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

  // AI Categorization State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState('');
  const [aiApplied, setAiApplied] = useState(false);

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

  // Helper to robustly match suggested category against database category list
  const resolveCategoryMatch = (suggestedCat, availableCats) => {
    if (!suggestedCat || !availableCats || availableCats.length === 0) return '';
    const suggestedLower = suggestedCat.toLowerCase().trim();

    // 1. Direct exact or case-insensitive match
    const exactMatch = availableCats.find(c => c.toLowerCase() === suggestedLower);
    if (exactMatch) return exactMatch;

    // 2. Substring or alias rule match
    const aliasRules = [
      { category: 'Road/Pothole', terms: ['road', 'pothole', 'street damage', 'asphalt', 'tar', 'highway', 'divider'] },
      { category: 'Garbage Collection', terms: ['garbage', 'trash', 'waste', 'dump', 'litter', 'cleaning', 'dustbin', 'rubbish'] },
      { category: 'Water Leakage', terms: ['water', 'leak', 'pipe', 'supply', 'tap', 'pipeline'] },
      { category: 'Streetlight Problem', terms: ['streetlight', 'street light', 'lamp', 'pole light', 'dark street', 'illumination'] },
      { category: 'Electricity Issue', terms: ['electricity', 'wire', 'power', 'transformer', 'voltage', 'blackout', 'short circuit'] },
      { category: 'Drainage Problem', terms: ['drain', 'drainage', 'gutter', 'sewer', 'sewage', 'clogged', 'flooding'] },
      { category: 'Other', terms: ['other', 'general', 'miscellaneous'] }
    ];

    for (const rule of aliasRules) {
      if (rule.terms.some(t => suggestedLower.includes(t))) {
        const catMatch = availableCats.find(c => c.toLowerCase() === rule.category.toLowerCase());
        if (catMatch) return catMatch;
      }
    }

    // 3. Fallback partial string inclusion
    const partialMatch = availableCats.find(c =>
      c.toLowerCase().includes(suggestedLower) || suggestedLower.includes(c.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    return '';
  };

  const handleAiCategorize = async () => {
    if (!formData.title.trim()) {
      setAiError('Please enter a complaint title before requesting AI analysis.');
      return;
    }
    setAiError('');
    setAiLoading(true);
    setAiApplied(false);
    try {
      const res = await axios.post('/api/complaints/ai-categorize', {
        title: formData.title,
        description: formData.description
      });
      if (res.data.success && res.data.suggestion) {
        const suggestion = res.data.suggestion;
        setAiSuggestion(suggestion);

        // Automatically select the matching valid category in the dropdown state
        const matchedCategory = resolveCategoryMatch(suggestion.category, categories);
        if (matchedCategory) {
          setFormData(prev => ({
            ...prev,
            category: matchedCategory,
            priority: ['Low', 'Medium', 'High'].includes(suggestion.priority) ? suggestion.priority : prev.priority
          }));
          setAiApplied(true);
        }
      } else {
        setAiError('AI suggestions unavailable. Please select category manually.');
      }
    } catch (err) {
      console.warn('AI categorization request failed:', err);
      setAiError(err.response?.data?.message || 'AI categorization service unavailable. Please select manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    const matchedCategory = resolveCategoryMatch(aiSuggestion.category, categories) || aiSuggestion.category;
    setFormData(prev => ({
      ...prev,
      category: matchedCategory || prev.category,
      priority: ['Low', 'Medium', 'High'].includes(aiSuggestion.priority) ? aiSuggestion.priority : prev.priority
    }));
    setAiApplied(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { title, description, category, location } = formData;
    if (!title || !description || !category || !location) {
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
        if (toast?.success) {
          toast.success(`Complaint filed successfully! Tracking ID: ${res.data.complaint.complaintId}`);
        }
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please check fields.');
      if (toast?.error) {
        toast.error('Submission failed.');
      }
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
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center space-x-3 select-none">
          <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0" />
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <Sparkles className="h-4 w-4" />
              <span>Digital Grievance Lodgement Desk</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Register Civic Grievance</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Complaints are automatically routed to the relevant municipal department officer for resolution.
            </p>
          </div>
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
            {/* Grievance Title */}
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
                placeholder="Describe the complaint in detail. Provide context to help officers solve it quickly."
              ></textarea>
            </div>

            {/* AI Assistant Feature Banner / Box */}
            <div className="md:col-span-2 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 p-4 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      AI Categorization Assistant
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Automated Grievance AI
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Need help choosing? Our Civic AI analyzes your grievance details to recommend the matching department, category, and priority level.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAiCategorize}
                  disabled={aiLoading}
                  className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>✨ Suggest with AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Error Alert if any */}
              {aiError && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
                  <span>{aiError}</span>
                  <button type="button" onClick={() => setAiError('')} className="text-amber-600 hover:text-amber-800">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* AI Suggestions Review Card */}
              {aiSuggestion && (
                <div className="mt-4 bg-white border border-indigo-200 rounded-xl p-4 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">AI Redressal Recommendations</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      aiSuggestion.isFallback
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {aiSuggestion.provider || (aiSuggestion.isFallback ? 'Keyword Engine (Fallback)' : 'Live AI')} ({aiSuggestion.confidence}% Match)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Suggested Category</div>
                      <div className="text-slate-800 font-bold mt-0.5">{aiSuggestion.category}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Responsible Department</div>
                      <div className="text-slate-800 font-bold mt-0.5">{aiSuggestion.department}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Recommended Priority</div>
                      <div className={`font-bold mt-0.5 ${
                        aiSuggestion.priority === 'High' ? 'text-red-600' :
                        aiSuggestion.priority === 'Medium' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {aiSuggestion.priority} Priority
                      </div>
                    </div>
                  </div>

                  {aiSuggestion.reasoning && (
                    <p className="text-[11px] text-slate-500 italic mb-3">
                      Note: {aiSuggestion.reasoning}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      Review suggestions before applying. You can modify any selection below.
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setAiSuggestion(null)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={applyAiSuggestion}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                          aiApplied
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{aiApplied ? 'Applied to Form ✓' : 'Apply Suggestion'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Dropdown */}
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
