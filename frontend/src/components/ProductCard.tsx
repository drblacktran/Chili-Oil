/**
 * Product Card Component
 * Displays product information with actions
 */
import React from 'react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

const spiceLevelColors = {
  none: 'bg-gray-100 text-gray-700',
  mild: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hot: 'bg-orange-100 text-orange-700',
  extra_hot: 'bg-red-100 text-red-700',
};

const spiceLevelLabels = {
  none: 'No Spice',
  mild: '🌶️ Mild',
  medium: '🌶️🌶️ Medium',
  hot: '🌶️🌶️🌶️ Hot',
  extra_hot: '🌶️🌶️🌶️🌶️ Extra Hot',
};

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: product.currency || 'AUD',
    }).format(price);
  };

  const getPackagingInfo = () => {
    if (product.volume_ml) {
      return `${product.volume_ml}ml`;
    }
    if (product.weight_g) {
      return `${product.weight_g}g`;
    }
    return '';
  };

  return (
    <div
      className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group"
      data-product-category={product.category}
    >
      {/* Product Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <span className="text-6xl mb-2 block">
              {product.category === 'Chili Oil' && '🌶️'}
              {product.category === 'Sauce' && '🥫'}
              {product.category === 'Condiment' && '🧄'}
              {product.category === 'Seasoning' && '✨'}
              {product.category === 'Oil' && '🫗'}
              {product.category === 'Vinegar' && '🍶'}
              {product.category === 'Other' && '📦'}
            </span>
            <p className="text-xs text-gray-500">No image</p>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.isFeatured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
              ⭐ Featured
            </span>
          )}
          {product.status === 'inactive' && (
            <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded">
              Inactive
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-white text-gray-700 text-xs font-semibold rounded shadow">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* SKU and Packaging */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-gray-500">{product.sku}</span>
          <span className="text-xs font-semibold text-gray-600">
            {getPackagingInfo()}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Spice Level (if applicable) */}
        {product.spiceLevel && product.spiceLevel !== 'none' && (
          <div className="mb-3">
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                spiceLevelColors[product.spiceLevel]
              }`}
            >
              {spiceLevelLabels[product.spiceLevel]}
            </span>
          </div>
        )}

        {/* Pricing */}
        <div className="mb-3 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Retail Price</p>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(product.basePrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Wholesale</p>
              <p className="text-lg font-bold text-green-700">
                {formatPrice(product.wholesalePrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Info */}
        <div className="mb-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500">Min Stock:</span>
            <span className="font-semibold text-gray-700 ml-1">
              {product.minimumStockLevel}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Reorder:</span>
            <span className="font-semibold text-gray-700 ml-1">
              {product.reorderQuantity}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded hover:bg-gray-200 transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${product.name}?`)) {
                onDelete();
              }
            }}
            className="px-3 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded hover:bg-red-100 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
