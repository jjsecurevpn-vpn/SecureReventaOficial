import { useCallback, useEffect } from 'react';
import { useVpn, useConnectionStatus, ServerCard } from '@/features/vpn';
import { useToastContext } from '@/shared/context/ToastContext';
import { useSectionStyle } from '@/shared/hooks/useSectionStyle';
import { useAutoFocus } from '@/shared/hooks/useAutoFocus';
import { TrafficDetails, ConnectButton, StatusLogo } from '@/shared/components';
import { CredentialFields } from '@/shared/ui';
import { useTranslation } from '@/i18n';
import { keyboardNavigationManager } from '@/core/utils';
import { ServerCarousel } from '../components/ServerCarousel';
import { AutoConnectStatus } from '../components/AutoConnectStatus';
import { useIsMobilePortrait } from '@/shared/hooks/useIsMobilePortrait';
import type { ServerConfig, Category } from '@/core/types';

export function HomeScreen({
  onShowAccount,
  onShowRepair,
}: {
  onShowAccount?: () => void;
  onShowRepair?: () => void;
}) {
  const { t } = useTranslation();
  const {
    config,
    creds,
    setCreds,
    setScreen,
    connect,
    disconnect,
    cancelConnecting,
    startAutoConnect,
    autoMode,
    autoProgress,
    setAutoMode,
    categorias,
    setConfig,
  } = useVpn();
  const { showToast } = useToastContext();
  const sectionStyle = useSectionStyle();
  const isPortrait = useIsMobilePortrait();
  const connectionState = useConnectionStatus();
  const { isDisconnected, isConnecting, isConnected, isError } = connectionState;

  // Determinar qué campos mostrar
  const isV2Ray = (config?.mode || '').toLowerCase().includes('v2ray');
  const isFreeServer = (config?.name || '').toLowerCase().includes('gratuito');
  const hasEmbeddedAuth =
    isFreeServer || !!(config?.auth?.username || config?.auth?.password || config?.auth?.uuid);
  const canEditCredentials = isDisconnected || isError;
  const showUserPass = !hasEmbeddedAuth && !isV2Ray && canEditCredentials;
  const showUuid = !hasEmbeddedAuth && isV2Ray && canEditCredentials;

  const handleConnect = useCallback(() => {
    try {
      if (isConnected) {
        disconnect();
        return;
      }
      if (isConnecting) {
        cancelConnecting();
        showToast(t('connection.cancel'));
        return;
      }
      if (!config) {
        showToast(t('connection.selectServer'), null, 'warning');
        return;
      }
      if (!hasEmbeddedAuth) {
        if (isV2Ray && !creds.uuid.trim()) {
          showToast(t('connection.enterUuid'), null, 'warning');
          return;
        }
        if (!isV2Ray && (!creds.user.trim() || !creds.pass.trim())) {
          showToast(t('connection.enterCredentials'), null, 'warning');
          return;
        }
      }
      if (autoMode) {
        try {
          startAutoConnect();
        } catch {
          showToast(t('error.autoConnectFailed'), document.activeElement as HTMLElement, 'error');
        }
      } else {
        try {
          connect();
        } catch {
          showToast(t('error.connectionFailed'), document.activeElement as HTMLElement, 'error');
        }
      }
    } catch {
      showToast(t('error.connectionFailed'), document.activeElement as HTMLElement, 'error');
    }
  }, [
    isConnected,
    isConnecting,
    config,
    hasEmbeddedAuth,
    isV2Ray,
    creds,
    autoMode,
    disconnect,
    cancelConnecting,
    showToast,
    startAutoConnect,
    connect,
    t,
  ]);

  const handleRepair = useCallback(() => {
    onShowRepair?.();
  }, [onShowRepair]);

  // Navegación original a la pantalla de servidores (para móvil)
  const handleServerCardClick = useCallback(() => {
    setScreen('servers');
  }, [setScreen]);

  const handleSelectServer = useCallback(
    (srv: ServerConfig, _cat: Category) => {
      setConfig(srv);
      showToast(`${t('connection.serverSelected')}: ${srv.name}`);
    },
    [setConfig, showToast, t],
  );

  const connectButtonState = isConnected
    ? 'connected'
    : isConnecting
      ? 'connecting'
      : isError
        ? 'error'
        : 'disconnected';

  // Activar navigation manager automáticamente
  useEffect(() => {
    const onFirstKey = (e: KeyboardEvent) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter', ' '];
      if (keys.includes(e.key)) {
        if (!keyboardNavigationManager.enabled) {
          keyboardNavigationManager.enable('.home-main', { includeFormControls: true });
        }
      }
    };
    window.addEventListener('keydown', onFirstKey);
    return () => window.removeEventListener('keydown', onFirstKey);
  }, []);

  // Autofocus en el botón de conectar al entrar
  useAutoFocus(
    () => document.querySelector<HTMLElement>('.home-main .connect-button'),
    [],
    '.home-main',
  );

  return (
    <section className="screen home-screen" style={sectionStyle}>
      <div className="home-main">
        <div className="home-spacer-top" />
        <div className="home-spacer-top" />

        <div className="logo-container">
          <StatusLogo size="large" showStatus />
        </div>

        <div className="home-spacer-mid" />

        <div className="server-card-wrapper">
          <div className="server-card">
            {/* ServerCard solo visible para navegación en móvil (Portrait) */}
            {isPortrait && (
              <div className="server-selector-card-container">
                <ServerCard config={config} onClick={handleServerCardClick} disabled={false} />
              </div>
            )}

            {canEditCredentials && (
              <CredentialFields
                username={creds.user}
                password={creds.pass}
                uuid={creds.uuid}
                showUserPass={showUserPass}
                showUuid={showUuid}
                onUsernameChange={(v) => setCreds({ user: v })}
                onPasswordChange={(v) => setCreds({ pass: v })}
                onUuidChange={(v) => setCreds({ uuid: v })}
              />
            )}

            {isConnecting && autoMode && autoProgress.total > 0 && (
              <AutoConnectStatus progress={autoProgress} />
            )}
            <TrafficDetails />

            <ConnectButton
              state={connectButtonState}
              onClick={handleConnect}
              onRepairClick={handleRepair}
              onAccountClick={onShowAccount}
              autoMode={autoMode}
              onAutoModeChange={setAutoMode}
            />
          </div>
        </div>

        {/* Carrusel de Servidores integrado directamente en el Home (Solo Landscape) */}
        {!isPortrait && (
          <div className="home-carousel-container">
            <ServerCarousel
              categorias={categorias}
              currentConfig={config}
              onSelectServer={handleSelectServer}
              autoMode={autoMode}
            />
          </div>
        )}

        <div className="home-spacer-bottom" />
      </div>
    </section>
  );
}
