import { memo, useCallback, useEffect, useMemo } from 'react';
import { useVpn } from '@/features/vpn';
import { Button, Card } from '@/shared/ui';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { useIsMobilePortrait } from '@/shared/hooks/useIsMobilePortrait';
import { useTranslation } from '@/i18n';

export const TermsScreen = memo(function TermsScreen() {
  const { acceptTerms, setScreen, termsAccepted } = useVpn();
  const isMobilePortrait = useIsMobilePortrait();

  useEffect(() => {
    if (!isMobilePortrait) setScreen('home');
  }, [isMobilePortrait, setScreen]);

  const { t } = useTranslation();
  const baseSectionStyle = useSectionStyle(16, 16);

  const TERM_CARDS = [
    {
      icon: 'fa-scroll',
      color: 'var(--accent)',
      title: t('terms.cardsLegalTitle'),
      text: t('terms.cardsLegalText'),
    },
    {
      icon: 'fa-shield-alt',
      color: '#39d98a',
      title: t('terms.cardsPrivacyTitle'),
      text: t('terms.cardsPrivacyText'),
    },
    {
      icon: 'fa-ban',
      color: '#ef6573',
      title: t('terms.cardsForbiddenTitle'),
      text: t('terms.cardsForbiddenText'),
    },
    {
      icon: 'fa-sync-alt',
      color: '#f0a74b',
      title: t('terms.cardsChangesTitle'),
      text: t('terms.cardsChangesText'),
    },
  ] as const;

  const handleAccept = useCallback(() => {
    acceptTerms();
    setScreen('home');
  }, [acceptTerms, setScreen]);

  const handleBack = useCallback(() => {
    setScreen('home');
  }, [setScreen]);

  const sectionStyle = useMemo(
    () => ({
      ...baseSectionStyle,
      inset: 0,
      padding: 0,
    }),
    [baseSectionStyle],
  );

  return (
    <section className="screen" style={sectionStyle}>
      <style>{`
        .terms-scroll::-webkit-scrollbar { display: none !important; width: 0 !important; background: transparent !important; }
      `}</style>
      <div className="pad" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          className="panel-title center"
          style={{ marginBottom: 'var(--space-xl)', paddingTop: 'var(--safe-area-top)' }}
        >
          {t('terms.title')}
        </div>

        <div
          className="terms-scroll"
          style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TERM_CARDS.map((card, i) => (
            <Card key={i} className="info-card term-card">
              <div className="row" style={{ marginBottom: 'var(--space-sm)' }}>
                <i
                  className={`fa ${card.icon}`}
                  style={{ color: card.color, fontSize: 'var(--font-lg)' }}
                />
                <strong style={{ fontSize: 'var(--font-md)' }}>{card.title}</strong>
              </div>
              <p className="muted" style={{ fontSize: 'var(--font-sm)' }}>
                {card.text}
              </p>
            </Card>
          ))}
        </div>

        <div
          style={{
            paddingTop: 'var(--space-xl)',
            paddingBottom: 'calc(var(--space-xl) + var(--safe-area-bottom))',
            paddingLeft: 0,
            paddingRight: 0,
            borderTop: '1px solid rgba(255,255,255,.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}
        >
          {!termsAccepted ? (
            <Button variant="primary" onClick={handleAccept} className="full-width">
              {t('terms.accept')}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleBack} className="full-width">
              {t('terms.back')}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
});
