import { memo } from 'react';
import { useVpn } from '@/features/vpn';
import { useTranslation } from '@/i18n';
import '../../styles/components/bottom-tabs.css';

interface BottomTabsProps {
  onShowLogs?: () => void;
  onShowSupport?: () => void;
  onShowExtras?: () => void;
  onShowAccount?: () => void;
  onUpdate?: () => void;
  activeSheet?: string | null;
}

export const BottomTabs = memo(function BottomTabs({
  onShowLogs,
  onShowSupport,
  onShowExtras,
  onShowAccount,
  onUpdate,
  activeSheet,
}: BottomTabsProps) {
  const { setScreen, screen } = useVpn();
  const { t } = useTranslation();

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <nav className="bottom-tabs">
      <button
        className={`tab-btn ${activeSheet === 'logs' ? 'active' : ''}`}
        type="button"
        onClick={() => onShowLogs?.()}
        aria-label={t('buttons.logs')}
      >
        <svg
          className="icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
        </svg>
        <span className="tab-label">{t('buttons.logs')}</span>
      </button>

      <button
        className={`tab-btn ${(screen as string) === 'update' ? 'active' : ''}`}
        type="button"
        onClick={handleUpdate}
        aria-label={t('buttons.update')}
      >
        <svg
          className="icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5" />
        </svg>
        <span className="tab-label">{t('buttons.update')}</span>
      </button>

      <div className="center-tab-wrapper">
        <button
          className={`tab-btn center-home ${
            activeSheet === 'promo' || (!activeSheet && screen === 'home') ? 'active' : ''
          }`}
          type="button"
          onClick={() => {
            if (activeSheet === 'account') {
              onShowAccount?.();
            } else {
              setScreen('home');
            }
          }}
          aria-label={activeSheet === 'account' ? t('common.close') : t('home.title')}
        >
          {activeSheet === 'account' ? (
            <>
              <svg
                className="icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="tab-label">{t('common.close')}</span>
            </>
          ) : (
            <>
              <svg
                className="icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="tab-label">{t('home.title')}</span>
            </>
          )}
        </button>
      </div>

      <button
        className={`tab-btn ${activeSheet === 'support' || screen === 'support' ? 'active' : ''}`}
        type="button"
        onClick={onShowSupport}
        aria-label={t('support.title')}
      >
        <svg className="icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2a8,8,0,0,0-8,8v1.9A2.92,2.92,0,0,0,3,14a2.88,2.88,0,0,0,1.94,2.61C6.24,19.72,8.85,22,12,22h3V20H12c-2.26,0-4.31-1.7-5.34-4.39l-.21-.55L5.86,15A1,1,0,0,1,5,14a1,1,0,0,1,.5-.86l.5-.29V11a1,1,0,0,1,1-1H17a1,1,0,0,1,1,1v5H13.91a1.5,1.5,0,1,0-1.52,2H20a2,2,0,0,0,2-2V14a2,2,0,0,0-2-2V10A8,8,0,0,0,12,2Z" />
        </svg>
        <span className="tab-label">{t('support.title')}</span>
      </button>

      <button
        className={`tab-btn ${activeSheet === 'extras' ? 'active' : ''}`}
        type="button"
        onClick={onShowExtras}
        aria-label="Extras"
      >
        <svg
          className="icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
        <span className="tab-label">Extras</span>
      </button>
    </nav>
  );
});
