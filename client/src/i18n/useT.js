import { useLang } from '../context/LanguageContext';
import { getT } from './translations';

export default function useT() {
  const { lang } = useLang();
  return getT(lang);
}
