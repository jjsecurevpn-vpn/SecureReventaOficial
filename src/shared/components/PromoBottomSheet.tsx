import { memo, useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { useTranslation } from '../../i18n/useTranslation';
import { usePromo } from '../hooks/usePromo';
import { useCoupons, Coupon } from '../hooks/useCoupons';
import '../../styles/components/promo-bottom-sheet.css';

interface PromoBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromoBottomSheet = memo(function PromoBottomSheet({
  isOpen,
  onClose,
}: PromoBottomSheetProps) {
  const { t } = useTranslation();
  const { isPromoActive, is2x1Active, remainingLabel, remaining2x1Label, promo } = usePromo();
  const { coupons } = useCoupons() as any;

  const activeCoupons = (coupons || []).filter((c: Coupon) => c.activo && !c.oculto);
  const hasActiveCoupons = activeCoupons.length > 0;

  // Tabs: 'promo' | 'coupons'
  const [activeTab, setActiveTab] = useState<'promo' | 'coupons'>('promo');
  const [copied, setCopied] = useState<Record<number, boolean>>({});

  const showTabs = (isPromoActive || is2x1Active) && hasActiveCoupons;

  // Sync tab when opening or when availability changes
  useEffect(() => {
    if (isOpen) {
      if (isPromoActive || is2x1Active) setActiveTab('promo');
      else if (hasActiveCoupons) setActiveTab('coupons');
    }
  }, [isOpen, isPromoActive, is2x1Active, hasActiveCoupons]);

  const copyCoupon = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied((prev) => ({ ...prev, [id]: true }));
      window.setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 2500);
    } catch {
      // ignore
    }
  };

  const badgeLabel =
    (isPromoActive || is2x1Active) && (!showTabs || activeTab === 'promo')
      ? t('promo.activeBadge')
      : `${t('coupon.activeBadge')} (${activeCoupons.length})`;

  const headTitle =
    (isPromoActive || is2x1Active) && (!showTabs || activeTab === 'promo')
      ? t('promo.headTitle')
      : t('coupon.headTitle');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={headTitle}
      subtitle={badgeLabel}
      icon={<div className="promo-badge-dot" />}
      className="promo-sheet-container"
      height="auto"
    >
      <div className="promo-sheet-content">
        {/* Tabs Manager */}
        {showTabs && (
          <div className="promo-tabs">
            <button
              className={`promo-tab-btn ${activeTab === 'promo' ? 'active' : ''}`}
              onClick={() => setActiveTab('promo')}
            >
              {t('promo.tabLabel')}
            </button>
            <button
              className={`promo-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              {t('coupon.tabLabel')}
            </button>
          </div>
        )}

        <div className="promo-body">
          {/* Percentage Promo */}
          {isPromoActive && (!showTabs || activeTab === 'promo') && (
            <div className="promo-card-featured">
              <div className="promo-card-top">
                <div className="promo-info-main">
                  <span className="promo-lbl-eyebrow">{t('promo.specialOffer')}</span>
                  <span className="promo-value-main">{promo?.descuento_porcentaje}% OFF</span>
                </div>
                {remainingLabel && (
                  <div className="promo-timer-box">
                    <span className="timer-lbl">{t('promo.endsIn')}</span>
                    <div className="timer-divider" />
                    <span className="timer-val">{remainingLabel}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2x1 Promo */}
          {is2x1Active && (!showTabs || activeTab === 'promo') && (
            <div className="promo-card-featured promo-2x1">
              <div className="promo-card-top">
                <div className="promo-info-main">
                  <span className="promo-lbl-eyebrow">{t('promo.promo2x1Title')}</span>
                  <span className="promo-value-main">2X1</span>
                  <span className="promo-lbl-subtitle">{t('promo.promo2x1Subtitle')}</span>
                </div>
                {remaining2x1Label && (
                  <div className="promo-timer-box">
                    <span className="timer-lbl">{t('promo.endsIn')}</span>
                    <div className="timer-divider" />
                    <span className="timer-val">{remaining2x1Label}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasActiveCoupons && (!showTabs || activeTab === 'coupons') && (
            <div className="coupons-section">
              <span className="section-label-tiny">{t('coupon.availableList')}</span>
              <div className="coupons-scroll-list">
                {activeCoupons.map((coupon: Coupon) => (
                  <button
                    key={coupon.id}
                    className={`coupon-item-card ${copied[coupon.id] ? 'is-copied' : ''}`}
                    onClick={() => copyCoupon(coupon.codigo, coupon.id)}
                  >
                    <div className="coupon-item-header">
                      <span className="coupon-type-tag">{t('coupon.tag')}</span>
                      <span
                        className={`copy-success-indicator ${copied[coupon.id] ? 'visible' : ''}`}
                      >
                        <span className="success-dot" /> {t('coupon.copied')}
                      </span>
                    </div>
                    <div className="coupon-item-code">{coupon.codigo}</div>
                    <div className="coupon-item-meta">
                      <div className="meta-col">
                        <span className="meta-label">{t('coupon.discount')}</span>
                        <span className="meta-value accent">
                          {coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : `$${coupon.valor}`}
                        </span>
                      </div>
                      <div className="meta-col">
                        <span className="meta-label">{t('coupon.remaining')}</span>
                        <span className="meta-value">
                          {Math.max(0, coupon.limite_uso - coupon.usos_actuales)}
                        </span>
                      </div>
                    </div>
                    <div className="coupon-item-footer">
                      <svg className="footer-icon" viewBox="0 0 16 16">
                        {copied[coupon.id] ? (
                          <polyline
                            points="3 8 6.5 11.5 13 5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        ) : (
                          <path
                            d="M2 2h12v12H2z M5 8h6 M8 5v6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        )}
                      </svg>
                      {copied[coupon.id] ? t('coupon.copiedHint') : t('coupon.copyHint')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isPromoActive && !hasActiveCoupons && (
            <p className="promo-empty-msg">{t('promo.emptyNovedades')}</p>
          )}

          <p className="promo-footer-note">
            {(isPromoActive || is2x1Active) && !hasActiveCoupons
              ? t('promo.limitedTimeNote')
              : t('coupon.applyNote')}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
});
