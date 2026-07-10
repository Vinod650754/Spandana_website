export type HomepageButton = {
  label: string;
  url: string;
  variant: "primary" | "secondary";
};

export type HomepageHero = {
  title: string;
  subtitle: string;
  body: string;
  buttons: HomepageButton[];
  rotatingLines: string[];
  chips: string[];
};

export type HomepageImpactCounter = {
  label: string;
  value: number;
  suffix: string;
};

export type HomepageFeaturedSection = {
  title: string;
  description: string;
};

export type HomepageContent = {
  id?: string;
  hero: HomepageHero;
  impact: HomepageImpactCounter[];
  featuredSections: HomepageFeaturedSection[];
  heroBackground: {
    type: "reactbits";
    effects: string[];
  };
  updatedAt?: string;
};
