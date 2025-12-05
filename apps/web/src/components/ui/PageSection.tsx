import React from 'react';

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

const PageSection = ({ children, className = '', containerClassName = '' }: PageSectionProps) => {
  return (
    <section className={`section-spacing ${className}`.trim()}>
      <div className={`container-max ${containerClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
};

export default PageSection;