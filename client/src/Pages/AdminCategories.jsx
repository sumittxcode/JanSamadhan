import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Landmark, Plus, Trash2, Edit2, X, AlertCircle, Search, Check, FolderKanban } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AdminCategories = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
      toast.error('Failed to load categories catalog.');
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

    if (!catName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditing) {
        const res = await axios.put(`/api/admin/categories/${selectedCatId}`, {
          name: catName.trim(),
          description: catDesc.trim()
        });
        if (res.data.success) {
          toast.success(`Category "${catName}" updated.`);
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await axios.post('/api/admin/categories', {
          name: catName.trim(),
          description: catDesc.trim()
        });
        if (res.data.success) {
          toast.success(`Category "${catName}" created.`);
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to process request.');
      toast.error('Action could not be completed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, nameStr) => {
    if (window.confirm(`Are you sure you want to delete category "${nameStr}"?`)) {
      try {
        const res = await axios.delete(`/api/admin/categories/${id}`);
        if (res.data.success) {
          toast.info(`Category "${nameStr}" deleted.`);
          fetchCategories();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(c =>
      c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Taxonomy Configuration
            </span>
            <span className="text-xs text-slate-400">| Grievance Routing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Grievance Categories & Routing Tags
          </h1>
          <p className="text-sm text-slate-500">
            Define civic complaint categories that citizens select when filing issues and departments map to.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search categories by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center space-x-2">
          <FolderKanban className="h-4 w-4 text-slate-400" />
          <span>{filteredCategories.length} Categories Configured</span>
        </div>
      </div>

      {/* Grid List of Categories */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-600 text-sm font-medium">Fetching category taxonomies...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-3">
          <Landmark className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Categories Found</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            {search ? 'No categories matched your search term.' : 'Click "Add New Category" to define your first complaint tag.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <div className="bg-blue-50 text-blue-800 font-bold border border-blue-100 px-2.5 py-1 rounded-lg inline-flex items-center space-x-1.5 text-xs">
                    <Landmark className="h-3.5 w-3.5 text-blue-600" />
                    <span>{c.name}</span>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed min-h-[40px]">
                  {c.description || 'No description specified for this civic category.'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end space-x-2 text-slate-500 text-xs">
                <button
                  onClick={() => handleOpenEditModal(c)}
                  className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center space-x-1 font-medium"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(c._id, c.name)}
                  className="px-2.5 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center space-x-1 font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <h3 className="font-bold text-base">
                {isEditing ? 'Edit Grievance Category' : 'Register New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-800 font-medium">{formError}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  placeholder="e.g. Water Contamination / Supply"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scope & Description
                </label>
                <textarea
                  rows="3"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  placeholder="Describe the issues that citizens should submit under this category tag..."
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-colors disabled:opacity-60"
                >
                  {formLoading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
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
