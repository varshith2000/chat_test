import React from 'react';
import SkuCard from '../components/sku/Sku';

const SkuPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container p-6 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#340368]">SKU Details</h1>
          <div className="flex items-center space-x-4">
            <span className="px-4 py-2 text-sm font-medium text-[#340368] bg-white border border-[#88bfe8] rounded-lg">
              Total SKUs: 1
            </span>
          </div>
        </div>
        
        <div className="grid gap-6">
          <SkuCard />
        </div>
      </div>
    </div>
  );
};

export default SkuPage; 