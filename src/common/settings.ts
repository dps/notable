
/* IMPORT */

import * as os from 'os';
import * as Store from 'electron-store';

/* SETTINGS */

const Settings = new Store ({
  name: '.notable',
  cwd: os.homedir (),
  defaults: {
    cwd: undefined,
    codemirror: {
      options: {
        lineWrapping: true
      }
    },
    sorting: {
      by: 'title',
      type: 'ascending'
    },
    sync: {
      status: 'disabled',
      service: 'gdrive',
      credentials: 'gdrive/client_secret',
      encrypt: false,
      encryptionKey: 'add a key here',
      remoteDir: 'notes',
    },
    tutorial: false // Did we import the tutorial yet?
  }
});

/* EXPORT */

export default Settings;
