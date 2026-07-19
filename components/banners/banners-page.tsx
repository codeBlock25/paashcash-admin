'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  ImageIcon,
  Info,
  MoreVertical,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  type ApiError,
  type Banner,
  bannerImageLoader,
  getApiErrorMessage,
  getBannerFileName,
} from '@/components/banners/banner.types';
import { BannerDeleteDialog } from '@/components/banners/banner-delete-dialog';
import { BannerLoading } from '@/components/banners/banner-loading';
import { Button } from '@/components/ui/button';

export function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string>();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'drafts'>(
    'all',
  );
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string>();
  const [bannerToDelete, setBannerToDelete] = useState<Banner>();

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/banners', { cache: 'no-store' });
      const result = (await response.json()) as Banner[] | ApiError;
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(result as ApiError, 'Unable to load banners.'),
        );
      }
      setBanners(result as Banner[]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to load banners.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    if (!openMenuId) return;
    const closeMenu = () => setOpenMenuId(undefined);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [openMenuId]);

  const filteredBanners = useMemo(() => {
    const search = query.trim().toLowerCase();
    const tabBanners = activeTab === 'drafts' ? [] : banners;
    if (!search) return tabBanners;
    return tabBanners.filter(
      (banner) =>
        banner.title.toLowerCase().includes(search) ||
        banner.publicId.toLowerCase().includes(search) ||
        banner.link.toLowerCase().includes(search),
    );
  }, [activeTab, banners, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBanners.length / rowsPerPage),
  );
  const visibleBanners = filteredBanners.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  async function removeBanner(banner: Banner) {
    setDeletingId(banner.id);
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
      setBanners((items) => items.filter((item) => item.id !== banner.id));
      setBannerToDelete(undefined);
      toast.success('Banner deleted successfully.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'The banner could not be deleted.',
      );
    } finally {
      setDeletingId(undefined);
    }
  }

  return (
    <section className="min-h-[calc(100dvh-86px)] bg-white px-4 py-5 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 border-b border-[#ecebf0] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid h-9 w-full max-w-[430px] grid-cols-3 rounded-lg bg-[#f4f3f6] p-0.5 text-[12px] font-medium text-[#aaa8b0]">
            {(['all', 'active', 'drafts'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`rounded-md capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-[#26252a] shadow-[0_1px_4px_rgba(20,16,35,0.08)]'
                    : 'hover:text-[#716f78]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#e5e4e9] px-3 text-[#9b99a2] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10 sm:w-[300px]">
            <Search className="size-4" />
            <span className="sr-only">Search banners</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search for banner..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#302e35] outline-none placeholder:text-[#aaa8b0]"
            />
          </label>
        </div>

        <div className="pt-5">
          {loading ? <BannerLoading /> : null}
          {!loading && banners.length === 0 ? <EmptyBanners /> : null}
          {!loading && banners.length > 0 ? (
            <div>
              <div className="hidden grid-cols-[1.4fr_0.95fr_0.7fr_1.25fr_38px] gap-4 rounded-lg bg-[#f5f4f6] px-5 py-3 text-[11px] font-medium text-[#85828b] md:grid">
                <span>Banner Title</span>
                <span>File name</span>
                <span>Status</span>
                <span>Banner link</span>
                <span />
              </div>
              {visibleBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="grid min-h-[68px] gap-4 border-b border-[#efedf2] p-4 md:grid-cols-[1.4fr_0.95fr_0.7fr_1.25fr_38px] md:items-center md:px-5 md:py-3"
                >
                  <Link
                    href={`/dashboard/banners/${banner.id}`}
                    className="truncate text-[13px] font-medium text-[#29272e] hover:text-primary"
                  >
                    {banner.title}
                  </Link>
                  <div className="group relative flex min-w-0 items-center gap-2 text-[12px] text-[#8a8790]">
                    <span className="truncate">
                      {getBannerFileName(banner)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Preview ${banner.title} image`}
                      className="shrink-0 rounded-full text-[#9d9aa3] hover:text-primary focus:text-primary"
                    >
                      <Info className="size-3.5" />
                    </button>
                    <div className="pointer-events-none invisible absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-[270px] -translate-x-1/2 overflow-hidden rounded-xl border border-[#e6e3e9] bg-white opacity-0 shadow-[0_12px_35px_rgba(27,20,46,0.16)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <Image
                        src={banner.url}
                        alt=""
                        width={270}
                        height={124}
                        loader={bannerImageLoader}
                        unoptimized
                        className="aspect-[487/223] w-full object-cover"
                      />
                      <p className="truncate px-3 py-2 text-right text-[10px] text-[#77747d]">
                        {getBannerFileName(banner)}
                      </p>
                    </div>
                  </div>
                  <span className="w-fit rounded-full bg-[#dff7e6] px-3 py-1 text-[10px] font-medium text-[#27984a]">
                    Active
                  </span>
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center gap-1.5 text-[12px] text-[#6b45d9] hover:underline"
                  >
                    <span className="truncate">{banner.link}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                  <div className="relative justify-self-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Open actions for ${banner.title}`}
                      aria-expanded={openMenuId === banner.id}
                      disabled={deletingId === banner.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId((id) =>
                          id === banner.id ? undefined : banner.id,
                        );
                      }}
                      className="text-[#a19fa7]"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                    {openMenuId === banner.id ? (
                      <div
                        role="menu"
                        className="absolute right-0 top-8 z-40 w-32 overflow-hidden rounded-lg border border-[#e8e5eb] bg-white py-1 text-[12px] shadow-[0_12px_30px_rgba(27,20,46,0.14)]"
                      >
                        <Link
                          role="menuitem"
                          href={`/dashboard/banners/${banner.id}`}
                          className="block px-4 py-2 text-[#55525c] hover:bg-[#f7f5f9]"
                        >
                          View
                        </Link>
                        <Link
                          role="menuitem"
                          href={`/dashboard/banners/${banner.id}/edit`}
                          className="block px-4 py-2 text-[#55525c] hover:bg-[#f7f5f9]"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setOpenMenuId(undefined);
                            setBannerToDelete(banner);
                          }}
                          className="block w-full px-4 py-2 text-left text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {filteredBanners.length === 0 ? (
                <div className="grid min-h-52 place-items-center px-6 text-center">
                  <div>
                    <ImageIcon className="mx-auto size-8 text-[#aaa7b2]" />
                    <p className="mt-3 text-sm font-medium">
                      No banners match your search.
                    </p>
                  </div>
                </div>
              ) : null}
              {filteredBanners.length > 0 ? (
                <div className="flex flex-col gap-4 border-b border-[#efedf2] px-1 py-4 text-[11px] text-[#77747d] sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3">
                    Rows per Page
                    <select
                      value={rowsPerPage}
                      onChange={(event) => {
                        setRowsPerPage(Number(event.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8 rounded-lg border border-[#e6e3e9] bg-white px-3 outline-none focus:border-primary"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="mr-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <PaginationButton
                      label="First page"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      <ChevronsLeft />
                    </PaginationButton>
                    <PaginationButton
                      label="Previous page"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      <ChevronLeft />
                    </PaginationButton>
                    <PaginationButton
                      label="Next page"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      <ChevronRight />
                    </PaginationButton>
                    <PaginationButton
                      label="Last page"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      <ChevronsRight />
                    </PaginationButton>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <BannerDeleteDialog
        banner={bannerToDelete}
        deleting={Boolean(deletingId)}
        onOpenChange={(open) => {
          if (!open && !deletingId) setBannerToDelete(undefined);
        }}
        onConfirm={() => {
          if (bannerToDelete) void removeBanner(bannerToDelete);
        }}
      />
    </section>
  );
}

function PaginationButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg text-[#8c8992] shadow-none [&_svg]:size-3.5"
    >
      {children}
    </Button>
  );
}

function EmptyBanners() {
  return (
    <div className="grid min-h-[560px] place-items-center border-b border-[#efedf2]">
      <div className="w-full max-w-[330px] rounded-2xl border border-[#e7e5eb] bg-white px-9 py-10 text-center shadow-[0_10px_35px_rgba(33,25,53,0.03)]">
        <Image
          src="/images/megaphone.png"
          alt=""
          width={149}
          height={140}
          className="mx-auto h-[140px] w-[149px] object-contain"
        />
        <h2 className="mt-6 text-[16px] font-medium text-[#29272e]">
          Add Banner
        </h2>
        <p className="mx-auto mt-1.5 max-w-[210px] text-[12px] leading-5 text-[#8a8891]">
          Get started with posting banner adverts.
        </p>
        <Button
          render={<Link href="/dashboard/banners/new" />}
          nativeButton={false}
          className="mt-6 h-9 w-full"
        >
          Add Banner <span aria-hidden="true">＋</span>
        </Button>
      </div>
    </div>
  );
}
