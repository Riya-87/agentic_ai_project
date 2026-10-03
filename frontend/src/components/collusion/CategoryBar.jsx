import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ArrowRight } from 'lucide-react';

const CATEGORY_CARDS = [
  {
    name: 'Hoodies & Sweats',
    category: 'Hoodies & Sweats',
    tag: '480 GSM HEAVYWEIGHT',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cargo & Trousers',
    category: 'Cargo & Trousers',
    tag: 'MODULAR RIPSTOP',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Jackets & Outerwear',
    category: 'Jackets & Outerwear',
    tag: 'LIQUID VINYL PUFFERS',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Graphic Tees',
    category: 'Graphic Tees',
    tag: 'ACID VINTAGE WASH',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Denim & Jeans',
    category: 'Denim & Jeans',
    tag: '14.5 OZ SELVEDGE',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Accessories & Footwear',
    category: 'Accessories & Footwear',
    tag: 'LUG-SOLE & RIGS',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
  },
];

export const CategoryBar = ({ onSelectCategory }) => {
  const { setSelectedCategory } = useShop();

  const handleCardClick = (cat) => {
    setSelectedCategory(cat);
    onSelectCategory?.();
  };

  return (
    <section className="py-14 bg-black text-white border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight font-mono">
              SHOP BY CATEGORY
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Explore our gender-inclusive collections</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORY_CARDS.map((card, idx) => (
            <div
              key={idx}
              onClick={() => handleCardClick(card.category)}
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800/80 hover:border-lime-400 transition-all duration-300 flex flex-col justify-end p-4 shadow-lg"
            >
              {/* Background Image with Zoom */}
              <img
                src={card.image}
                alt={card.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:via-black/20 transition-colors" />

              {/* Text Information */}
              <div className="relative z-10 space-y-1">
                <span className="text-[9px] font-black text-lime-400 uppercase tracking-widest block">
                  {card.tag}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight leading-snug group-hover:text-lime-400 transition-colors">
                  {card.name}
                </h4>
              </div>

              {/* Hover Arrow Badge */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-lime-400 group-hover:text-black transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
