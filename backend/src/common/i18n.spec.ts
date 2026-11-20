import { bayLabel, pickLang, renderNotification, translateMessage } from './i18n.js';

describe('pickLang', () => {
  it('uses the first supported language', () => {
    expect(pickLang('rw')).toBe('rw');
    expect(pickLang('fr-FR,fr;q=0.9,en;q=0.8')).toBe('fr');
    expect(pickLang('de,sw;q=0.8')).toBe('sw');
  });

  it('falls back to English', () => {
    expect(pickLang(undefined)).toBe('en');
    expect(pickLang('de')).toBe('en');
  });
});

describe('translateMessage', () => {
  it('translates exact messages', () => {
    expect(translateMessage('Ticket not found.', 'sw')).toBe('Tiketi haikupatikana.');
    expect(translateMessage('Ticket not found.', 'en')).toBe('Ticket not found.');
  });

  it('translates messages with numbers or codes', () => {
    expect(translateMessage('Wait 30 seconds before requesting a new code.', 'fr')).toBe(
      'Patientez 30 secondes avant de demander un nouveau code.',
    );
    expect(translateMessage('Route A024 does not go from that stop to that stop.', 'rw')).toContain('A024');
  });

  it('leaves unknown messages untouched', () => {
    expect(translateMessage('Something new', 'rw')).toBe('Something new');
  });
});

describe('notifications', () => {
  it('renders a template in the reader language', () => {
    const n = renderNotification('queue', { position: 2, route: 'A024', to: 'Kicukiro', from: 'Nyabugogo', bay: 'Bay 3', time: '10:06' }, 'fr');
    expect(n.title).toBe('Vous êtes n° 2 dans la file');
    expect(n.body).toBe('Le bus A024 pour Kicukiro part de Nyabugogo, Quai 3 à 10:06.');
  });

  it('localises boarding bays', () => {
    expect(bayLabel('Bay 3', 'sw')).toBe('Lango 3');
    expect(bayLabel('Main stop', 'sw')).toBe('Main stop');
  });
});
