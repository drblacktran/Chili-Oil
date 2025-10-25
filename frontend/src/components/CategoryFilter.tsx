/**
 * Category Filter Component
 * Search and filter interface for products
 */
import React, { useState } from 'react';
import type { ProductCategoryInfo } from '../types/product';

interface CategoryFilterProps {
  categories: ProductCategoryInfo[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterProducts(term, selectedCategory, selectedStatus);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    filterProducts(searchTerm, category, selectedStatus);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setSelectedStatus(status);
    filterProducts(searchTerm, selectedCategory, status);
  };

  const filterProducts = (search: string, category: string, status: string) => {
    const products = document.querySelectorAll('[data-product-category]');
    let visibleCount = 0;

    products.forEach((product) => {
      const productElement = product as HTMLElement;
      const productCategory = productElement.getAttribute('data-product-category') || '';
      const productName = productElement.textContent?.toLowerCase() || '';

      // Check search term
      const matchesSearch = search === '' || productName.includes(search.toLowerCase());

      // Check category filter
      const matchesCategory = category === 'all' || productCategory === category;

      // Show/hide based on filters
      if (matchesSearch && matchesCategory) {
        productElement.style.display = '';
        visibleCount++;
      } else {
        productElement.style.display = 'none';
      }
    });

    // Show/hide empty state
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');

    if (visibleCount === 0) {
      productsGrid?.classList.add('hidden');
      emptyState?.classList.remove('hidden');
    } else {
      productsGrid?.classList.remove('hidden');
      emptyState?.classList.add('hidden');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    filterProducts('', 'all', 'all');
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search products by name, SKU, or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="w-full md:w-48">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.icon} {category.name} ({category.productCount})
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-40">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          🔄 Clear
        </button>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              Search: "{searchTerm}"
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
              Category: {selectedCategory}
            </span>
          )}
          {selectedStatus !== 'all' && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              Status: {selectedStatus}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
