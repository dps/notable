
/* IMPORT */

import * as is from 'electron-is';
import * as React from 'react';
import {connect} from 'overstated';
import Main from '@renderer/containers/main';
import AttachmentsButton from './toolbar_button_attachments';
import EditorButton from './toolbar_button_editor';
import FavoriteButton from './toolbar_button_favorite';
import OpenButton from './toolbar_button_open';
import PinButton from './toolbar_button_pin';
import SyncButton from './toolbar_button_sync';
import TagsButton from './toolbar_button_tags';
import TrashButton from './toolbar_button_trash';
import TrashPermanentlyButton from './toolbar_button_trash_permanently';

/* TOOLBAR */

const Toolbar = ({ hasNote, isFocus, isFullscreen }) => (
  <div id="mainbar-toolbar" className="layout-header centerer">
    <div className={`${!hasNote ? 'disabled' : ''} multiple grow`}>
      {!isFocus || isFullscreen || !is.macOS () ? null : (
        <div className="toolbar-semaphore-spacer"></div>
      )}
      <div className="multiple joined">
        <EditorButton />
        <TagsButton />
        <AttachmentsButton />
      </div>
      <div className="multiple joined">
        <FavoriteButton />
        <PinButton />
      </div>
      <div className="multiple joined">
        <TrashButton />
        <TrashPermanentlyButton />
      </div>
      <div className="spacer"></div>
      <SyncButton />
      <OpenButton />
    </div>
  </div>
);

/* EXPORT */

export default connect ({
  container: Main,
  selector: ({ container }) => ({
    hasNote: !!container.note.get (),
    isFocus: container.window.isFocus (),
    isFullscreen: container.window.isFullscreen ()
  })
})( Toolbar );
