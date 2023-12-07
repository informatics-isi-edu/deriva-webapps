import { useContext } from 'react';
import { TemplateParamsContext } from '@isrd-isi-edu/deriva-webapps/src/providers/template-params';

export default function useTemplateParams() {
  const context = useContext(TemplateParamsContext);
  if (!context) {
    throw new Error('No TemplateParamsProvider found when calling TemplateParamsContext');
  }
  return context;
}
