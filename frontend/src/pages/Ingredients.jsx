import React from 'react';

const Ingredients = () => {
  return (
    <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-12">Know Your Ingredients</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-8 rounded-3xl hover:bg-purple-50 transition border border-transparent hover:border-purple-200">
                    <h3 className="text-2xl font-bold mb-4 text-purple-900">Alum</h3>
                    <p className="text-gray-600 leading-relaxed">Naturally astringent, anti-inflammatory, and antimicrobial. A time-tested mineral salt that fights germs and body odor while reducing wetness caused by excessive perspiration.</p>
                </div>
                <div className="bg-gray-50 p-8 rounded-3xl hover:bg-green-50 transition border border-transparent hover:border-green-200">
                    <h3 className="text-2xl font-bold mb-4 text-green-700">Aloe Vera</h3>
                    <p className="text-gray-600 leading-relaxed">Nature’s skin panacea. An ideal skin hydrant and nourisher for dull and sensitive skin. Renowned for healing, skin-protecting, antifungal, and tyrosinase-inhibiting properties.</p>
                </div>
                <div className="bg-gray-50 p-8 rounded-3xl hover:bg-orange-50 transition border border-transparent hover:border-orange-200">
                    <h3 className="text-2xl font-bold mb-4 text-orange-600">Turmeric</h3>
                    <p className="text-gray-600 leading-relaxed">A powerhouse for fighting microbes in hot and humid weather. Helps remove skin darkening and tanning, enhancing natural skin tone and texture.</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Ingredients;
