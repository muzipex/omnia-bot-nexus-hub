import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className = '' }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment);
  
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    ...pathSegments.map((segment, index) => ({
      name: segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      path: '/' + pathSegments.slice(0, index + 1).join('/')
    }))
  ];

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`text-sm ${className}`}
    >
      <ol 
        className="flex items-center space-x-2"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {breadcrumbs.map((crumb, index) => (
          <li 
            key={crumb.path}
            className="flex items-center"
            itemScope
            itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
          >
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" aria-hidden="true" />
            )}
            <a
              href={crumb.path}
              className={`${
                index === breadcrumbs.length - 1
                  ? 'text-gray-400 cursor-default pointer-events-none'
                  : 'text-tech-blue hover:text-tech-blue/80'
              }`}
              aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              itemProp="item"
            >
              <span itemProp="name">{crumb.name}</span>
            </a>
            <meta itemProp="position" content={(index + 1).toString()} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;