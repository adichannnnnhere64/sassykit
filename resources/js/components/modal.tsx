import { close } from '@/useModal';
import { ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Teleport from './teleport';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ModalProps = {
    children: React.ReactNode;
    show: boolean;
    onClose?: () => void;
    size?: ModalSize;
};

export default function Modal({ children, show, onClose, size = 'md' }: ModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (show) {
            setShouldRender(true);
            // Small delay to ensure DOM is ready for transition
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            // Wait for animation to complete before unmounting
            setTimeout(() => setShouldRender(false), 200);
        }
    }, [show]);

    useEffect(() => {
        if (!show) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [show, onClose]);

    const handleClickAway = (e: React.MouseEvent<HTMLDivElement>) => {
        // Make sure we're clicking on the backdrop, not the modal content
        if (e.target instanceof Element && e.target.hasAttribute('data-modal-backdrop') && onClose) {
            e.preventDefault();
            e.stopPropagation();
            onClose();
        }
    };

    const getSizeClasses = (size: ModalSize) => {
        switch (size) {
            case 'xs':
                return 'min-w-[400px] max-w-[400px]';
            case 'sm':
                return 'min-w-[500px] max-w-[500px]';
            case 'md':
                return 'min-w-[700px] max-w-[700px]';
            case 'lg':
                return 'min-w-[900px] max-w-[900px]';
            case 'xl':
                return 'min-w-[1200px] max-w-[1200px]';
            default:
                return 'min-w-[700px] max-w-[700px]';
        }
    };

    if (!shouldRender) return null;

    return (
        <Teleport target="app">
            <div
                className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/75 transition-opacity duration-200 ease-out ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                // onClick={handleClickAway}
                data-modal-backdrop
            >
                <div
                    className={`dark:bg-card relative rounded-lg bg-white px-4 py-8 transition-all duration-200 ease-out ${getSizeClasses(size)} ${
                        isVisible
                            ? 'scale-100 opacity-100 translate-y-0'
                            : 'scale-95 opacity-0 translate-y-4'
                    }`}
                >
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        className="!absolute !top-2 !right-2 pb-4"
                        onClick={close}
                    >
                        <IconX size={16} />
                    </ActionIcon>
                    {children}
                </div>
            </div>
        </Teleport>
    );
}
