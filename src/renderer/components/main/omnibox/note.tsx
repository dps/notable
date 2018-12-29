
/* IMPORT */

import * as React from 'react';
import {connect} from 'overstated';
import Markdown from '@renderer/utils/markdown';
import Main from '@renderer/containers/main';

/* NOTE */

const Note = ({ note, style, title, hasAttachments, isActive, isSelected, isDeleted, isFavorited, isPinned, isMultiEditorEditing, set, toggleNote, container }) => {

  const html = Markdown.render ( title ),
        onClick = event => {
          Svelto.Keyboard.keystroke.hasCtrlOrCmd ( event ) ? toggleNote ( note ) : set ( note, true );
          container.window.toggleOmni();
        };

  var cstyle = {...style, textAlign: "left"};
  return (
    <div style={cstyle} className={`note-button ${!isMultiEditorEditing && isActive ? 'label sbutton' : 'button'} ${( isMultiEditorEditing ? isSelected : isActive ) ? 'active' : ''} small fluid compact circular`} data-checksum={note.checksum} data-filepath={note.filePath} data-deleted={isDeleted} data-favorited={isFavorited} onClick={onClick} tabIndex={0}> {/* tabIndex is need in order to have the notes focusable, we use that for navigating with arrow */}
      <span style={{width: "100%", marginLeft: "10px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}} className="title" dangerouslySetInnerHTML={{ __html: html }}></span>
    </div>
  );

};

/* EXPORT */

export default connect ({
  container: Main,
  selector: ({ container, note, style }) => ({
    note, style,
    title: container.note.getTitle ( note ),
    hasAttachments: !!container.note.getAttachments ( note ).length,
    isActive: ( container.note.get () === note ),
    isSelected: container.multiEditor.isNoteSelected ( note ),
    isDeleted: container.note.isDeleted ( note ),
    isFavorited: container.note.isFavorited ( note ),
    isPinned: container.note.isPinned ( note ),
    isMultiEditorEditing: container.multiEditor.isEditing (),
    set: container.note.set,
    toggleNote: container.multiEditor.toggleNote,
    container: container
  })
})( Note );
