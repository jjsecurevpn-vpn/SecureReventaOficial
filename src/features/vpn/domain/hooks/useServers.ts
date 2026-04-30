import { useCallback, useState } from 'react';
import type { Category, ServerConfig } from '@/core/types';
import { getSdk } from '../../api/dtunnelSdk';
import { appLogger } from '@/features/logs';

// ─── MOCK para entornos sin WebView nativo (desarrollo en browser) ────────────
// Definido una sola vez fuera del hook para evitar recreaciones y duplicación.
const MOCK_CATEGORIES: Category[] = [
  {
    name: 'MOCK A',
    sorter: 10,
    items: [
      {
        id: 'mock-a-1',
        name: 'Mock Server A1',
        description: '127.0.0.1',
        mode: 'udp',
        ip: '127.0.0.1',
        sorter: 1,
      },
      {
        id: 'mock-a-2',
        name: 'Mock Server A2',
        description: '127.0.0.2',
        mode: 'udp',
        ip: '127.0.0.2',
        sorter: 2,
      },
    ],
  },
  {
    name: 'MOCK B',
    sorter: 20,
    items: [
      {
        id: 'mock-b-1',
        name: 'Mock Server B1',
        description: '10.0.0.1',
        mode: 'udp',
        ip: '10.0.0.1',
        sorter: 1,
      },
      {
        id: 'mock-b-2',
        name: 'Mock Server B2',
        description: '10.0.0.2',
        mode: 'udp',
        ip: '10.0.0.2',
        sorter: 2,
      },
    ],
  },
  {
    name: 'ESTADOS UNIDOS 🇺🇸 [PREMIUM]',
    sorter: 30,
    items: [
      {
        id: '1004',
        name: 'PREMIUM 1 USA',
        description: 'Central US',
        mode: 'udp',
        ip: '100.100.100.1',
        sorter: 1,
      },
    ],
  },
];

/**
 * Hook para manejar la lista de servidores/categorías.
 */
export function useServers() {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [config, setConfigState] = useState<ServerConfig | null>(null);

  const loadCategorias = useCallback(() => {
    try {
      // Con SDK: getConfigs() ya parsea el JSON internamente y devuelve null si falla.
      const cats: Category[] | null = getSdk()?.config.getConfigs<Category[]>() ?? null;

      if (!cats || !cats.length) {
        appLogger.add('warn', '⚠️ DtGetConfigs devolvió lista vacía — usando MOCK');
        setCategorias(MOCK_CATEGORIES);
        return;
      }

      cats.sort((a, b) => (a.sorter || 0) - (b.sorter || 0));
      cats.forEach((c) => c.items?.sort((a, b) => (a.sorter || 0) - (b.sorter || 0)));
      appLogger.add('info', `✓ Servidores cargados: ${cats.length} categorías`);
      setCategorias(cats);
    } catch (_error) {
      appLogger.add('error', `❌ Error cargando categorías: ${String(_error)}`);
      setCategorias([]);
    }
  }, []);

  const setConfig = useCallback((c: ServerConfig) => {
    getSdk()?.config.setConfig(Number(c.id));
    setConfigState(c);
  }, []);

  const loadInitialConfig = useCallback(() => {
    // Con SDK: getDefaultConfig() parsea internamente.
    const cfg: ServerConfig | null = getSdk()?.config.getDefaultConfig<ServerConfig>() ?? null;

    if (!cfg) {
      appLogger.add('warn', '⚠️ No hay config inicial (getDefaultConfig es null)');
    } else {
      appLogger.add('info', `✓ Config inicial: ${cfg.name}`);
      setConfigState(cfg);
    }
  }, []);

  return {
    categorias,
    config,
    setConfig,
    setConfigState,
    loadCategorias,
    loadInitialConfig,
  };
}
