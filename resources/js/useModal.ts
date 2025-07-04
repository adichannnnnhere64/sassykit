/// modal.ts
import { router } from '@inertiajs/react';
import { lazy } from 'react';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ModalData = {
  show: boolean;
  component?: string;
  props?: Record<string, any>;
  baseUrl?: string;
  resolvedComponent?: React.LazyExoticComponent<any>;
  size?: ModalSize; // Add size property
};

let modalState: ModalData = { show: false };
const listeners: ((state: ModalData) => void)[] = [];

// Get all page components at build time, matching your createInertiaApp config
const pages = import.meta.glob([
  './pages/**/*.tsx',
  '../../app-modules/*/resources/js/**/*.tsx'
]);

function notify() {
  listeners.forEach((cb) => cb(modalState));
}

export function useModalState() {
  return modalState;
}

export function useModalSubscribe(callback: (state: ModalData) => void) {
  listeners.push(callback);
  return () => {
    const i = listeners.indexOf(callback);
    if (i > -1) listeners.splice(i, 1);
  };
}

// Updated open function to accept size parameter
export function open(href: string, version: string, size: ModalSize = 'md') {
  fetch(href, {
    headers: {
      'X-Inertia': 'true',
      'X-Modal': 'true',
      'X-Inertia-Version': version,
      'X-Modal-Size': size, // Pass size in header
    },
  })
    .then((res) => res.json())
    .then((data) => setModal({ ...data, size })) // Include size in the data
    .catch((error) => {
      console.error('Failed to open modal:', error);
    });
}

// Updated setModal to handle size
export function setModal(data: any) {
  if (modalState.show) return;

  // Handle module::component format (e.g., 'calendar::modals/create-modal')
  const regex = /([^:]+)::(.+)/;
  const matches = regex.exec(data.component);
  let componentPath: string;

  if (matches && matches.length > 2) {
    const module = matches[1].toLowerCase();
    const page = matches[2];
    console.log(module, page);
    componentPath = `../../app-modules/${module}/resources/js/${page}.tsx`;
  } else {
    componentPath = `./pages/${data.component}.tsx`;
  }

  const pageLoader = pages[componentPath];
  if (!pageLoader) {
    console.error(`Component not found: ${componentPath}`);
    return;
  }

  // Create lazy component with proper error handling
  const component = lazy(async () => {
    try {
      const module = await pageLoader();
      if (!module?.default) {
        throw new Error(`Module ${componentPath} doesn't have a default export`);
      }
      return { default: module.default };
    } catch (error) {
      console.error(`Failed to load module ${componentPath}:`, error);
      throw error;
    }
  });

  modalState = {
    ...data,
    resolvedComponent: component,
    show: true,
    size: data.size || 'md', // Default to 'md' if no size specified
  };
  notify();
}

export function close() {
  if (!modalState.show) return;
  // Create a new object to ensure state change is detected
  modalState = {
    ...modalState,
    show: false
  };
  notify();
}

export function reset() {
  if (modalState?.baseUrl && modalState.baseUrl !== window.location.href) {
    router.visit(modalState.baseUrl);
  }
  modalState = { show: false };
  notify();
}
