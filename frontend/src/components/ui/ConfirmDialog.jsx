import { AlertTriangle } from 'lucide-react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@heroui/react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = true,
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      isOpen={open}
      onOpenChange={onClose}
      size="md"
      placement="center"
      scrollBehavior="inside"
      isDismissable={!loading}
      isKeyboardDismissDisabled={loading}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalBody className="px-6 pb-2 pt-7 text-center">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                  danger ? 'bg-rose-50 text-rose-500' : 'bg-brand-50 text-brand-600'
                }`}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
                {message}
              </p>
            </ModalBody>
            <ModalFooter className="justify-center gap-2 px-6 pb-6 pt-4">
              <Button variant="light" onPress={onModalClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button
                color={danger ? 'danger' : 'primary'}
                onPress={onConfirm}
                isLoading={loading}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
