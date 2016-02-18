import OnsOrientation from '../orientation';
import { MODES } from './modes';


class CollapseDetection {
  activate(element) {}
  inactivate() {}
}


export class StaticCollapseDetection extends CollapseDetection {
  activate(element) {
    element._updateMode(MODES.COLLAPSE);
  }
}

export class StaticSplitDetection extends CollapseDetection {
  activate(element) {
    element._updateMode(MODES.SPLIT);
  }
}

export class OrientationCollapseDetection extends CollapseDetection {
  constructor(orientation) {
    super();

    if (orientation !== 'portrait' && orientation !== 'landscape') {
      throw new Error(`Invalid orientation: ${orientation}`);
    }

    this._boundOnOrientationChange = this._onOrientationChange.bind(this);
    this._targetOrientation = orientation;
  }

  activate(element) {
    this._element = element;
    OnsOrientation.on('change', this._boundOnOrientationChange);
    this._update(OnsOrientation.isPortrait());
  }

  _onOrientationChange(info) {
    this._update(info.isPortrait);
  }

  _update(isPortrait) {
    if (isPortrait && this._targetOrientation === 'portrait') {
      this._element._updateMode(MODES.COLLAPSE_MODE);
    } else if (!isPortrait && this._targetOrientation === 'landscape') {
      this._element._updateMode(MODES.COLLAPSE);
    } else {
      this._element._updateMode(MODES.SPLIT);
    }
  }

  inactivate() {
    this._element = null;
    OnsOrientation.off('change', this._boundOnOrientationChange);
  }
}


export class MediaQueryCollapseDetection extends CollapseDetection {
  constructor(query) {
    super();
    this._mediaQueryString = query;
    this._boundOnChange = this._onChange.bind(this);
  }

  _onChange(queryList) {
    this._element._updateMode(queryList.matches ? MODES.COLLAPSE : MODES.SPLIT);
  }

  activate(element) {
    this._element = element;
    this._queryResult = window.matchMedia(this._mediaQueryString);
    this._queryResult.addListener(this._boundOnChange);
    this._onChange(this._queryResult);
  }

  inactivate() {
    this._element = null;
    this._queryResult.removeListener(this._boundOnChange);
    this._queryResult = null;
  }
}
