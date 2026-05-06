import { memo, useState, useCallback, useEffect } from 'react';
import { useVpn } from '@/features/vpn';
import { useTranslation } from '@/i18n';
import { BottomSheet } from './BottomSheet';
import '../../styles/components/repair-bottom-sheet.css';

interface RepairAccountBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RepairAccountBottomSheet = memo(function RepairAccountBottomSheet({
  isOpen,
  onClose,
}: RepairAccountBottomSheetProps) {
  const { t } = useTranslation();
  const { creds, disconnect, status } = useVpn();
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(creds?.user || '');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });

  // Sincronizar con el usuario logueado al abrir si el campo está vacío
  useEffect(() => {
    if (isOpen && !targetUser && creds?.user) {
      setTargetUser(creds.user);
    }
  }, [isOpen, creds?.user, targetUser]);

  const isConnected = status !== 'DISCONNECTED';

  const pillState = loading
    ? 'idle'
    : feedback.type === 'success'
      ? 'success'
      : feedback.type === 'error'
        ? 'error'
        : isConnected
          ? 'connected'
          : 'idle';

  const pillLabel =
    pillState === 'success'
      ? t('menu.repairPillSuccess') || 'reparado'
      : pillState === 'error'
        ? t('menu.repairPillError') || 'error'
        : loading
          ? t('menu.repairPillLoading') || 'reparando'
          : isConnected
            ? t('menu.repairPillConnected') || 'conectado'
            : t('menu.repairPillDisconnected') || 'desconectado';

  const handleRepair = useCallback(async () => {
    const userToRepair = targetUser.trim();

    if (!userToRepair) {
      setFeedback({
        message: t('menu.repairNoUserError') || 'Por favor, ingresá un usuario.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setFeedback({ message: '', type: null });

    try {
      if (status !== 'DISCONNECTED') disconnect();

      const response = await fetch(
        `https://shop.jhservices.com.ar/api/clients/reparar/${userToRepair}`,
        { method: 'POST' },
      );
      const data = await response.json();

      if (data.success) {
        setFeedback({
          message: data.message || t('menu.repairSuccess') || 'Cuenta reparada con éxito',
          type: 'success',
        });
      } else {
        setFeedback({
          message: data.error || t('menu.repairError') || 'Error al reparar cuenta',
          type: 'error',
        });
      }
    } catch {
      setFeedback({
        message:
          t('menu.repairUnexpectedError') ||
          'Ocurrió un error inesperado al conectar con el servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [targetUser, status, disconnect, t]);

  const headerActions = (
    <div
      className={`repair-conn-pill repair-conn-pill--${feedback.type ?? ''}`}
      style={{
        border: 'none',
        background: 'rgba(255,255,255,0.05)',
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <div
        className={`repair-conn-dot repair-conn-dot--${pillState === 'connected' ? '' : pillState}`}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background:
            feedback.type === 'success'
              ? '#22c55e'
              : feedback.type === 'error'
                ? '#ef4444'
                : isConnected
                  ? '#6d4aff'
                  : '#8d96b7',
        }}
      />
      <span className="repair-conn-label" style={{ color: '#8d96b7', fontWeight: 600 }}>
        {pillLabel}
      </span>
    </div>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        setFeedback({ message: '', type: null });
        onClose();
      }}
      title={t('menu.repairTitle') || 'Reparar Cuenta'}
      subtitle={t('menu.repairSubtitle') || 'Sincronización forzada'}
      icon={<i className="fa fa-magic" />}
      height="auto"
      className="repair-bs"
      headerActions={headerActions}
    >
      <div className="repair-content">
        <div className="repair-field" style={{ marginBottom: '16px' }}>
          <div className="repair-row-label" style={{ marginBottom: '8px' }}>
            {t('menu.repairUserInputLabel') || 'Usuario a reparar'}
          </div>
          <div className="repair-input-row">
            <i
              className={`fa fa-user ${feedback.type ?? ''}`}
              style={{
                color:
                  feedback.type === 'success'
                    ? '#22c55e'
                    : feedback.type === 'error'
                      ? '#ef4444'
                      : '#8d96b7',
              }}
            />
            <input
              type="text"
              className="repair-input"
              placeholder={t('credentials.usernamePlaceholder') || 'Usuario'}
              value={targetUser}
              onChange={(e) => {
                setTargetUser(e.target.value);
                if (feedback.type) setFeedback({ message: '', type: null });
              }}
              disabled={loading || !!feedback.type}
              autoComplete="off"
              autoCapitalize="none"
            />
          </div>
        </div>

        {feedback.type && (
          <div
            className={`repair-feedback repair-feedback--${feedback.type}`}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background:
                feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: feedback.type === 'success' ? '#22c55e' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
              fontSize: '13px',
            }}
          >
            <i
              className={`fa ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
            />
            <span>{feedback.message}</span>
          </div>
        )}

        {isConnected && !feedback.type && !loading && (
          <div
            className="repair-warn-strip"
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.08)',
              color: '#f59e0b',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <i className="fa fa-exclamation-triangle" />
            <span>{t('menu.repairWarnDisconnect') || 'Se desconectará al reparar'}</span>
          </div>
        )}

        <div
          className="repair-note-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            opacity: 0.6,
            fontSize: '12px',
            color: '#8d96b7',
          }}
        >
          <i className="fa fa-info-circle" />
          <span>{t('menu.repairInfo') || 'Sincronización forzada con Servex'}</span>
        </div>

        <button
          className="btn primary repair-btn-cta"
          style={{ width: '100%', height: '52px' }}
          onClick={feedback.type ? () => setFeedback({ message: '', type: null }) : handleRepair}
          disabled={loading}
        >
          {loading ? (
            <span>{t('menu.repairPillLoading') || 'Reparando...'}</span>
          ) : feedback.type ? (
            <>
              <i className="fa fa-redo" style={{ marginRight: '8px' }} />
              {t('menu.repairAgain') || 'Intentar de nuevo'}
            </>
          ) : (
            <>
              <i className="fa fa-magic" style={{ marginRight: '8px' }} />
              {t('menu.repairButton') || 'Reparar cuenta'}
            </>
          )}
        </button>
      </div>
    </BottomSheet>
  );
});
