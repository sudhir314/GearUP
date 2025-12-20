import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Images - Ensure these exist in your assets folder
import blog1Img from '../assets/blog1.webp';
import blog2Img from '../assets/blog2.webp';
import blog3Img from '../assets/blog3.webp';

const blogData = [
  {
    id: 1,
    title: "Which Screen Protector is Best for iPhone 15?",
    image: blog1Img,
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="font-bold text-lg">Summary - You just bought a brand new iPhone 15, and the last thing you want is a scratched screen. But with so many options—Tempered Glass, Hydrogel, Matte, and Privacy—which one should you choose? We break down the differences to help you decide.</p>
        
        <h3 className="text-2xl font-bold text-black mt-8">1. Tempered Glass (The Gold Standard)</h3>
        <p>This is the most common choice for a reason. It feels exactly like your phone's original screen. A good 9H tempered glass protector absorbs impact. If you drop your phone, the protector shatters instead of your expensive screen.</p>

        <h3 className="text-2xl font-bold text-black mt-8">2. Hydrogel / TPU Films</h3>
        <p>These are soft, flexible plastic sheets. They are great for curved screens where glass might pop off. However, they don't offer much protection against drops—only against minor scratches.</p>

        <h3 className="text-2xl font-bold text-black mt-8">3. Matte vs. Privacy Glass</h3>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Matte Glass:</strong> Reduces glare from the sun and resists fingerprints. Great for gamers, but it slightly reduces screen clarity.</li>
            <li><strong>Privacy Glass:</strong> Appears black from the side so people sitting next to you can't read your messages. Perfect for commuters.</li>
        </ul>

        <h3 className="text-2xl font-bold text-black mt-8">Our Verdict</h3>
        <p>For most users, a high-quality **9H Tempered Glass** is the best balance of protection and clarity. At GearUp, all our protectors come with an easy-install kit to ensure zero bubbles.</p>
      </div>
    )
  },
  {
    id: 2,
    title: "Does Fast Charging Damage Your Battery?",
    image: blog2Img,
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="font-bold">Summary - It’s the most common myth in the tech world: "Don't use a fast charger, it kills your battery!" But is there any truth to it? Let's dive into the science of lithium-ion batteries and modern charging tech.</p>
        
        <h3 className="text-2xl font-bold text-black mt-8">How Fast Charging Actually Works</h3>
        <p>Modern fast charging works in two phases. The first phase applies a blast of voltage to the empty battery, getting you from 0% to 50% in roughly 30 minutes. The second phase slows down considerably to prevent overheating.</p>

        <h3 className="text-2xl font-bold text-black mt-8">The Real Enemy: Heat</h3>
        <p>Fast charging itself isn't the problem—heat is. If you use a cheap, uncertified charger that doesn't regulate power correctly, your phone gets hot. **Heat** degrades lithium-ion batteries faster than anything else.</p>

        <h3 className="text-2xl font-bold text-black mt-8">Best Practices for Battery Health</h3>
        <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Avoid Extreme Heat:</strong> Don't leave your phone charging on the dashboard of a car in the sun.</li>
            <li><strong>Use Certified Cables:</strong> Cheap cables often lack the safety chips needed to regulate current.</li>
            <li><strong>Don't Drain to 0%:</strong> Try to keep your battery between 20% and 80% for maximum lifespan.</li>
        </ol>

        <p className="mt-4">At GearUp, all our 65W and 20W chargers are GaN (Gallium Nitride) certified, meaning they charge fast while staying cool.</p>
      </div>
    )
  },
  {
    id: 3,
    title: "Top 5 Rugged Cases for Outdoor Adventures",
    image: blog3Img,
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="font-bold">SUMMARY - Heading for a trek or a camping trip? The wilderness is no place for a slippery, thin phone case. You need military-grade protection. Here are the features you should look for in a rugged case.</p>
        
        <h3 className="text-2xl font-bold text-black mt-8">Key Features of a Rugged Case</h3>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Raised Bezels:</strong> The edges should be higher than the screen. If you drop your phone face down on a rock, the glass shouldn't touch the surface.</li>
            <li><strong>Reinforced Corners:</strong> When a phone falls, it usually lands on a corner. Air-cushion technology in corners acts like a shock absorber.</li>
            <li><strong>Grip Texture:</strong> A rugged case should feel grippy in hand, even if your hands are sweaty or wet.</li>
        </ul>

        <h3 className="text-2xl font-bold text-black mt-8">Polycarbonate vs. TPU</h3>
        <p>The best cases use a hybrid approach. A hard Polycarbonate (PC) backplate for structure, and a soft Thermoplastic Polyurethane (TPU) bumper to absorb shock. This combination allows for maximum durability without adding brick-like weight.</p>

        <h3 className="text-2xl font-bold text-black mt-8">GearUp Recommendations</h3>
        <p>Check out our "Explorer Series" in the shop. They are drop-tested from 10 feet and come in colors that match your outdoor gear.</p>
      </div>
    )
  }
];

const BlogDetail = () => {
  const { id } = useParams();
  const blog = blogData.find(b => b.id === parseInt(id));

  if (!blog) return <div className="p-20 text-center">Blog not found</div>;

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition">
            <ArrowLeft size={20} className="mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">{blog.title}</h1>
        
        <div className="aspect-video rounded-3xl overflow-hidden mb-10 shadow-lg">
            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose lg:prose-xl max-w-none text-gray-800">
            {blog.content}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;