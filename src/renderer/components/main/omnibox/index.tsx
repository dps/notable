
/* IMPORT */

import * as React from 'react';
import {VariableSizeList} from 'react-window';
import {connect} from 'overstated';
import Main from '@renderer/containers/main';
import Note from './note';


/* SIDEBAR */



const Omnibox = ({ isOmni, setQuery, notes }) => {

  const omnichange = (e) => {
    console.log(e);
    setQuery ( e.currentTarget.value );
   };

  if ( !isOmni ) return null;

  return (
    <div className="modal card bordered open show xs-7" id="omnibox-modal">
      <form className="multiple joined no-separators grow">
        <input autoFocus type="search" className="bordered grow" placeholder="🚀" defaultValue="" onInput={omnichange}/>
        <div className="label bordered xsmall" title="Search">
          <i className="icon">magnify</i>
        </div>
      </form>
      <VariableSizeList overscanCount={3} className="layout-content react-window-list" height={200} width="auto" itemCount={notes.length} estimatedItemSize={20} itemSize={index => !index ? 28 : ( index === ( notes.length - 1 ) ? 23 : 28 )} itemKey={index => notes[index].filePath}>
        {({ index, style }) => (
          <Note style={style} note={notes[index]} />
        )}
      </VariableSizeList>
    </div>
  );

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
