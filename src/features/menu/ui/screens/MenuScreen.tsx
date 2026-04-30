import { memo, useEffect, useState, useCallback } from 'react';
import { useVpn } from '@/features/vpn';
import { useToastContext } from '@/shared/context/ToastContext';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { useIsMobilePortrait } from '@/shared/hooks/useIsMobilePortrait';
import { useTranslation } from '@/i18n';
import {
  cleanApp,
  getHotspotStatus,
  ignoreBatteryOptimizations,
  openApnSettings,
  openNetworkSettings,
  toggleHotspot as toggleHotspotAction,
} from '@/shared/lib/nativeActions';
import type { HotspotState } from '@/shared/lib/nativeActions';
import { MenuRow, GlobalModal } from '@/shared/components';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action?: () => void;
}

export const MenuScreen = memo(function MenuScreen({
  onShowSupport,
}: {
  onShowSupport?: () => void;
}) {
  const { t } = useTranslation();
  const { setScreen } = useVpn();
  const { showToast } = useToastContext();
  const [hotspotStatus, setHotspotStatus] = useState<HotspotState>('UNKNOWN');
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);

  const sectionStyle = useSectionStyle();

  const refreshHotspotStatus = useCallback(() => {
    setHotspotStatus(getHotspotStatus());
  }, []);

  useEffect(() => {
    refreshHotspotStatus();
  }, [refreshHotspotStatus]);

  const handleToggleHotspot = useCallback(() => {
    const next = toggleHotspotAction(hotspotStatus, showToast, {
      started: t('menu.hotspotStarted'),
      stopped: t('menu.hotspotStopped'),
      unavailable: t('common.notAvailableDevice'),
    });
    setHotspotStatus(next);
    if (next !== 'UNKNOWN') {
      setTimeout(refreshHotspotStatus, 400);
    }
  }, [hotspotStatus, showToast, refreshHotspotStatus, t]);

  const handlePressStart = useCallback((id: string) => {
    setPressedItem(id);
  }, []);

  const handlePressEnd = useCallback(() => {
    setPressedItem(null);
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: 'network',
      title: t('menu.itemsNetworkTitle'),
      subtitle: t('menu.itemsNetworkSubtitle'),
      icon: 'fa-network-wired',
      action: openNetworkSettings,
    },
    {
      id: 'apn',
      title: t('menu.itemsApnTitle'),
      subtitle: t('menu.itemsApnSubtitle'),
      icon: 'fa-signal',
      action: () => openApnSettings(showToast, t('common.notAvailableDevice')),
    },
    {
      id: 'battery',
      title: t('menu.itemsBatteryTitle'),
      subtitle: t('menu.itemsBatterySubtitle'),
      icon: 'fa-bolt',
      action: () => ignoreBatteryOptimizations(showToast, t('common.notAvailableDevice')),
    },
    {
      id: 'hotspot',
      title:
        hotspotStatus === 'RUNNING'
          ? t('menu.itemsHotspotTitleOn')
          : t('menu.itemsHotspotTitleOff'),
      subtitle:
        hotspotStatus === 'RUNNING'
          ? t('menu.itemsHotspotSubtitleOn')
          : hotspotStatus === 'STOPPED'
            ? t('menu.itemsHotspotSubtitleOff')
            : t('menu.itemsHotspotSubtitleUnknown'),
      icon: 'fa-wifi',
      action: hotspotStatus === 'UNKNOWN' ? undefined : handleToggleHotspot,
    },
    {
      id: 'support',
      title: t('menu.itemsSupportTitle'),
      subtitle: t('menu.itemsSupportSubtitle'),
      icon: 'fa-headset',
      action: () => onShowSupport?.(),
    },
    {
      id: 'terms',
      title: t('menu.itemsTermsTitle'),
      subtitle: t('menu.itemsTermsSubtitle'),
      icon: 'fa-file-lines',
      action: () => setScreen('terms'),
    },
    {
      id: 'clean',
      title: t('menu.itemsCleanTitle'),
      subtitle: t('menu.itemsCleanSubtitle'),
      icon: 'fa-broom',
      action: () => setShowCleanConfirm(true),
    },
  ];

  const isMobilePortrait = useIsMobilePortrait();
  const visibleItems = menuItems.filter((item) => item.id !== 'terms' || isMobilePortrait);

  return (
    <section className="screen" style={sectionStyle}>
      <div className="section-header">
        <div className="panel-title">{t('menu.title')}</div>
      </div>

      {showCleanConfirm && (
        <GlobalModal
          onClose={() => setShowCleanConfirm(false)}
          title={t('menu.cleanConfirmTitle')}
          subtitle={t('menu.cleanConfirmBody')}
          icon={
            <i className="fa fa-triangle-exclamation" style={{ color: '#fff', fontSize: '18px' }} />
          }
          size="sm"
          className="clean-confirm-modal"
          hideClose
        >
          <div className="button-group" style={{ marginTop: 0 }}>
            <button
              className="btn"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onClick={() => setShowCleanConfirm(false)}
              type="button"
            >
              {t('common.cancel')}
            </button>
            <button
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
              }}
              onClick={() => {
                setShowCleanConfirm(false);
                cleanApp(showToast, t('menu.cleanupDone'), t('common.notAvailableDevice'));
              }}
              type="button"
            >
              <i className="fa fa-broom" style={{ fontSize: '13px' }} />
              {t('menu.itemsCleanTitle')}
            </button>
          </div>
        </GlobalModal>
      )}

      <div className="menu-list">
        {visibleItems.map((item) => {
          const disabled = typeof item.action !== 'function';
          return (
            <MenuRow
              key={item.id}
              id={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              pressed={pressedItem === item.id}
              onClick={!disabled ? item.action : undefined}
              disabled={disabled}
              onPointerDown={() => handlePressStart(item.id)}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressEnd}
              onPointerCancel={handlePressEnd}
            />
          );
        })}
      </div>
    </section>
  );
});
