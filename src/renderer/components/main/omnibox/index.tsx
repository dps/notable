
/* IMPORT */

import * as React from 'react';
import {VariableSizeList} from 'react-window';
import {connect} from 'overstated';
import Main from '@renderer/containers/main';
import Note from './note';


/* OMNIBOX */

class Omnibox extends React.Component<any> {

  listRef: VariableSizeList;

  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }

  componentDidMount () {
    $.$window.on ( 'notes-scroll-to-item', this.scrollToItem );
  }

  componentWillUnmount () {
    $.$window.off ( 'notes-scroll-to-item', this.scrollToItem );
  }

  scrollToItem = ( event, index ) => {
    console.log("omni scrollto " + index);
    if ( !this.listRef.current ) return;
    this.listRef.current.scrollToItem ( index, 'auto' );
  };

  render() {
    const {isOmni, setQuery, notes} = this.props;

    if ( !isOmni ) {
      return null;
    }
  
    const omnichange = (e) => {
      setQuery ( e.currentTarget.value );
    };

    return (
      <div className="modal card bordered open show xs-7" id="omnibox-modal">
        <form className="multiple joined no-separators grow">
          <input autoFocus type="search" className="bordered grow" placeholder="🚀" defaultValue="" onInput={omnichange} />
          <div className="label bordered xsmall" title="Search">
            <i className="icon">magnify</i>
          </div>
        </form>
        <VariableSizeList ref={this.listRef} overscanCount={3} className="layout-content react-window-list" height={200} width="auto" itemCount={notes.length} estimatedItemSize={20} itemSize={index => !index ? 28 : ( index === ( notes.length - 1 ) ? 23 : 28 )} itemKey={index => notes[index].filePath}>
          {({ index, style }) => (
            <Note style={style} note={notes[index]} />
          )}
        </VariableSizeList>
      </div>
    );
  }

};

/* EXPORT */

export default connect ({
  container: Main,
  selector: ({ container }) => ({
    isOmni: container.window.isOmni (),
    setQuery: container.search.setQuery,
    notes: container.search.getNotes ()
  })
})( Omnibox );
