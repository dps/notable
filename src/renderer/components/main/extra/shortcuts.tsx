
/* IMPORT */

import {connect} from 'overstated';
import {Component} from 'react-component-renderless';
import Main from '@renderer/containers/main';

/* SHORTCUTS */

class Shortcuts extends Component<{ container: IMain }, undefined> {

  /* VARIABLES */

  shortcuts = {
    'ctmd+shift+e': [this.__editorToggle, true],
    'ctmd+shift+p': [this.__editorToggle, true],
    'ctrl+shift+p': [this.__editorToggle, true],
    'ctmd+s': [this.__editorSave, true],
    'ctmd+k': [this.__showOmni, true],
    'esc': [this.__editorsEscape, true],
    'up': [this.__searchPrevious, false],
    'left': [this.__searchPrevious, false],
    'down': [this.__searchNext, false],  
    'right': [this.__searchNext, false],
    'enter': [this.__enter, true],
    'ctrl+page_down': [this.__searchNext, true],
    'ctrl+page_up': [this.__searchPrevious, true],
    'ctrl+alt+page_down': [this.__tagNext, true],
    'ctrl+alt+page_up': [this.__tagPrevious, true]
  };

  /* SPECIAL */

  componentDidMount () {

    $.$document.on ( 'keydown', this.__keydown );

  }

  componentWillUnmount () {

    $.$document.off ( 'keydown', this.__keydown );

  }

  /* KEYDOWN */

  __keydown = event => {

    const isEditable = $.isEditable ( document.activeElement );
    const isOmni = this.props.container.window.isOmni();

    for ( let shortcuts in this.shortcuts ) {

      const [handler, hasPriority] = this.shortcuts[shortcuts];

      if ( !hasPriority && !isOmni && isEditable ) continue;

      const shortcutArr = shortcuts.split ( ',' );

      for ( let i = 0, l = shortcutArr.length; i < l; i++ ) {

        const shortcut = shortcutArr[i];

        if ( !Svelto.Keyboard.keystroke.match ( event, shortcut ) ) continue;

        if ( handler.call ( this ) !== null ) {

          event.preventDefault ();
          event.stopImmediatePropagation ();

        }

        return;

      }

    }

  }

  /* HANDLERS */

  __editorToggle () {

    this.props.container.editor.toggleEditing ();

  }

  __editorSave () {

    if ( !this.props.container.editor.isEditing () ) return null;

    this.props.container.editor.toggleEditing ();

    return; //TSC

  }

  __editorsEscape () {

    if ( this.props.container.window.isOmni()) return this.props.container.window.toggleOmni();

    if ( this.props.container.attachments.isEditing () || this.props.container.tags.isEditing () ) return null;

    if ( this.props.container.multiEditor.isEditing () ) return this.props.container.multiEditor.selectClear ();

    if ( this.props.container.editor.isEditing () ) return this.props.container.editor.toggleEditing ( false );

    return null;

  }

  __showOmni() {
    if (this.props.container.window.isFocus()) {
      this.props.container.window.toggleOmni();
    } else {
      this.props.container.search.focus();
    }
  }

  __enter() {
    if (this.props.container.window.isOmni()) {
      return this.props.container.window.toggleOmni();
    }
    return null;
  }

  __searchPrevious () {

    this.props.container.search.previous ();

  }

  __searchNext () {

    this.props.container.search.next ();

  }

  __tagNext () {

    this.props.container.tag.next ();

  }

  __tagPrevious () {

    this.props.container.tag.previous ();

  }

}

/* EXPORT */

export default connect ({
  container: Main,
  shouldComponentUpdate: false
})( Shortcuts );
