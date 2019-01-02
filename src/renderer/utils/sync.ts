
/* ENUMS */

enum SyncStatus {
  DISABLE = 'disabled',
  SYNCING = 'syncing',
  SYNCING_UPLOADING = 'uploading',
  SYNCING_DOWNLOADING = 'downloading',
  SYNCING_ERROR = 'error',
  IDLE = 'idle'
};

/* EXPORT */

export {SyncStatus};
