
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// Shorthand component for translation - easier to use than TranslatedText
const T: React.FC<TProps> = ({ 
  children, 
  className, 
  as: Component = 'span' 
}) => {
  const { translated } = useTranslation(children);
  const [displayText, setDisplayText] = useState(children);
  
  useEffect(() => {
    if (translated) {
      setDisplayText(translated);
    }
  }, [translated]);
  
  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
};

// Export both as default export and named export
export { T };
export default T;
