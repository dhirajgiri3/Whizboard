import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board Details",
  description: "View and manage your board",
};

interface BoardLayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

export default function BoardLayout({ children, params }: BoardLayoutProps) {
  return (
    <div className="board-layout">
      {children}
    </div>
  );
}
