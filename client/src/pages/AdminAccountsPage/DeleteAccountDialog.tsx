import { Loader2 } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@client/src/components/ui/alert-dialog';
import type { AppUser } from '@shared/app-user';

interface DeleteAccountDialogProps {
  account: AppUser | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteAccountDialog = ({
  account,
  isPending,
  onConfirm,
  onClose,
}: DeleteAccountDialogProps) => (
  <AlertDialog
    open={account !== null}
    onOpenChange={(next: boolean) => {
      if (isPending && !next) return;
      if (!next) onClose();
    }}
  >
    <AlertDialogContent className="rounded-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="font-heading text-lg font-bold">
          删除账号
        </AlertDialogTitle>
        <AlertDialogDescription className="leading-relaxed">
          确定删除账号「{account?.name ?? ''}」吗？将同时从应用和飞书 Base
          删除，无法恢复。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          disabled={isPending}
          className="rounded-full"
          onClick={onClose}
        >
          取消
        </AlertDialogCancel>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isPending}
          className="rounded-full"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              删除中…
            </>
          ) : (
            '确认删除'
          )}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteAccountDialog;
