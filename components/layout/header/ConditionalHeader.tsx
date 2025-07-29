"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const ConditionalHeader = () => {
  const pathname = usePathname();
  
  // Don't show header on pages that have their own headers or special layouts
  const pagesWithoutHeader = [
    '/my-boards',
    '/login',
    '/signup',
    '/invitation-declined'
  ];
  
  const shouldShowHeader = !pagesWithoutHeader.some(page => 
    pathname?.startsWith(page)
  );
  
  return shouldShowHeader ? <Header /> : null;
};

export default ConditionalHeader; 