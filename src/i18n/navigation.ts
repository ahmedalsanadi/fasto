//src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

const nav = createNavigation(routing);

type Nav = ReturnType<typeof createNavigation>;

export const Link: Nav['Link'] = nav.Link;
export const useRouter: Nav['useRouter'] = nav.useRouter;
export const usePathname: Nav['usePathname'] = nav.usePathname;
export const getPathname: Nav['getPathname'] = nav.getPathname;
export const redirect: Nav['redirect'] = nav.redirect;
