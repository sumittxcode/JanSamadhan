import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Upload, 
  AlertCircle, 
  Sparkles, 
  Check, 
  BrainCircuit, 
  X, 
  MapPin
} from 'lucide-react';
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
        if (res.data.success && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          setCategories(res.data.categories.map((c) => c.name));
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.warn('Error fetching categories, using fallback list:', err);
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

  // Robust category matching
  const resolveCategoryMatch = (suggestedCat, availableCats) => {
    if (!suggestedCat || !availableCats || availableCats.length === 0) return '';
    const suggestedLower = suggestedCat.toLowerCase().trim();

    const exactMatch = availableCats.find(c => c.toLowerCase() === suggestedLower);
    if (exactMatch) return exactMatch;

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
      setAiError(err.response?.data?.message || 'AI categorization service unavailable. Please select category manually.');
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
    if (!title.trim() || !description.trim() || !category || !location.trim()) {
      setError('Please fill in all mandatory fields (marked with *).');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>

      {/* Main Form Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
            <span>Official Grievance Registration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Register Civic Grievance
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Provide precise details regarding the civic issue. Once submitted, your grievance will be routed to the designated municipal department for inspection and resolution under standard SLA.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-start space-x-3 text-xs text-rose-800">
              <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Submission Error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Section 1: Overview */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              1. Issue Overview
            </h2>

            <div>
              <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Grievance Title / Brief Subject <span className="text-rose-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
                placeholder="e.g. Deep potholes and road depression near Metro Station Gate 2"
              />
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
                value={formData.description}
                onChange={handleChange}
                className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans leading-relaxed"
                placeholder="Describe the problem, severity, duration, and any public safety hazards in detail..."
              ></textarea>
            </div>
          </div>

          {/* Section 2: AI Categorization Assistant */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-900 text-white shrink-0 shadow-xs">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    AI Category Recommendation Assistant
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Analyzes your grievance title and description to suggest the responsible department and urgency rating.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={aiLoading}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                    <span>Analyze with AI</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
                <span>{aiError}</span>
                <button type="button" onClick={() => setAiError('')} className="text-amber-700 hover:text-amber-900">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {aiSuggestion && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800">
                    AI Classification Analysis
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    aiSuggestion.isFallback
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {aiSuggestion.provider || (aiSuggestion.isFallback ? 'Keyword Engine (Fallback)' : 'Civic AI')} ({aiSuggestion.confidence}% Match)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Suggested Category</span>
                    <span className="text-slate-900 font-bold">{aiSuggestion.category}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Department</span>
                    <span className="text-slate-900 font-bold">{aiSuggestion.department}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Recommended Priority</span>
                    <span className={`font-bold ${
                      aiSuggestion.priority === 'High' ? 'text-rose-600' :
                      aiSuggestion.priority === 'Medium' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      {aiSuggestion.priority} Priority
                    </span>
                  </div>
                </div>

                {aiSuggestion.reasoning && (
                  <p className="text-[11px] text-slate-500 italic">
                    Reasoning: {aiSuggestion.reasoning}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    You can inspect and customize selections below.
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
                      className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        aiApplied
                          ? 'bg-emerald-700 text-white'
                          : 'bg-blue-900 hover:bg-blue-800 text-white'
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

          {/* Section 3: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department / Category <span className="text-rose-600">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans cursor-pointer"
              >
                <option value="">-- Select Grievance Category --</option>
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
                value={formData.priority}
                onChange={handleChange}
                className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans cursor-pointer"
              >
                <option value="Low">Low (Routine maintenance)</option>
                <option value="Medium">Medium (Standard SLA)</option>
                <option value="High">High (Immediate hazard / Public risk)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Location */}
          <div>
            <label htmlFor="location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Location / Landmark Address <span className="text-rose-600">*</span>
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
                value={formData.location}
                onChange={handleChange}
                className="pl-9 pr-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
                placeholder="e.g. In front of Community Hall, Sector 4 Main Market, Ward 12"
              />
            </div>
          </div>

          {/* Section 5: Photographic Evidence */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Photographic Evidence (Optional)
              </label>
              <p className="text-[11px] text-slate-500">
                Attaching a clear photograph helps municipal officers verify the location and equipment required.
              </p>
            </div>

            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-colors">
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                <div className="flex text-xs text-slate-600 justify-center">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded font-bold text-blue-900 hover:text-blue-950 px-1.5 py-0.5 border border-slate-200"
                  >
                    <span>Browse File</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <span className="pl-1 text-slate-500 self-center">from your device</span>
                </div>
                <p className="text-[11px] text-slate-400">PNG, JPG, JPEG, WEBP up to 5MB</p>
              </div>
            </div>

            {/* Selected Image Preview */}
            {imagePreview && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={imagePreview}
                    alt="Uploaded Evidence Preview"
                    className="h-16 w-16 object-cover rounded border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Attached Photograph</span>
                    <span className="text-[11px] text-slate-500">Ready for submission</span>
                  </div>
                </div>
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
              </div>
            )}
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
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-60 flex items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Grievance...</span>
                </>
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
