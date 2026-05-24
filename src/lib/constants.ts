/** Fired on window after every localStorage save in db.ts */
export const DATA_CHANGED_EVENT = 'csu-ojt-data-changed';

export const STORAGE_KEYS = {
  data: 'csu_ojt_system_data',
  seedVersion: 'csu_ojt_seed_version',
  auth: 'csu_ojt_auth',
} as const;
