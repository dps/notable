
/* IMPORT */

import {remote} from 'electron';
import {Container} from 'overstated';

/* WINDOW */

class Window extends Container<WindowState, MainCTX> {

  /* STATE */

  state = {
    omni: false,
    focus: false,
    fullscreen: remote.getCurrentWindow ().isFullScreen ()
  };

  /* API */

  isFullscreen = (): boolean => {

    return this.state.fullscreen;

  }

  toggleFullscreen = ( fullscreen: boolean = !this.state.fullscreen ) => {

    return this.setState ({ fullscreen });

  }

  isFocus = (): boolean => {

    return this.state.focus;

  }

  isOmni = (): boolean => {

    return this.state.omni;

  }

  toggleFocus = ( focus: boolean = !this.state.focus ) => {

    return this.setState ({ focus });

  }

  toggleOmni = ( omni: boolean = !this.state.omni ) => {

    return this.setState ({ omni });

  }

}

/* EXPORT */

export default Window;
