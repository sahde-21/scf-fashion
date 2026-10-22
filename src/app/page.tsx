import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { Hero } from "@/components/home/Hero";
import { ProductRail } from "@/components/home/ProductRail";
import { PromoBanner } from "@/components/home/PromoBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <ProductRail
        title="New arrivals"
        description="Fresh silhouettes for the season, ready to bag and send on WhatsApp."
        href="/products?sort=newest"
        kind="new"
      />
      <PromoBanner />
      <ProductRail
        title="Popular now"
        description="The pieces customers keep coming back for."
        href="/products"
        kind="popular"
      />
    </>
  );
}
