export const LOCALES = ['pt-BR', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const COMMUNITY_URL = 'https://chat.whatsapp.com/IqAcKnOasOr2PlOZ1t5VVn';
export const MENTORIA_URL = 'https://tally.so/r/xXdEDd';

type Strings = {
  // Template with {count} placeholder so this object stays serializable
  // across the RSC boundary when passed to Client Components.
  downloadsTemplate: string;
  copy: string;
  copied: string;
  copyHint: string;
  modalCopiedLine: string;
  modalHero: string;
  modalMentorshipCta: string;
  modalCommunityCta: string;
  howToUseTitle: string;
  madeBy: string;
  landingTitleLine1: string;
  landingTitleLine2: string;
  landingIntro: string;
  landingIntroSecondary: string;
  landingCtaCommunity: string;
  landingCtaMentorship: string;
  notFoundTitle: string;
  notFoundSubtitle: string;
  notFoundBack: string;
  pageTitleSuffix: string;
  metaDescription: string;
  landingTitle: string;
  landingMetaDescription: string;
};

const dict: Record<Locale, Strings> = {
  'pt-BR': {
    downloadsTemplate: '{count} downloads realizados',
    copy: 'Copiar prompt',
    copied: 'Copiado',
    copyHint: 'Toque e segure no bloco acima pra copiar manualmente.',
    modalCopiedLine: 'Copiado com sucesso, cola na IA!',
    modalHero: 'Quer aprender mais sobre IA?',
    modalMentorshipCta: 'Entrar para Caverna',
    modalCommunityCta: 'Comunidade IA Grátis',
    howToUseTitle: 'Como usar',
    madeBy: 'Feito por',
    landingTitleLine1: 'Prompts prontos,',
    landingTitleLine2: 'sem enrolação.',
    landingIntro:
      'Coleção de prompts que eu uso no dia-a-dia pra cortar caminho com IA — escrita, código, análise, criação. Cada um vive em uma URL única. Clica, copia, cola.',
    landingIntroSecondary:
      'A descoberta acontece fora daqui. Se você chegou por um link, o prompt está na página de destino.',
    landingCtaCommunity: 'Entrar na comunidade',
    landingCtaMentorship: 'Mentoria',
    notFoundTitle: 'Prompt não encontrado',
    notFoundSubtitle:
      'O link pode estar expirado ou o prompt ainda não foi publicado.',
    notFoundBack: 'Voltar pra home',
    pageTitleSuffix: '· prompts.blainercosta',
    metaDescription: 'Prompts prontos pra usar em IA, feitos por @_blainercosta.',
    landingTitle: 'prompts.blainercosta',
    landingMetaDescription:
      'Prompts prontos pra usar em IA, feitos por @_blainercosta.',
  },
  en: {
    downloadsTemplate: '{count} downloads',
    copy: 'Copy prompt',
    copied: 'Copied',
    copyHint: 'Tap and hold the block above to copy manually.',
    modalCopiedLine: 'Copied! Paste it into the AI.',
    modalHero: 'Want to learn more about AI?',
    modalMentorshipCta: 'Join the Caverna',
    modalCommunityCta: 'Free AI community',
    howToUseTitle: 'How to use',
    madeBy: 'Made by',
    landingTitleLine1: 'Ready-to-use prompts,',
    landingTitleLine2: 'no fluff.',
    landingIntro:
      'A collection of prompts I use daily to move faster with AI — writing, code, analysis, creation. Each lives in its own URL. Click, copy, paste.',
    landingIntroSecondary:
      'Discovery happens elsewhere. If you landed here via a link, the prompt is on the destination page.',
    landingCtaCommunity: 'Join the community',
    landingCtaMentorship: 'Mentorship',
    notFoundTitle: 'Prompt not found',
    notFoundSubtitle:
      'The link may be expired or the prompt is not yet published.',
    notFoundBack: 'Back to home',
    pageTitleSuffix: '· prompts.blainercosta',
    metaDescription: 'Ready-to-use AI prompts by @_blainercosta.',
    landingTitle: 'prompts.blainercosta',
    landingMetaDescription: 'Ready-to-use AI prompts by @_blainercosta.',
  },
};

export type I18n = Strings;

export function t(locale: Locale): I18n {
  return dict[locale];
}

// Parses Accept-Language and returns pt-BR for Portuguese speakers,
// otherwise en. The audience is mostly pt-BR + global English — not
// worth carrying more locales.
export function resolveLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'pt-BR';
  const primary = acceptLanguage
    .split(',')[0]
    ?.trim()
    .toLowerCase() ?? '';
  if (primary.startsWith('pt')) return 'pt-BR';
  return 'en';
}
