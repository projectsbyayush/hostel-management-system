import { useCallback, useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';

export default function FormModal({
  open,
  onOpenChange,
  title,
  subtitle,
  onSubmit,
  submitLabel = 'Save',
  children,
  size = 'lg',
  loading = false,
}) {
  const [formState, setFormState] = useState({});

  useEffect(() => {
    if (open) setFormState({});
  }, [open]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(formState, setFormState);
    },
    [formState, onSubmit]
  );

  return (
    <Modal
      isOpen={open}
      onOpenChange={onOpenChange}
      size={size}
      placement="center"
      scrollBehavior="inside"
      isDismissable={!loading}
      isKeyboardDismissDisabled={loading}
    >
      <ModalContent>
        {(onModalClose) => (
          <form onSubmit={handleSubmit} noValidate>
            <ModalHeader className="flex flex-col items-center gap-0.5 pb-1 text-center">
              <span className="text-lg font-bold text-slate-900">{title}</span>
              {subtitle && <span className="text-xs font-normal text-slate-400">{subtitle}</span>}
            </ModalHeader>
            <ModalBody className="max-h-[62vh] overflow-y-auto pr-1">
              <div className="mx-auto w-full max-w-md">
                {typeof children === 'function' ? children(formState, setFormState) : children}
              </div>
            </ModalBody>
            <div className="flex justify-center gap-2 px-6 py-4">
              <Button variant="light" onPress={onModalClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button type="submit" color="primary" isLoading={loading} spinnerPlacement="start">
                {submitLabel}
              </Button>
            </div>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
