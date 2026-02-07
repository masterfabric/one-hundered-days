/**
 * Internalized from Sonner (MIT License) by Emil Kowalski.
 * Modified for FinderDev project requirements.
 */
import React from 'react';

export const useIsDocumentHidden = () => {
  const [isDocumentHidden, setIsDocumentHidden] = React.useState(document.hidden);

  React.useEffect(() => {
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', callback);
    return () => document.removeEventListener('visibilitychange', callback);
  }, []);

  return isDocumentHidden;
};