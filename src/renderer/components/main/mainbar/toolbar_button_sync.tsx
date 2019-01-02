
/* IMPORT */

import * as React from 'react';
import {connect} from 'overstated';
import Main from '@renderer/containers/main';
import ToolbarButton from './toolbar_button';
import { SyncStatus } from '@renderer/utils/sync';

/* TOOLBAR BUTTON SYNC */

const SyncButton = ({ syncStatus, startSync }) => {
  // While in development, todo remove this and build
  // a sync onboarding experience.
  if (syncStatus == SyncStatus.DISABLE) {
    return null;
  }

  var icon = (syncStatus == SyncStatus.DISABLE) ? "cloud_off_outline" :
             (syncStatus == SyncStatus.IDLE) ? "cloud_check" :
             (syncStatus == SyncStatus.SYNCING) ? "cloud_sync" :
             (syncStatus == SyncStatus.SYNCING_ERROR) ? "cloud_alert" :
             (syncStatus == SyncStatus.SYNCING_UPLOADING) ? "cloud_upload" :
             (syncStatus == SyncStatus.SYNCING_DOWNLOADING) ? "cloud_download" :
             "cloud_alert";
  return <ToolbarButton icon={icon} title="Cloud Sync" onClick={() => startSync()} />
};

/* EXPORT */

export default connect ({
  container: Main,
  selector: ({ container }) => ({
    syncStatus: container.sync.getStatus(),
    startSync: container.sync._init
  })
})( SyncButton );
