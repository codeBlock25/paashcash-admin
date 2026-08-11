'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ImageUp,
  LoaderCircle,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import {
  type ApiError,
  type Banner,
  bannerImageLoader,
  getApiErrorMessage,
} from '@/components/banners/banner.types';
import { BannerLoading } from '@/components/banners/banner-loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedFetch } from '@/lib/authenticated-fetch';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const RECOMMENDED_WIDTH = 487;
const RECOMMENDED_HEIGHT = 223;

type ImageDimensions = {
  height: number;
  width: number;
};

export function BannerForm({ bannerId }: { bannerId?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File>();
  const [currentBanner, setCurrentBanner] = useState<Banner>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>();
  const [loading, setLoading] = useState(Boolean(bannerId));
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!bannerId) return;
    let active = true;
    void authenticatedFetch(`/api/banners/${bannerId}`, { cache: 'no-store' })
      .then(async (response) => {
        const result = (await response.json()) as Banner | ApiError;
        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(result as ApiError, 'Unable to load banner.'),
          );
        }
        if (active) {
          const banner = result as Banner;
          setCurrentBanner(banner);
          setTitle(banner.title);
          setLink(banner.link);
        }
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : 'Unable to load banner.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bannerId]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function selectFile(selected?: File) {
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error('Choose a JPEG, PNG, WebP, or GIF image.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      toast.error('Banner images must be 10 MB or smaller.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    try {
      const dimensions = await readImageDimensions(selected);
      setImageDimensions(dimensions);
      if (!hasRecommendedDimensions(dimensions)) {
        toast.warning(
          `This image is ${dimensions.width}×${dimensions.height}px. The recommended size is ${RECOMMENDED_WIDTH}×${RECOMMENDED_HEIGHT}px.`,
        );
      }
    } catch {
      toast.error(
        'The image dimensions could not be read. Choose another image.',
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setFile(selected);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    void selectFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLFieldSetElement>) {
    event.preventDefault();
    setDragging(false);
    void selectFile(event.dataTransfer.files[0]);
  }

  async function submit() {
    if (!title.trim()) {
      toast.error('Enter a banner title.');
      return;
    }
    if (!isHttpUrl(link)) {
      toast.error('Enter a valid HTTP or HTTPS banner link.');
      return;
    }
    if (!bannerId && !file) {
      toast.error('Upload a banner image.');
      return;
    }

    setSubmitting(true);
    const body = new FormData();
    body.set('title', title.trim());
    body.set('link', link.trim());
    if (file) body.set('file', file);

    try {
      const response = await authenticatedFetch(
        bannerId ? `/api/banners/${bannerId}` : '/api/banners',
        { body, method: bannerId ? 'PATCH' : 'POST' },
      );
      const result = (await response.json()) as Banner | ApiError;
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            result as ApiError,
            bannerId
              ? 'The banner could not be updated.'
              : 'The banner could not be published.',
          ),
        );
      }
      const banner = result as Banner;
      toast.success(
        bannerId
          ? 'Banner updated successfully.'
          : 'Banner published successfully.',
      );
      router.push(`/dashboard/banners/${banner.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-8">
        <BannerLoading />
      </div>
    );
  }

  const imageUrl = previewUrl ?? currentBanner?.url;
  const imageSizeWarning =
    imageDimensions && !hasRecommendedDimensions(imageDimensions)
      ? `Uploaded image is ${imageDimensions.width}×${imageDimensions.height}px`
      : undefined;

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-white px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={
              currentBanner
                ? `/dashboard/banners/${currentBanner.id}`
                : '/dashboard/banners'
            }
            className="flex w-fit items-center gap-2 text-[13px] font-medium text-[#55525c] hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to Banners
          </Link>
          <div className="flex items-center gap-2">
            <Button
              render={<Link href="/dashboard/banners" />}
              nativeButton={false}
              variant="outline"
              className="h-9 border-primary/40 text-primary hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 px-5"
              disabled={submitting}
              onClick={() => void submit()}
            >
              {submitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              {bannerId ? 'Save changes' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-[#e8e6ec] p-4 sm:p-5">
            <label
              htmlFor="banner-title"
              className="mb-2 block text-[12px] font-medium text-[#55525c]"
            >
              Banner Title
            </label>
            <Input
              id="banner-title"
              value={title}
              maxLength={150}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter banner title"
              className="max-w-2xl"
            />
          </div>

          <div className="rounded-xl border border-[#e8e6ec] p-4 sm:p-5">
            <fieldset
              aria-label="Banner image upload"
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`relative flex aspect-[510/234] w-full max-w-[510px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                dragging
                  ? 'border-primary bg-primary/5'
                  : 'border-[#dedbe4] bg-[#faf9fb]'
              }`}
            >
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt="Banner preview"
                    fill
                    sizes="(min-width: 1024px) 70vw, 100vw"
                    loader={bannerImageLoader}
                    unoptimized
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => inputRef.current?.click()}
                    className="relative mt-auto mb-5 bg-white/95 shadow-sm"
                  >
                    <ImageUp className="size-4" /> Replace image
                  </Button>
                  {file ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Remove selected image"
                      onClick={() => {
                        setFile(undefined);
                        setImageDimensions(undefined);
                        if (inputRef.current) inputRef.current.value = '';
                      }}
                      className="absolute right-3 top-3 rounded-full bg-white/95"
                    >
                      <X className="size-4" />
                    </Button>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="absolute inset-0 grid w-full place-items-center overflow-hidden text-center"
                >
                  <Image
                    src="/images/new-banner-image.png"
                    alt=""
                    fill
                    sizes="510px"
                    className="object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex h-16 items-center justify-center gap-2 bg-black/30 text-[12px] font-medium text-white backdrop-blur-[1px]">
                    <ImageUp className="size-5" /> Upload banner
                  </span>
                </button>
              )}
              {imageSizeWarning ? (
                <div className="absolute inset-x-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50/95 px-3 py-2 text-[11px] font-medium text-amber-800 shadow-sm backdrop-blur-sm">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>
                    {imageSizeWarning}. Recommended: {RECOMMENDED_WIDTH}×
                    {RECOMMENDED_HEIGHT}px.
                  </span>
                </div>
              ) : null}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={onFileChange}
                className="sr-only"
              />
            </fieldset>
            <p
              className={`mt-3 flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] ${
                imageSizeWarning
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-[#eaf8ee] text-[#328a4c]'
              }`}
            >
              {imageSizeWarning ? <AlertTriangle className="size-3.5" /> : null}
              Ensure banner sizes are {RECOMMENDED_WIDTH}px ×{' '}
              {RECOMMENDED_HEIGHT}px
            </p>
            <div className="mt-5 max-w-[510px]">
              <label
                htmlFor="banner-link"
                className="mb-2 block text-[12px] font-medium text-[#55525c]"
              >
                Banner link
              </label>
              <Input
                id="banner-link"
                type="url"
                value={link}
                required
                maxLength={2048}
                onChange={(event) => setLink(event.target.value)}
                placeholder="https://example.com/offer"
              />
              <p className="mt-1.5 text-[11px] text-[#8c8993]">
                People who click the banner will be sent to this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function isHttpUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value.trim()).protocol);
  } catch {
    return false;
  }
}

function hasRecommendedDimensions(dimensions: ImageDimensions): boolean {
  return (
    dimensions.width === RECOMMENDED_WIDTH &&
    dimensions.height === RECOMMENDED_HEIGHT
  );
}

function readImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new globalThis.Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read image dimensions.'));
    };
    image.src = objectUrl;
  });
}
