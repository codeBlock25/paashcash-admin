'use client';

import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  LoaderCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type ApiError,
  type Banner,
  bannerImageLoader,
  getApiErrorMessage,
} from '@/components/banners/banner.types';
import { BannerDeleteDialog } from '@/components/banners/banner-delete-dialog';
import { BannerLoading } from '@/components/banners/banner-loading';
import { Button } from '@/components/ui/button';

export function BannerDetail({ bannerId }: { bannerId: string }) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner>();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadBanner = useCallback(async () => {
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        cache: 'no-store',
      });
      const result = (await response.json()) as Banner | ApiError;
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(result as ApiError, 'Unable to load banner.'),
        );
      }
      setBanner(result as Banner);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load banner.',
      );
    } finally {
      setLoading(false);
    }
  }, [bannerId]);

  useEffect(() => {
    void loadBanner();
  }, [loadBanner]);

  async function copyLink() {
    if (!banner) return;
    await navigator.clipboard.writeText(banner.link);
    setCopied(true);
    toast.success('Banner link copied.');
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function removeBanner() {
    if (!banner) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: 'DELETE',
      });
      const result = (await response.json()) as ApiError;
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(result, 'The banner could not be deleted.'),
        );
      }
      toast.success('Banner deleted successfully.');
      router.push('/dashboard/banners');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'The banner could not be deleted.',
      );
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-8">
        <BannerLoading />
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="grid min-h-[calc(100dvh-86px)] place-items-center px-6 text-center">
        <div>
          <h2 className="text-lg font-medium">Banner unavailable</h2>
          <Button
            render={<Link href="/dashboard/banners" />}
            nativeButton={false}
            variant="link"
            className="mt-2"
          >
            Back to banners
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-white px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard/banners"
            className="flex w-fit items-center gap-2 text-[13px] font-medium text-[#55525c] hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to Banners
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#77757e]">Banner Status:</span>
            <span className="rounded-full bg-[#e9f8ed] px-2.5 py-1 text-[11px] font-medium text-[#2b9b4c]">
              Published
            </span>
            <Button
              render={<Link href={`/dashboard/banners/${banner.id}/edit`} />}
              nativeButton={false}
              variant="outline"
              className="h-9 border-primary/40 text-primary hover:bg-primary/5"
            >
              Edit Banner <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              aria-label="Delete banner"
              disabled={deleting}
              onClick={() => setDeleteDialogOpen(true)}
            >
              {deleting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <article className="mt-6 rounded-xl border border-[#e8e6ec] p-4 sm:p-6">
          <p className="text-[11px] font-medium text-[#8a8790]">Banner Title</p>
          <h2 className="mt-2 text-[17px] font-medium text-[#29272e]">
            {banner.title}
          </h2>
          <a
            href={banner.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${banner.title} destination`}
            className="mt-5 block overflow-hidden rounded-xl bg-[#f5f3f7] ring-primary/30 transition hover:ring-2"
          >
            <Image
              src={banner.url}
              alt={banner.title}
              width={974}
              height={446}
              loader={bannerImageLoader}
              unoptimized
              className="aspect-[487/223] max-h-[520px] w-full object-contain"
            />
          </a>
          <div className="mt-5">
            <p className="text-[12px] font-medium text-[#55525c]">
              Banner link
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#e7e5ea] px-3 py-2.5">
              <a
                href={banner.link}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-[13px] text-[#7047dd] hover:underline"
              >
                {banner.link}
              </a>
              <ExternalLink className="size-3.5 text-[#8c8993]" />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Copy banner link"
                onClick={() => void copyLink()}
              >
                {copied ? (
                  <Check className="size-3.5 text-green-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </article>
      </div>
      <BannerDeleteDialog
        banner={deleteDialogOpen ? banner : undefined}
        deleting={deleting}
        onOpenChange={(open) => {
          if (!deleting) setDeleteDialogOpen(open);
        }}
        onConfirm={() => void removeBanner()}
      />
    </section>
  );
}
