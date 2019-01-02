
/* IMPORT */

import * as _ from 'lodash';
import * as crypto from 'crypto';
import * as globby from 'globby';

import {Container} from 'overstated';
import Config from '@common/config';
import File from '@renderer/utils/file';
import Settings from '@common/settings';
import {SyncStatus} from '@renderer/utils/sync';
import Utils from '@renderer/utils/utils';
import * as googleauth from 'google-auth-wrapper';
import * as gdriveclient from 'google-drive-wrapper';

/* SORTING */

class Sync extends Container<SyncState, MainCTX> {

  /* STATE */

  state = {
    status: Config.sync.status,
    service: Config.sync.service,
    credentials: Config.sync.credentials,
    encrypt: Config.sync.encrypt,
    encryptionKey: Config.sync.encryptionKey,
    remoteDir: Config.sync.remoteDir,
    ops: [] as SyncOp[],
  };

  /* API */

  getStatus = (): SyncStatus => {

    return this.state.status;

  }

  setStatus = async ( status: SyncStatus ) => {

    Settings.set ( 'sync.status', status );

    await this.setState ({ status });

  }

  _addOp = async ( op: SyncOp ) => {
    const ops = [op].concat(this.state.ops);
    await this.setState({ops});
  }

  _popOp = async() : Promise<SyncOp | undefined> => {
    return this.state.ops.pop();
  }

  _doDownload = async(remoteMetadata : object) => {
    console.log("sync: download " + remoteMetadata);
    await this.setStatus(SyncStatus.SYNCING_DOWNLOADING);
    const sync = this;
    const fid = remoteMetadata['id'];
    const name = remoteMetadata['name'];

    googleauth.execute(Config.cwd, this.state.credentials, function(auth, google) {
      var wrapper = new gdriveclient(auth, google, sync.state.encryptionKey);
      wrapper.downloadFile(fid, Config.cwd + '/' + this.state.remoteDir + '/' + name,
        function(err, metadata) {
        if(err) {
          console.log(err);
          sync.setStatus(SyncStatus.SYNCING_ERROR);
        } else {
          console.log('Downloaded ' + name);
          console.log(metadata);
          sync.setStatus(SyncStatus.SYNCING);
        }
      });
    });

  }

  _md5Checksum = async (filePath: string): Promise<string | undefined> => {
    const content = await File.readRaw ( filePath );
    if (!content) {
      return;
    }
    var md5sum = crypto.createHash('md5');
    md5sum.update(content);
    var fileHash = md5sum.digest('hex');
    return fileHash;
  }

  _uploadNew = async(filePath: string, note: NoteObj) => {
    console.log("sync: new upload " + filePath);
    await this.setStatus(SyncStatus.SYNCING);
    const sync = this;

    googleauth.execute(Config.cwd, this.state.credentials, function(auth, google) {
      var wrapper = new gdriveclient(auth, google, sync.state.encryptionKey);
      const name = filePath.substr(filePath.lastIndexOf('/') + 1);
      wrapper.getMetaForFilename('/' + sync.state.remoteDir, function(err, parentMeta) {
        if (err !== null) {
          console.log('Invalid directory path' + err);
          sync.setStatus(SyncStatus.SYNCING_ERROR);
          return;
        } else {
          sync.setStatus(SyncStatus.SYNCING_UPLOADING);
          wrapper.uploadFile(name, filePath,
            {parent: parentMeta.id, compress: false, encrypt: false,
              convert: false, mimeType: "text/markdown"},
              function(err, metadata) {
              if(err) {
                console.log(err);
                sync.setStatus(SyncStatus.SYNCING_ERROR);
              } else {
                console.log('Uploaded ' + name);
                console.log(metadata);
                sync.ctx.note.setRemoteId(note, metadata['id'])
                sync.setStatus(SyncStatus.IDLE);
              }
            });
        }
    });
  });
}

_uploadUpdate = async(filePath: string, note: NoteObj, remoteMetadata: object) => {
    console.log("sync: update " + filePath);
    await this.setStatus(SyncStatus.SYNCING_UPLOADING);
    const sync = this;
    const fid = note.metadata.remoteId;

    googleauth.execute(Config.cwd, this.state.credentials, function(auth, google) {
      var wrapper = new gdriveclient(auth, google, sync.state.encryptionKey);

      wrapper.updateFile(fid, remoteMetadata['name'], filePath,
      {parent: remoteMetadata['parents'][0], compress: false, encrypt: false,
        convert: false, mimeType: remoteMetadata['mimeType']},
        function(err, metadata) {
        if(err) {
          console.log(err);
          sync.setStatus(SyncStatus.SYNCING_ERROR);
        } else {
          console.log('Uploaded ' + name);
          console.log(metadata);
          sync.setStatus(SyncStatus.SYNCING);
        }
      });
    });
  }

  _updateFromRemoteMetaData = async(metadata: object) => {
    for (var i in metadata) {
      const {name, id, md5Checksum} = metadata[i];
      const remoteMetadata = metadata[i];

      const localPath = Config.cwd + '/' + this.state.remoteDir  + '/' + name;
      const note = this.ctx.note.get(localPath);
      if (note) {
        if (note.metadata.remoteId != id) {
          await this.ctx.note.setRemoteId(note, id);
        }
        // compute local MD5 checksum
        this._md5Checksum(localPath).then((localMd5) => {
          if (localMd5 != md5Checksum) {
            console.log('localMd5: ' + localMd5 + ' remote: ' + md5Checksum);
            // Files differ, merge. Current resolution is extremely naive
            // and clobbers the remote file with local. TODO: merge changes
            console.log('uploading local update to ' + localPath);
            this._uploadUpdate(localPath, note, remoteMetadata);
          }
        })

      } else {
        console.log(name + ' doesnt exist locally, doDownload');
        await this._doDownload(metadata[i]);
      }
    }

  }

  _sync = async() => {

    while (this.state.ops.length > 0) {
      this._popOp().then(op => {
        if (op) {
          console.log("sync: " + op.action + " " + op.filePath);
        }
      });
    }

  }

  _init = async() => {
    console.log('sync: init ' + this.state.remoteDir);
    await this.setStatus(SyncStatus.SYNCING);
    this._addOp({action: 'listRemotes', filePath: '', remoteId: ''}).then(() => this._sync());

    const sync = this;
    googleauth.execute(Config.cwd, this.state.credentials, function(auth, google) {
      var wrapper = new gdriveclient(auth, google, sync.state.encryptionKey);
      wrapper.listFiles(sync.state.remoteDir, function(err, metadata) {
        if(err) {
          sync.setStatus(SyncStatus.SYNCING_ERROR);
        } else {
          sync.setStatus(SyncStatus.IDLE);
          sync._updateFromRemoteMetaData(metadata);
        }
      });
    });

    // ensure all notes got synced in the past (recover from offline periods)
    const filePaths = Utils.globbyNormalize ( await globby ( Config.notes.globs, { cwd: Config.notes.path, absolute: true } ) );
    await Promise.all ( filePaths.map ( async filePath => {
      const note = this.ctx.note.get(filePath);
      if (note && !note.metadata.remoteId) {
        console.log("sync: " + filePath + " exists locally but not remotely, uploading");
        this._uploadNew(filePath, note);
      }
    }));
  }

}

/* EXPORT */

export default Sync;
