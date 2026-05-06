import { Button, Toggle } from '@/shared/ui';
import { useTranslation } from '@/i18n';

export interface ConnectButtonProps {
  /**
   * Determina el texto y estilo del botón
   * - 'connected': Mostrar "Desconectar" y estilo danger
   * - 'connecting': Mostrar "Detener"
   * - 'connecting-auto': Mostrar "Detener" (auto mode)
   * - 'error': Mostrar "Reintentar"
   * - 'disconnected': Mostrar "Conectar"
   */
  state: 'connected' | 'connecting' | 'connecting-auto' | 'error' | 'disconnected';

  /** Callback cuando se presiona el botón */
  onClick: () => void;

  /** True si Auto Mode está activo */
  autoMode: boolean;

  /** Callback para cambiar Auto Mode */
  onAutoModeChange: (value: boolean) => void;

  /** Callback para abrir detalles de cuenta */
  onAccountClick?: () => void;

  /** Callback para abrir reparación de cuenta */
  onRepairClick?: () => void;
}

export function ConnectButton({
  state,
  onClick,
  autoMode,
  onAutoModeChange,
  onAccountClick,
  onRepairClick,
}: ConnectButtonProps) {
  const { t } = useTranslation();

  const buttonText = {
    connected: t('buttons.disconnect'),
    connecting: t('buttons.stop'),
    'connecting-auto': t('buttons.stop'),
    error: t('buttons.retry'),
    disconnected: t('buttons.connect'),
  }[state];

  const isDanger = state === 'connected' || state === 'error';
  const showAccount = state === 'connected' && onAccountClick;

  return (
    <div className="connect-button">
      {onRepairClick && (
        <Button variant="default" onClick={onRepairClick} className="btn-repair" data-nav>
          <i className="fa fa-magic" />
        </Button>
      )}
      {showAccount && (
        <Button variant="default" onClick={onAccountClick} className="btn-account" data-nav>
          <i className="fa fa-user" />
        </Button>
      )}
      <Button variant="primary" onClick={onClick} className={isDanger ? 'danger' : ''} data-nav>
        {buttonText}
      </Button>
      <Toggle checked={autoMode} onChange={onAutoModeChange} label={t('home.auto')} />
    </div>
  );
}
