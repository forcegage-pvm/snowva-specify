'use client';

import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export interface Breadcrumb {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <div>
            <Link 
              href="/dashboard" 
              className="text-slate-400 hover:text-slate-500 transition-colors duration-200"
              aria-label="Go to Dashboard"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </div>
        </li>

        {items.map((item, index) => (
          <li key={item.label}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-slate-300"
                aria-hidden="true"
              />
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className="ml-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors duration-200"
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`ml-2 text-sm font-medium ${
                    item.current
                      ? 'text-slate-700'
                      : 'text-slate-500'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;