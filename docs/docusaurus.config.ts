import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'React Native PassKit',
  tagline: 'Apple Wallet and Google Wallet passes for React Native',
  favicon: 'img/logo.svg',

  future: {
    v4: true,
  },

  url: 'https://reeq-dev.github.io',
  baseUrl: '/react-native-passkit/',
  organizationName: 'reeq-dev',
  projectName: 'react-native-passkit',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/reeq-dev/react-native-passkit/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'React Native PassKit',
      logo: {
        alt: 'React Native PassKit',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/api/methods',
          position: 'left',
          label: 'API',
        },
        {
          href: 'https://www.npmjs.com/package/@reeq/react-native-passkit',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/reeq-dev/react-native-passkit',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting started', to: '/getting-started/installation' },
            { label: 'API reference', to: '/api/methods' },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/reeq-dev/react-native-passkit',
            },
            {
              label: 'Issues',
              href: 'https://github.com/reeq-dev/react-native-passkit/issues',
            },
          ],
        },
      ],
      copyright: `MIT licensed. Apple Wallet is a trademark of Apple Inc. Google Wallet is a trademark of Google LLC.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'groovy', 'json', 'objectivec', 'kotlin'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
