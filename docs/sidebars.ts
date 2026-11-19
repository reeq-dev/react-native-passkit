import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/upgrading',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/adding-passes',
        'guides/creating-passes',
        'guides/pass-library',
        'guides/events',
        'guides/button',
        'guides/localization',
        'guides/platform-differences',
      ],
    },
    {
      type: 'category',
      label: 'API reference',
      collapsed: false,
      items: ['api/methods', 'api/components', 'api/types', 'api/errors'],
    },
  ],
};

export default sidebars;
