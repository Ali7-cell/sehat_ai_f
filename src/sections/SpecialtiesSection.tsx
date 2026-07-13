import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stethoscope } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const specialties = [
  {
    name: 'Cardiology',
    description: 'Heart health, rhythm disorders, and cardiovascular care.',
    image: '/images/cardiology.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Dermatology',
    description: 'Skin conditions, allergies, and cosmetic treatments.',
    image: '/images/dermatology.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Neurology',
    description: 'Brain, spine, and nervous system disorders.',
    image: '/images/neurology.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Pediatrics',
    description: 'Child health, development, and pediatric care.',
    image: '/images/pediatrics.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Orthopedics',
    description: 'Bones, joints, and musculoskeletal conditions.',
    image: '/images/orthopedics.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Gastroenterology',
    description: 'Digestive system and stomach-related conditions.',
    image: '/images/gastroenterology.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Pulmonology',
    description: 'Lung health and respiratory conditions.',
    image: '/images/pulmonology.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Endocrinology',
    description: 'Hormones, diabetes, and metabolic disorders.',
    image: '/images/endocrinology.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Psychiatry',
    description: 'Mental health, anxiety, and depression care.',
    image: '/images/psychiatry.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Ophthalmology',
    description: 'Eye health and vision-related conditions.',
    image: '/images/ophthalmology.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'Dentistry',
    description: 'Oral health, teeth, and gum conditions.',
    image: '/images/dentistry.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
  {
    name: 'General Practice',
    description: 'Primary care, checkups, and common ailments.',
    image: '/images/general.jpg',
    color: '#2d6a4f',
    bg: '#1a3a2e',
  },
];

export default function SpecialtiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo('.specialties-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
        }
      );

      // Grid cards animation with elastic effect
      const cards = gsap.utils.toArray<HTMLElement>('.specialty-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 60, scaleY: 0.9 },
          {
            opacity: 1, y: 0, scaleY: 1,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
            delay: i * 0.06,
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none none',
            }
          }
        );

        // Elastic stretch on scroll
        gsap.fromTo(card,
          { scaleY: 0.92 },
          {
            scaleY: 1,
            duration: 1.2,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="specialties"
      ref={sectionRef}
      className="relative w-full py-24 bg-cream"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 specialties-header">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="w-5 h-5 text-emerald" />
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-emerald">
              Areas of Expertise
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-deep mb-4">
            Comprehensive <span className="text-emerald">Health Knowledge</span>
          </h2>
          <p className="font-body text-deep/60 max-w-lg mx-auto">
            From common ailments to specialized conditions, Sehat AI covers a wide spectrum of health domains.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {specialties.map((specialty) => (
            <div
              key={specialty.name}
              className="specialty-card group rounded-xl overflow-hidden will-change-transform"
              style={{
                background: specialty.color,
                boxShadow: '0 4px 24px rgba(26, 58, 46, 0.08)',
                transform: 'translateZ(0.1px)',
              }}
            >
              <div className="grid grid-rows-[auto_1fr] gap-4 p-5 h-full">
                {/* Image */}
                <div
                  className="aspect-[4/3] rounded-lg overflow-hidden"
                  style={{ background: specialty.bg }}
                >
                  <img
                    src={specialty.image}
                    alt={specialty.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                {/* Content */}
                <div className="text-cream">
                  <h3 className="font-heading text-lg font-medium mb-2 tracking-tight">
                    {specialty.name}
                  </h3>
                  <p className="text-sm opacity-85 leading-relaxed">
                    {specialty.description}
                  </p>
                  <span className="inline-block mt-4 text-xs uppercase tracking-[0.08em] font-medium text-mint group-hover:text-white transition-colors duration-300">
                    Learn more
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
