'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
  href: string;
  className?: string;
}

export default function FeatureCard({
  title,
  subtitle,
  imageUrl,
  href,
  className,
}: FeatureCardProps) {
  return (
    <Link href={href}>
      <motion.div
        className={cn(
          'group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer',
          className
        )}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      >
        {/* Background */}
        <div
          className={cn(
            'absolute inset-0',
            imageUrl ? 'bg-cover bg-center' : 'bg-purple-dark'
          )}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[rgba(20,0,19,0.76)] group-hover:bg-[rgba(20,0,19,0.6)] transition-colors duration-300" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-[28px] font-bold text-white font-heading mb-2">
            {title}
          </h3>
          <p className="font-serif italic text-off-white mb-8">{subtitle}</p>

          {/* Explore Button */}
          <div className="flex items-center gap-2 text-off-white group/btn">
            <span className="font-heading font-semibold">EXPLORE</span>
            <ArrowRight
              size={20}
              className="group-hover/btn:translate-x-1 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Hover Shadow */}
        <div className="absolute inset-0 pointer-events-none group-hover:shadow-xl transition-shadow duration-300" />
      </motion.div>
    </Link>
  );
}
