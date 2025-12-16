import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// UPDATED IMPORTS - Using .webp to match your actual files
import blog1Img from '../assets/blog1.webp';
import blog2Img from '../assets/blog2.webp';
import blog3Img from '../assets/blog3.webp';

const blogData = [
  {
    id: 1,
    title: "What Is Alum and Why Is It Used in Natural Roll-Ons?",
    image: blog1Img,
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="font-bold text-lg">Summary - Ancient remedies like phitkari (alum) have always had a place in Indian households, but now they’re making their way back into modern skincare. Unlike chemical-laden deodorants that only mask odor, alum works at the root by targeting bacteria, keeping you naturally fresh without side effects.</p>
        
        <h3 className="text-2xl font-bold text-black mt-8">What Is Alum and Why Is It Used in Natural Roll-Ons?</h3>
        <p>Alum, popularly known as phitkari in India, is a natural mineral salt that has been part of traditional wellness for centuries. You might have seen it at your local store in its crystal form - something your grandparents probably swore by. Historically, alum has been used as an aftershave, a natural purifier, and even a quick fix for small cuts.</p>

        <h3 className="text-2xl font-bold text-black mt-8">Alum Skin Benefits You Can’t Ignore</h3>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Skin Tightening:</strong> Alum has natural astringent properties that help tighten pores and skin, limit big pores, and supply a toning effect.</li>
            <li><strong>Acne and Blemish Care:</strong> Thanks to its antibacterial features, alum fights pimples-causing bacteria, reducing breakouts and calming inflamed pores and skin.</li>
            <li><strong>Aftershave Hero:</strong> For years, men have used alum powder to appease razor burns and heal tiny nicks. It’s like a herbal first-resource crystal.</li>
            <li><strong>Natural Odor Control:</strong> Unlike everyday deodorants that only mask odor with perfume, alum kills the actual microorganisms that cause smell. No bacteria, no odor—easy as that.</li>
            <li><strong>Even Skin Tone:</strong> Alum has mild skin-lightening properties, which could reduce dark spots and give you a more even tone over time.</li>
        </ul>

        <h3 className="text-2xl font-bold text-black mt-8">Enter Phitku: India’s First Alum Crystal Roll-On</h3>
        <p>Now imagine all these alum skin benefits packed into a modern, easy-to-use roll-on. That’s exactly what Phitku brings to the table. Say hello to India’s first alum crystal roll-on, a game-changer in the deodorant space.</p>
      </div>
    )
  },
  {
    id: 2,
    title: "How Long Does a Roll-On Last? Everything You Need to Know",
    image: blog2Img,
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="font-bold">Summary - We all want products that last, not ones that vanish before the month ends. Deodorant sprays? They disappear into thin air. Roll-ons? They stick with you, stay closer to your skin, and give you longer-lasting freshness.</p>
        
        <h3 className="text-2xl font-bold text-black mt-8">Factors That Decide How Long a Roll-On Lasts</h3>
        <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Your Skin Type:</strong> Dry skin tends to absorb product faster, so your roll-on might seem like it fades quicker. Oily skin, on the other hand, holds it a little longer.</li>
            <li><strong>The Ingredients:</strong> Natural options, especially those with phitkari (alum), target the root cause of odor, bacteria. When the bacteria are gone, so is the odor.</li>
            <li><strong>Fragrance Concentration:</strong> Stronger fragrance doesn’t always mean better. In fact, it often fades faster because it just lingers in the air.</li>
            <li><strong>How You Apply It:</strong> Swipe it on clean, dry skin, like right after a shower, and it lasts longer. Apply it in a rush on sweaty skin, and it won’t hold up the same way.</li>
        </ol>

        <h3 className="text-2xl font-bold text-black mt-8">Why Phitku Deserves a Spot in Your Routine</h3>
        <p>With so many options out there, finding the right roll-on can feel like trial and error. That’s why Phitku, India’s first alum crystal roll-on, is worth talking about. It lasts 3x longer than regular deodorants, is cruelty-free, chemical-free, and naturally sourced.</p>
      </div>
    )
  },
  {
    id: 3,
    title: "The Hidden Chemicals in Deodorants You Should Avoid",
    image: blog3Img,
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="font-bold">SUMMARY - That citrusy, fruity deodorant you swear by? It might smell amazing, but behind the fresh notes could be a cocktail of hidden chemicals your skin definitely didn’t sign up for. From triclosan to artificial fragrances, most deodorants mask odor while quietly exposing your body to things it doesn’t need.</p>
        
        <h3 className="text-2xl font-bold text-black mt-8">The Hidden Chemicals Lurking in Your Deodorant</h3>
        <ul className="list-disc pl-6 space-y-2">
            <li><strong>Triclosan:</strong> Used for its antibacterial properties, but can disrupt hormones and irritate skin.</li>
            <li><strong>Propylene Glycol:</strong> Helps the product glide smoothly, but is linked to skin irritation and allergies.</li>
            <li><strong>Artificial Fragrances:</strong> “Fragrance” sounds harmless, but it’s often a cocktail of unknown chemicals.</li>
            <li><strong>Butane and Isobutane:</strong> Found in spray deodorants, these gases can cause dryness and long-term skin sensitivity.</li>
        </ul>

        <h3 className="text-2xl font-bold text-black mt-8">Now Is the Time to Make the Switch</h3>
        <p>Natural alternatives aren’t just a trend, they’re the smarter choice. When you go chemical-free, you’re not only cutting out hidden toxins but also giving your skin the chance to breathe and heal. A natural deodorant doesn’t just mask the smell with overpowering fragrance; it actually works on the root cause: bacteria.</p>
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