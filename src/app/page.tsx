import { BuildYourLook } from "@/components/home/BuildYourLook";
import { EditorialLookbook } from "@/components/home/EditorialLookbook";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { HangingClothingRail } from "@/components/home/HangingClothingRail";
import { Hero } from "@/components/home/Hero";
import { ProductRail } from "@/components/home/ProductRail";
import { PromoBanner } from "@/components/home/PromoBanner";
import { RefinedEssentials } from "@/components/home/RefinedEssentials";
import { TrustStrip } from "@/components/home/TrustStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <RefinedEssentials />
      <FeaturedCollections />
      <HangingClothingRail />
      <BuildYourLook />
      <ProductRail
        title="New arrivals"
        description="Considered pieces for the season — select size and color, then order on WhatsApp."
        href="/products?sort=newest"
        kind="new"
      />
      <EditorialLookbook />
      <PromoBanner />
      <ProductRail
        title="House favourites"
        description="Quiet staples that return to the wardrobe again and again."
        href="/products"
        kind="popular"
      />
    </>
  );
}
