import SalesCampaignBanner from "@/components/layout/sales-campaign-banner";
import WheelOfFortune from "@/components/layout/wheel-of-fortune";
import ProductGrid from "@/components/product/product-grid";
import { getWheelOfFortuneConfiguration } from "@/actions/wheel-of-fortune-actions";
import { getAllProducts } from "@/sanity/lib/query";

const Home = async () => {


    const products = await getAllProducts();

    const { randomProducts, winningIndex } = await getWheelOfFortuneConfiguration();

    return (
        <div>
          <SalesCampaignBanner />
          <WheelOfFortune
            products={randomProducts}
            winningIndex={winningIndex}
          />

          <section className='container mx-auto py-8'>
            <ProductGrid products={products} />
          </section>
        </div>
    );
}

export default Home;