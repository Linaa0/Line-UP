/**
 * Server-side translations for the four app languages.
 *
 * Services keep throwing their English messages; the global
 * I18nExceptionFilter translates them for the client's Accept-Language.
 * Notifications are stored as a template + params and rendered on read.
 */
export const LANGUAGES = ['en', 'rw', 'fr', 'sw'] as const;
export type Lang = (typeof LANGUAGES)[number];

/** First supported language in an Accept-Language header, defaulting to English. */
export function pickLang(header: string | undefined): Lang {
  for (const part of (header ?? '').split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if ((LANGUAGES as readonly string[]).includes(code)) return code as Lang;
  }
  return 'en';
}

type Translated = Record<Exclude<Lang, 'en'>, string>;

/** Exact English messages → translations. */
const MESSAGES: Record<string, Translated> = {
  'An account with this phone number already exists. Log in instead.': {
    fr: 'Un compte existe déjà avec ce numéro de téléphone. Connectez-vous plutôt.',
    rw: "Hari konti isanzwe ikoresha iyi nimero ya telefone. Injira aho kwiyandikisha.",
    sw: 'Tayari kuna akaunti inayotumia namba hii ya simu. Ingia badala yake.',
  },
  'No account uses this phone number.': {
    fr: "Aucun compte n'utilise ce numéro de téléphone.",
    rw: 'Nta konti ikoresha iyi nimero ya telefone.',
    sw: 'Hakuna akaunti inayotumia namba hii ya simu.',
  },
  'Phone number or password is incorrect.': {
    fr: 'Numéro de téléphone ou mot de passe incorrect.',
    rw: 'Nimero ya telefone cyangwa ijambobanga si byo.',
    sw: 'Namba ya simu au nenosiri si sahihi.',
  },
  'Verify your phone number to finish setting up your account.': {
    fr: 'Vérifiez votre numéro de téléphone pour terminer la création de votre compte.',
    rw: 'Emeza nimero yawe ya telefone kugira ngo urangize gufungura konti yawe.',
    sw: 'Thibitisha namba yako ya simu ili kukamilisha kufungua akaunti yako.',
  },
  'Your account no longer exists.': {
    fr: "Votre compte n'existe plus.",
    rw: 'Konti yawe ntikibaho.',
    sw: 'Akaunti yako haipo tena.',
  },
  'This code has expired. Request a new one.': {
    fr: 'Ce code a expiré. Demandez-en un nouveau.',
    rw: 'Iyi kode yarengeje igihe. Saba indi.',
    sw: 'Msimbo huu umeisha muda wake. Omba mwingine.',
  },
  'Too many wrong attempts. Request a new code.': {
    fr: 'Trop de tentatives incorrectes. Demandez un nouveau code.',
    rw: 'Wagerageje inshuro nyinshi ntibikunde. Saba indi kode.',
    sw: 'Umejaribu mara nyingi bila mafanikio. Omba msimbo mpya.',
  },
  'That code is not correct. Check it and try again.': {
    fr: 'Ce code est incorrect. Vérifiez-le et réessayez.',
    rw: 'Iyo kode si yo. Yigenzure wongere ugerageze.',
    sw: 'Msimbo huo si sahihi. Uhakikishe kisha ujaribu tena.',
  },
  'Log in to continue': {
    fr: 'Connectez-vous pour continuer',
    rw: 'Injira kugira ngo ukomeze',
    sw: 'Ingia ili kuendelea',
  },
  'Your session has expired. Log in again.': {
    fr: 'Votre session a expiré. Reconnectez-vous.',
    rw: 'Igihe cyo kwinjira cyarangiye. Ongera winjire.',
    sw: 'Muda wako wa kuingia umeisha. Ingia tena.',
  },
  'Use at least 8 characters': {
    fr: 'Utilisez au moins 8 caractères',
    rw: 'Koresha nibura inyuguti 8',
    sw: 'Tumia angalau herufi 8',
  },
  'Use at most 72 characters': {
    fr: 'Utilisez au maximum 72 caractères',
    rw: 'Ntukarenze inyuguti 72',
    sw: 'Usizidishe herufi 72',
  },
  'Include at least one letter': {
    fr: 'Incluez au moins une lettre',
    rw: 'Shyiramo nibura inyuguti imwe',
    sw: 'Weka angalau herufi moja',
  },
  'Include at least one number': {
    fr: 'Incluez au moins un chiffre',
    rw: 'Shyiramo nibura umubare umwe',
    sw: 'Weka angalau tarakimu moja',
  },
  'Enter your full name': {
    fr: 'Saisissez votre nom complet',
    rw: 'Andika amazina yawe yombi',
    sw: 'Andika jina lako kamili',
  },
  'Enter the 6-digit code': {
    fr: 'Saisissez le code à 6 chiffres',
    rw: "Andika kode igizwe n'imibare 6",
    sw: 'Andika msimbo wa tarakimu 6',
  },
  'Enter your password': {
    fr: 'Saisissez votre mot de passe',
    rw: 'Andika ijambobanga ryawe',
    sw: 'Andika nenosiri lako',
  },
  'Enter a valid Rwandan mobile number, e.g. 0788 123 456': {
    fr: 'Saisissez un numéro de mobile rwandais valide, ex. 0788 123 456',
    rw: 'Andika nimero ya telefone yo mu Rwanda yemewe, urugero: 0788 123 456',
    sw: 'Andika namba sahihi ya simu ya Rwanda, mfano 0788 123 456',
  },
  'Enter a valid email address': {
    fr: 'Saisissez une adresse e-mail valide',
    rw: 'Andika aderesi imeyili yemewe',
    sw: 'Andika anwani sahihi ya barua pepe',
  },
  'Describe the issue in at least 10 characters': {
    fr: 'Décrivez le problème en au moins 10 caractères',
    rw: 'Sobanura ikibazo mu nyuguti nibura 10',
    sw: 'Eleza tatizo kwa angalau herufi 10',
  },
  'Route not found.': { fr: 'Itinéraire introuvable.', rw: 'Inzira ntiyabonetse.', sw: 'Njia haikupatikana.' },
  'Choose two different stops.': {
    fr: 'Choisissez deux arrêts différents.',
    rw: 'Hitamo ibyapa bibiri bitandukanye.',
    sw: 'Chagua vituo viwili tofauti.',
  },
  'Stop not found.': { fr: 'Arrêt introuvable.', rw: 'Icyapa nticyabonetse.', sw: 'Kituo hakikupatikana.' },
  'That bus has already left or is not on the timetable. Pick another departure.': {
    fr: "Ce bus est déjà parti ou ne figure pas dans l'horaire. Choisissez un autre départ.",
    rw: 'Iyo bisi yamaze kugenda cyangwa ntiri ku ngengabihe. Hitamo ikindi gihe cyo guhaguruka.',
    sw: 'Basi hilo limeshaondoka au halipo kwenye ratiba. Chagua muda mwingine wa kuondoka.',
  },
  'No more buses on this route today.': {
    fr: "Plus aucun bus sur cette ligne aujourd'hui.",
    rw: 'Nta zindi bisi zisigaye kuri uyu murongo uyu munsi.',
    sw: 'Hakuna mabasi zaidi kwenye njia hii leo.',
  },
  'Could not create a ticket. Try again.': {
    fr: 'Impossible de créer le billet. Réessayez.',
    rw: 'Ntibyakunze gukora itike. Ongera ugerageze.',
    sw: 'Imeshindikana kuunda tiketi. Jaribu tena.',
  },
  'Ticket not found.': { fr: 'Billet introuvable.', rw: 'Itike ntiyabonetse.', sw: 'Tiketi haikupatikana.' },
  'This ticket is already paid.': {
    fr: 'Ce billet est déjà payé.',
    rw: 'Iyi tike yamaze kwishyurwa.',
    sw: 'Tiketi hii imeshalipiwa.',
  },
  'This bus has already left. Choose a later departure.': {
    fr: 'Ce bus est déjà parti. Choisissez un départ plus tard.',
    rw: 'Iyi bisi yamaze kugenda. Hitamo igihe cyo guhaguruka gikurikiyeho.',
    sw: 'Basi hili limeshaondoka. Chagua muda wa baadaye.',
  },
  'Pay for the ticket before joining the queue.': {
    fr: 'Payez le billet avant de rejoindre la file.',
    rw: 'Banza wishyure itike mbere yo kujya ku murongo.',
    sw: 'Lipia tiketi kabla ya kujiunga na foleni.',
  },
  'This bus has already left.': { fr: 'Ce bus est déjà parti.', rw: 'Iyi bisi yamaze kugenda.', sw: 'Basi hili limeshaondoka.' },
  'Queue entry not found.': {
    fr: 'Place dans la file introuvable.',
    rw: 'Umwanya ku murongo ntiwabonetse.',
    sw: 'Nafasi kwenye foleni haikupatikana.',
  },
  'Notification not found.': { fr: 'Notification introuvable.', rw: 'Imenyesha ntiryabonetse.', sw: 'Arifa haikupatikana.' },
};

