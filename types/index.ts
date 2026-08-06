export interface ImageAsset {
  url: string;
  public_id?: string;
  mobileUrl?: string;
  mobilePublicId?: string;
}

export interface ProductVariant {
  _id?: string;
  size: string;
  color: string;
  price: number;
  offerPrice?: number;
  stock: number;
  image?: ImageAsset | null;
}

export interface SizeGuideRow {
  size: string;
  chest?: string;
  length?: string;
  shoulder?: string;
  [key: string]: string | undefined;
}

export interface SizeGuide {
  columns?: string[];
  rows?: SizeGuideRow[];
  note?: string;
}

export interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  offerPrice: number;
  costPrice?: number;
  category: string;
  subCategory?: string;
  tags?: string[];
  images: ImageAsset[];
  variants?: ProductVariant[];
  sizeGuide?: SizeGuide;
  rating?: number;
  numReviews?: number;
  isTrending?: boolean;
  isNewArrival?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  logo?: string;
  favicon?: string;
  whatsappNumber?: string;
  heroImage?: string;
  ethosImage?: string;
  communityImages?: ImageAsset[];
  announcementText?: string;
  announcementLink?: string;
  announcementBgColor?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroImages?: ImageAsset[];
  ethosTitle?: string;
  ethosHeadline?: string;
  ethosDescription?: string;
  whyShopTitle?: string;
  whyShopHeadline?: string;
  whyShopFeature1Title?: string;
  whyShopFeature1BnTitle?: string;
  whyShopFeature1Desc?: string;
  whyShopFeature2Title?: string;
  whyShopFeature2BnTitle?: string;
  whyShopFeature2Desc?: string;
  whyShopFeature3Title?: string;
  whyShopFeature3BnTitle?: string;
  whyShopFeature3Desc?: string;
  whyShopFeature4Title?: string;
  whyShopFeature4BnTitle?: string;
  whyShopFeature4Desc?: string;
  communityTitle?: string;
  communityHeadline?: string;
  communitySubheadline?: string;
  instagramHandle?: string;
  contactEmail?: string;
  contactAddress?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  shippingInsideDhaka?: number;
  shippingOutsideDhaka?: number;
  freeShippingTrigger?: string;
  freeShippingMinQuantity?: number;
  freeShippingMinAmount?: number;
  paymentNumber?: string;
  categoryImageMen?: string;
  categoryImageWomen?: string;
  categoryImageFusion?: string;
  facebookPixelId?: string;
  googleAnalyticsId?: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
  avatarUrl?: string;
  productPurchased?: string;
}

export interface CategoryItem {
  id: string;
  title: string;
  bnSubtitle: string;
  href: string;
  image: string;
  tagline?: string;
}

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}
