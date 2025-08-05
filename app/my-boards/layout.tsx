import type { Metadata } from "next";
import { BoardProvider } from "@/lib/context/BoardContext";

export const metadata: Metadata = {
  title: "WhizBoard - My Boards",
  description: "Manage and organize your boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BoardProvider>
      {children}
    </BoardProvider>
  );
}
