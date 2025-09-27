'use client';

import { Dialog, Transition } from '@headlessui/react';
import {
    ChartPieIcon,
    CubeIcon,
    CurrencyDollarIcon,
    DocumentArrowDownIcon,
    DocumentDuplicateIcon,
    DocumentTextIcon,
    QueueListIcon,
    UsersIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

export interface NavigationItem {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string | number;
}

const navigation: NavigationItem[] = [
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
    href: '/invoices',
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
    href: '/finance/payments',
    icon: CurrencyDollarIcon,
  },
];

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

interface DashboardNavProps {
  className?: string;
}

export const DashboardNav: React.FC<DashboardNavProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav className={classNames('space-y-1', className)}>
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              isActive
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              'group border-l-4 px-3 py-2 flex items-center text-sm font-medium transition-colors duration-200'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon
              className={classNames(
                isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500',
                'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
              )}
              aria-hidden="true"
            />
            <span className="truncate">{item.name}</span>
            {item.badge && (
              <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
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

        <div className="fixed inset-0 z-50 flex">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>

              <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <h1 className="text-xl font-bold text-slate-900">Snowva</h1>
                </div>
                <nav className="mt-5 space-y-1 px-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          isActive
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                          'group border-l-4 px-3 py-2 flex items-center text-sm font-medium'
                        )}
                        onClick={onClose}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon
                          className={classNames(
                            isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500',
                            'mr-3 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </div>
                        {item.badge && (
                          <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export { navigation };
export default DashboardNav;