'use client';

import { Dialog, Transition } from '@headlessui/react';
import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    BellIcon,
    ChartPieIcon,
    CubeIcon,
    CurrencyDollarIcon,
    DocumentArrowDownIcon,
    DocumentDuplicateIcon,
    DocumentTextIcon,
    QueueListIcon,
    SparklesIcon,
    UsersIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, ReactNode, useMemo, useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    description: 'KPIs, alerts, and quick shortcuts',
    href: '/dashboard',
    icon: ChartPieIcon,
  },
  {
    name: 'Customers',
    description: 'Parent accounts, branches, and contacts',
    href: '/customers',
    icon: UsersIcon,
  },
  {
    name: 'Products',
    description: 'Catalog entries, price lists, and overrides',
    href: '/products/pricing',
    icon: CubeIcon,
  },
  {
    name: 'Quotes',
    description: 'Quote management, filtering, and status tracking',
    href: '/quotes',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Invoices',
    description: 'Invoice lifecycle and timelines',
    href: '/invoices/inv_250827101',
    icon: DocumentTextIcon,
  },
  {
    name: 'Documents',
    description: 'Searchable hub for exported PDFs',
    href: '/documents',
    icon: DocumentArrowDownIcon,
  },
  {
    name: 'Statements',
    description: 'Consolidated statements and exports',
    href: '/finance/statements',
    icon: QueueListIcon,
  },
  {
    name: 'Payments',
    description: 'Allocation workflows and audit logs',
    href: '/finance/payments/pay_2025_01_020',
    icon: CurrencyDollarIcon,
  },
];

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const MobileNavigation = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-200 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-200 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white px-6 py-6">
                <div className="flex h-12 items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                      SN
                    </span>
                    Snowva
                  </div>
                  <button
                    type="button"
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden className="h-6 w-6" />
                  </button>
                </div>
                <nav className="flex flex-1 flex-col gap-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={classNames(
                        pathname.startsWith(item.href)
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                        'group flex flex-col gap-1 rounded-xl px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-inset ring-slate-200/60 transition-colors',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon aria-hidden className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      <p className="text-xs font-normal text-slate-400">{item.description}</p>
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Monthly statement run</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Queue PDF exports and email delivery from a single workspace.
                  </p>
                  <Link
                    href="/statements"
                    onClick={onClose}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-900"
                  >
                    Review statements
                    <SparklesIcon aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const DesktopSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-8 overflow-y-auto border-r border-slate-200 bg-white px-8 py-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-lg font-semibold text-white">
            SN
          </span>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Operations</p>
            <p className="text-lg font-semibold text-slate-900">Snowva Console</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                pathname.startsWith(item.href)
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                'group flex flex-col gap-1 rounded-xl px-4 py-3 text-sm font-medium ring-1 ring-inset ring-slate-200/60 transition',
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon aria-hidden className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
              <p className="text-xs font-normal text-slate-400">{item.description}</p>
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Statements closing soon</p>
            <p className="mt-1 text-xs text-slate-500">
              Seven branch statements are queued. Attach supporting documents before delivery.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <Link
                href="/statements"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-white"
              >
                Review queue
                <SparklesIcon aria-hidden className="h-4 w-4" />
              </Link>
              <Link
                href="/documents"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:border-slate-300"
              >
                Document center
              </Link>
            </div>
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowRightOnRectangleIcon aria-hidden className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = useMemo(
    () => navigation.find((item) => pathname.startsWith(item.href)),
    [pathname],
  );

  return (
    <div className="relative min-h-screen bg-slate-100">
      <MobileNavigation isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DesktopSidebar />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden className="h-6 w-6" />
            </button>
            <div className="flex min-w-[0] flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Snowva Operations
              </span>
              <span className="truncate text-lg font-semibold text-slate-900">
                {activeSection?.name ?? 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              <SparklesIcon aria-hidden className="h-4 w-4 text-emerald-500" />
              <span>All systems nominal</span>
            </div>
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                LN
              </div>
              <div className="hidden text-right sm:flex sm:flex-col">
                <span className="text-sm font-semibold text-slate-900">Lerato Nkosi</span>
                <span className="text-xs text-slate-500">Finance Operations</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-4rem)] flex-col px-4 pb-12 pt-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
