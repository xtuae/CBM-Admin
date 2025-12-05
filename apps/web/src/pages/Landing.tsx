import HeroCredit from '../components/landing/HeroCredit';
import TopBrandsStrip from '../components/landing/TopBrandsStrip';
import CategoriesGrid from '../components/landing/CategoriesGrid';
import HowItWorks from '../components/landing/HowItWorks';
import TopPacksGrid from '../components/landing/TopPacksGrid';
import PopularBundlesList from '../components/landing/PopularBundlesList';

const Landing = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="container-max">
          <HeroCredit />
        </div>
      </section>

      <TopBrandsStrip />

      <CategoriesGrid />

      <HowItWorks />

      <TopPacksGrid />

      <PopularBundlesList />
    </>
  );
};

export default Landing;