/** Messages with a variable part. */
const PATTERNS: { re: RegExp; t: Record<Exclude<Lang, 'en'>, (m: RegExpMatchArray) => string> }[] = [
  {
    re: /^Wait (\d+) seconds before requesting a new code\.$/,
    t: {
      fr: (m) => `Patientez ${m[1]} secondes avant de demander un nouveau code.`,
      rw: (m) => `Tegereza amasegonda ${m[1]} mbere yo gusaba indi kode.`,
      sw: (m) => `Subiri sekunde ${m[1]} kabla ya kuomba msimbo mpya.`,
    },
  },
  {
    re: /^Route (\S+) does not go from that stop to that stop\.$/,
    t: {
      fr: (m) => `La ligne ${m[1]} ne relie pas ces deux arrêts dans ce sens.`,
      rw: (m) => `Umurongo ${m[1]} ntuva kuri icyo cyapa ngo ugere kuri icyo.`,
      sw: (m) => `Njia ${m[1]} haitoki kituo hicho kwenda kituo hicho.`,
    },
  },
];

export function translateMessage(message: string, lang: Lang): string {
  if (lang === 'en') return message;
  const exact = MESSAGES[message];
  if (exact) return exact[lang];
  for (const p of PATTERNS) {
    const m = message.match(p.re);
    if (m) return p.t[lang](m);
  }
  return message;
}

