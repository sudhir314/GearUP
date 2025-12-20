import React from 'react';

const Ingredients = () => {
  return (
    <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-12">Our Premium Materials</h1>
            <div className="grid md:grid-cols-3 gap-8">
                
                {/* Item 1 */}
                <div className="bg-gray-50 p-8 rounded-3xl hover:bg-blue-50 transition border border-transparent hover:border-blue-200">
                    <h3 className="text-2xl font-bold mb-4 text-blue-900">9H Tempered Glass</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Engineered for maximum impact resistance. Our screen guards use 9H hardness glass that resists scratches from keys and coins while maintaining 99.9% transparency and touch sensitivity.
                    </p>
                </div>

                {/* Item 2 */}
                <div className="bg-gray-50 p-8 rounded-3xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">Polycarbonate (PC)</h3>
                    <p className="text-gray-600 leading-relaxed">
                        The gold standard for hard cases. Lightweight yet incredibly durable, our PC material provides rigid structural support to absorb shock and prevent your device from bending or cracking upon impact.
                    </p>
                </div>

                {/* Item 3 */}
                <div className="bg-gray-50 p-8 rounded-3xl hover:bg-indigo-50 transition border border-transparent hover:border-indigo-200">
                    <h3 className="text-2xl font-bold mb-4 text-indigo-600">Shock-Absorbing TPU</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Flexible Thermoplastic Polyurethane (TPU) bumpers wrap around your phone's edges. This material excels at absorbing the energy from drops, protecting the delicate corners of your device.
                    </p>
                </div>

            </div>
        </div>
    </div>
  );
};

export default Ingredients;