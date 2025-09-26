// Minimal mocks for Next.js app router hooks so Storybook can render components
// outside of the Next.js runtime without crashing.

type RouterStub = {
  back: () => void;
  forward: () => void;
  refresh: () => void;
  replace: (href: string, options?: unknown) => void;
  push: (href: string, options?: unknown) => void;
  prefetch: (href: string) => Promise<void>;
};

const createRouterStub = (): RouterStub => ({
  back: () => {},
  forward: () => {},
  refresh: () => {},
  replace: () => {},
  push: () => {},
  prefetch: async () => {},
});

export const useRouter = () => createRouterStub();

export const usePathname = () => '/';

export const useSearchParams = () => {
  const params = new URLSearchParams();
  return {
    get: params.get.bind(params),
    getAll: params.getAll.bind(params),
    has: params.has.bind(params),
    toString: params.toString.bind(params),
    entries: params.entries.bind(params),
    keys: params.keys.bind(params),
    values: params.values.bind(params),
    forEach: params.forEach.bind(params),
    [Symbol.iterator]: params[Symbol.iterator].bind(params),
  } as const;
};

export const useParams = () => ({} as Record<string, string>);

export const useSelectedLayoutSegments = () => [] as string[];

export const useSelectedLayoutSegment = () => null as string | null;

export const redirect = () => {};
export const permanentRedirect = () => {};

const nextNavigationMock = {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  useSelectedLayoutSegments,
  useSelectedLayoutSegment,
  redirect,
  permanentRedirect,
};

export default nextNavigationMock;
