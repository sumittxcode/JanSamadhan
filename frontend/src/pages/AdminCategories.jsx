import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, Plus, Trash2, Edit2, X, AlertCircle } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedCatId(null);
    setCatName('');
    setCatDesc('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setIsEditing(true);
    setSelectedCatId(c._id);
    setCatName(c.name);
    setCatDesc(c.description || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!catName) {
      setFormError('Category name is required.');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditing) {
        // Edit Category
        const res = await axios.put(`/api/admin/categories/${selectedCatId}`, {
          name: catName,
          description: catDesc
        });
        if (res.data.success) {
          alert('Category updated.');
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        // Create Category
        const res = await axios.post('/api/admin/categories', {
          name: catName,
          description: catDesc
        });
        if (res.data.success) {
          alert('Category created.');
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to process request.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, nameStr) => {
    if (window.confirm(`Are you sure you want to delete category "${nameStr}"?`)) {
      try {
        const res = await axios.delete(`/api/admin/categories/${id}`);
        if (res.data.success) {
          alert('Category deleted successfully.');
          fetchCategories();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Complaint Categories</h1>
          <p className="text-sm text-slate-500 font-sans">Manage grievance classification tags for citizen filing menus.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-emerald-650 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md flex items-center space-x-1.5 transition-colors font-sans"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Grid List of Categories */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-550 text-sm font-medium font-sans">Fetching catalog taxonomy...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/60 rounded-xl space-y-3">
          <Landmark className="h-12 w-12 text-slate-350 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 font-sans">No Categories Found</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto font-sans">
            Seed default taxonomies in database or add standard categories to begin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow font-sans"
            >
              <div className="space-y-2">
                <div className="bg-slate-50 p-2.5 rounded-lg text-slate-700 font-bold border border-slate-200/40 inline-flex items-center space-x-1.5 leading-none">
                  <Landmark className="h-4.5 w-4.5 text-blue-600" />
                  <span className="text-xs">{c.name}</span>
                </div>
                <p className="text-slate-650 text-xs leading-relaxed pt-2">
                  {c.description || 'No description specified for this category.'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end space-x-3 text-slate-500 text-xs select-none">
                <button
                  onClick={() => handleOpenEditModal(c)}
                  className="p-1 text-slate-450 hover:text-blue-650 rounded hover:bg-slate-50 transition-colors"
                  title="Edit Category Details"
                >
                  <Edit2 className="h-4.5 w-4.5" />
                </button>
                
                {/* Disable deleting Default "Other" Category for structural safety */}
                {c.name !== 'Other' && (
                  <button
                    onClick={() => handleDelete(c._id, c.name)}
                    className="p-1 text-slate-450 hover:text-red-600 rounded hover:bg-slate-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal CRUD Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <h3 className="font-bold text-base">{isEditing ? 'Modify Category' : 'Register New Category'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-2.5">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-750 font-medium">{formError}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="catName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="catName"
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  placeholder="e.g. Water Contamination"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="catDesc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  id="catDesc"
                  rows="3"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  placeholder="Describe what kind of civic issues fall under this tag."
                ></textarea>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                  {formLoading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;
