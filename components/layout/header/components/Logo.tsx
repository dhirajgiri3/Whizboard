import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/images/logo/whizboard_logo.png';
import { headerAnimations, darkHeaderAnimations } from '../utils/animations';

interface LogoProps {
  isLightMode: boolean;
  className?: string;
}

const Logo = ({ isLightMode, className = '' }: LogoProps) => {
  const animations = isLightMode ? headerAnimations : darkHeaderAnimations;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={animations.logo}
      transition={{ delay: 0.2, duration: 0.6 }}
      className={className}
    >
      <Link href="/" className="flex items-center space-x-3 group">
        <Image
          src={logo}
          alt="WhizBoard Logo"
          width={100}
          height={100}
          className="w-24 sm:w-28 h-auto object-contain object-center"
        />
      </Link>
    </motion.div>
  );
};

export default Logo; 