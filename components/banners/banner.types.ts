export type Banner = {
  id: string;
  title: string;
  link: string;
  publicId: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  message?: string | string[];
};

export function getApiErrorMessage(error: ApiError, fallback: string): string {
  return Array.isArray(error.message)
    ? (error.message[0] ?? fallback)
    : (error.message ?? fallback);
}

export function getBannerFileName(banner: Banner): string {
  return banner.publicId.split('/').at(-1) ?? banner.publicId;
}

export function bannerImageLoader({ src }: { src: string }): string {
  return src;
}