/** "Bay 3" (as stored) in the reader's language. */
export function bayLabel(bay: string, lang: Lang): string {
  const n = bay.match(/^Bay (\d+)$/)?.[1];
  if (!n) return bay;
  return { en: `Bay ${n}`, fr: `Quai ${n}`, rw: `Umuryango ${n}`, sw: `Lango ${n}` }[lang];
}

type Params = Record<string, string | number>;
const fill = (s: string, p: Params) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(p[k] ?? ''));

/** Notification templates: [title, body] per language. */
export const NOTIFICATIONS = {
  welcome: {
    en: ['Welcome to LINE-UP, {name}!', 'Your account is ready. Search a route to buy your first ticket.'],
    fr: ['Bienvenue sur LINE-UP, {name} !', 'Votre compte est prêt. Cherchez un itinéraire pour acheter votre premier billet.'],
    rw: ['Murakaza neza kuri LINE-UP, {name}!', 'Konti yawe yiteguye. Shakisha inzira kugira ngo ugure itike yawe ya mbere.'],
    sw: ['Karibu LINE-UP, {name}!', 'Akaunti yako iko tayari. Tafuta njia ili ununue tiketi yako ya kwanza.'],
  },
  payment: {
    en: ['Payment successful', 'RWF {fare} paid with {method} (demo) for ticket #{code}.'],
    fr: ['Paiement réussi', '{fare} RWF payés avec {method} (démo) pour le billet #{code}.'],
    rw: ['Kwishyura byagenze neza', 'Wishyuye RWF {fare} ukoresheje {method} (igerageza) ku itike #{code}.'],
    sw: ['Malipo yamefanikiwa', 'RWF {fare} zimelipwa kwa {method} (majaribio) kwa tiketi #{code}.'],
  },
  queue: {
    en: ["You're #{position} in the queue", 'Bus {route} to {to} leaves {from}{bay} at {time}.'],
    fr: ['Vous êtes n° {position} dans la file', 'Le bus {route} pour {to} part de {from}{bay} à {time}.'],
    rw: ['Uri uwa {position} ku murongo', 'Bisi {route} ijya {to} irahaguruka {from}{bay} saa {time}.'],
    sw: ['Wewe ni wa {position} kwenye foleni', 'Basi {route} kwenda {to} linaondoka {from}{bay} saa {time}.'],
  },
  report: {
    en: ['We received your report', 'Reference {ref}. Our team will follow up by SMS.'],
    fr: ['Nous avons reçu votre signalement', 'Référence {ref}. Notre équipe vous répondra par SMS.'],
    rw: ['Twakiriye raporo yawe', "Nimero y'ikibazo: {ref}. Itsinda ryacu rizagusubiza kuri SMS."],
    sw: ['Tumepokea ripoti yako', 'Kumbukumbu {ref}. Timu yetu itakujibu kwa SMS.'],
  },
} satisfies Record<string, Record<Lang, [string, string]>>;

export type NotificationTemplate = keyof typeof NOTIFICATIONS;

export function renderNotification(template: NotificationTemplate, params: Params, lang: Lang) {
  const p = { ...params, bay: params.bay ? `, ${bayLabel(String(params.bay), lang)}` : '' };
  const [title, body] = NOTIFICATIONS[template][lang];
  return { title: fill(title, p), body: fill(body, p) };
}
