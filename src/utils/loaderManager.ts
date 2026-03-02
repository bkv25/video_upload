let requestCount = 0;

type LoaderSubscriber = (isLoading: boolean) => void;

const subscribers = new Set<LoaderSubscriber>();

const notify = (isLoading: boolean): void => {
  subscribers.forEach((callback) => callback(isLoading));
};

export const subscribe = (callback: LoaderSubscriber): (() => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

export const showLoader = (): void => {
  requestCount++;
  if (requestCount === 1) {
    notify(true);
  }
};

export const hideLoader = (): void => {
  requestCount = Math.max(0, requestCount - 1);
  if (requestCount === 0) {
    notify(false);
  }
};

