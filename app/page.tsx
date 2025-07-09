import Hero from "@/app/components/Hero";
import Header from "@/components/layout/header/Header";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Header />
      <div className="h-screen w-full bg-white">
        <h1>Hello</h1>
      </div>
    </>
  );
}
