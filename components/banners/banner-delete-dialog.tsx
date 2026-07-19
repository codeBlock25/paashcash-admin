'use client';

import { LoaderCircle, Trash2 } from 'lucide-react';

import type { Banner } from '@/components/banners/banner.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function BannerDeleteDialog({
  banner,
  deleting,
  onConfirm,
  onOpenChange,
}: {
  banner?: Banner;
  deleting: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(banner)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]" showCloseButton={!deleting}>
        <DialogHeader className="justify-items-center text-center">
          <span className="mb-3 grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
            <Trash2 className="size-5" />
          </span>
          <DialogTitle>Delete banner?</DialogTitle>
          <DialogDescription className="max-w-[340px]">
            “{banner?.title}” and its uploaded Cloudinary image will be
            permanently deleted. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-7 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Delete banner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
