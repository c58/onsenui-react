/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import ReactDOM from 'react-dom';
import NavigatorTransitionAnimator from './animator';
import util from '../util';
import animit from '../animit';

/**
 * Slide animator for navigator transition like iOS's screen slide transition.
 */
export default class IOSSlideNavigatorTransitionAnimator extends NavigatorTransitionAnimator {

  constructor(options) {
    options = util.extend({
      duration: 0.4,
      timing: 'cubic-bezier(.1, .7, .1, 1)',
      delay: 0
    }, options || {});

    super(options);

    this.backgroundMask = util.createElement(`
      <div style="position: absolute; width: 100%; height: 100%;
        background-color: black; opacity: 0;"></div>
    `);
  }

  _decompose(page) {
    const toolbar = page._getToolbarElement();
    const left = toolbar && ReactDOM.findDOMNode(toolbar._getToolbarLeftItemsElement());
    const right = toolbar && ReactDOM.findDOMNode(toolbar._getToolbarRightItemsElement());
    const pageLabels = [];
    const other = [];

    const decomposeToolbarSide = function(side) {
      if (side && side.children.length > 0) {
        const elements = side.children;
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].nodeName.toLowerCase() === 'ons-back-button') {
            const backButtonChildren = elements[i].children;
            for (let j = 0; j < backButtonChildren.length; j++) {
              if (backButtonChildren[j].className === 'back-button__icon') {
                other.push(backButtonChildren[j]);
              } else {
                pageLabels.push(backButtonChildren[j]);
              }
            }
          } else {
            other.push(elements[i]);
          }
        }
      }
    };

    decomposeToolbarSide(left);
    decomposeToolbarSide(right);

    if (toolbar) {
      const centerElem = toolbar._getToolbarCenterItemsElement();
      if (centerElem) {
        pageLabels.push(ReactDOM.findDOMNode(centerElem));
      }
    }

    return {
      pageLabels: pageLabels,
      other: other,
      content: ReactDOM.findDOMNode(page._getContentElement()),
      background: ReactDOM.findDOMNode(page._getBackgroundElement()),
      toolbar: toolbar && ReactDOM.findDOMNode(toolbar),
      bottomToolbar: ReactDOM.findDOMNode(page._getBottomToolbarElement())
    };
  }

  _shouldAnimateToolbar(enterPage, leavePage) {
    const bothPageHasToolbar =
      enterPage._canAnimateToolbar() && leavePage._canAnimateToolbar();

    var noMaterialToolbar = bothPageHasToolbar &&
      !enterPage._getToolbarElement().props.material &&
      !leavePage._getToolbarElement().props.material;

    return bothPageHasToolbar && noMaterialToolbar;
  }

  _filterNotNull(elems) {
    return elems.filter(x => x);
  }

  /**
   * @param {Object} enterPage
   * @param {Object} leavePage
   * @param {Function} callback
   */
  push(enterPage, leavePage, callback) {
    this.backgroundMask.remove();
    const leavePageElem = ReactDOM.findDOMNode(leavePage);
    const enterPageElem = ReactDOM.findDOMNode(enterPage);
    leavePageElem.parentNode.insertBefore(this.backgroundMask, leavePageElem.nextSibling);

    const enterPageDecomposition = this._decompose(enterPage);
    const leavePageDecomposition = this._decompose(leavePage);

    const delta = (() => {
      const rect = leavePageElem.getBoundingClientRect();
      return Math.round(((rect.right - rect.left) / 2) * 0.6);
    })();

    const maskClear = animit(this.backgroundMask)
      .saveStyle()
      .queue({
        opacity: 0,
        transform: 'translate3d(0, 0, 0)'
      })
      .wait(this.delay)
      .queue({
        opacity: 0.1
      }, {
        duration: this.duration,
        timing: this.timing
      })
      .restoreStyle()
      .queue((done) => {
        this.backgroundMask.remove();
        done();
      });

    const shouldAnimateToolbar = this._shouldAnimateToolbar(enterPage, leavePage);

    if (shouldAnimateToolbar) {
      enterPageElem.style.zIndex = 'auto';
      leavePageElem.style.zIndex = 'auto';

      animit.runAll(

        maskClear,

        animit(this._filterNotNull([
          enterPageDecomposition.content,
          enterPageDecomposition.bottomToolbar,
          enterPageDecomposition.background
        ]))
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)',
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)',
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(enterPageDecomposition.toolbar)
          .saveStyle()
          .queue({
            css: {
              background: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderColor: 'rgba(0, 0, 0, 0)'
            },
            duration: 0
          })
          .wait(this.delay + 0.3)
          .restoreStyle({
            duration: 0.1,
            transition:
              'background-color 0.1s linear, ' +
              'border-color 0.1s linear'
          }),

        animit(this._filterNotNull(enterPageDecomposition.pageLabels))
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3d(' + delta + 'px, 0, 0)',
              opacity: 0
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(this._filterNotNull(enterPageDecomposition.other))
          .saveStyle()
          .queue({
            css: {opacity: 0},
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {opacity: 1},
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(this._filterNotNull([
          leavePageDecomposition.content,
          leavePageDecomposition.bottomToolbar,
          leavePageDecomposition.background
        ]))
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3D(0, 0, 0)',
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)',
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle()
          .queue(function(done) {
            enterPageElem.style.zIndex = '';
            leavePageElem.style.zIndex = '';
            callback();
            done();
          }),

        animit(this._filterNotNull(leavePageDecomposition.pageLabels))
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3d(-' + delta + 'px, 0, 0)',
              opacity: 0,
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(this._filterNotNull(leavePageDecomposition.other))
          .saveStyle()
          .queue({
            css: {opacity: 1},
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {opacity: 0},
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle()

      );

    } else {

      enterPageElem.style.zIndex = 'auto';
      leavePageElem.style.zIndex = 'auto';

      animit.runAll(

        maskClear,

        animit(enterPageElem)
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)',
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)',
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(leavePageElem)
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3D(0, 0, 0)'
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle()
          .queue(function(done) {
            enterPageElem.style.zIndex = '';
            leavePageElem.style.zIndex = '';
            callback();
            done();
          })
      );

    }
  }

  /**
   * @param {Object} enterPage
   * @param {Object} leavePage
   * @param {Function} done
   */
  pop(enterPage, leavePage, done) {
    this.backgroundMask.remove();
    const leavePageElem = ReactDOM.findDOMNode(leavePage);
    const enterPageElem = ReactDOM.findDOMNode(enterPage);
    enterPageElem.parentNode.insertBefore(this.backgroundMask, enterPageElem.nextSibling);

    const enterPageDecomposition = this._decompose(enterPage);
    const leavePageDecomposition = this._decompose(leavePage);

    const delta = (function() {
      const rect = leavePageElem.getBoundingClientRect();
      return Math.round(((rect.right - rect.left) / 2) * 0.6);
    })();

    const maskClear = animit(this.backgroundMask)
      .saveStyle()
      .queue({
        opacity: 0.1,
        transform: 'translate3d(0, 0, 0)'
      })
      .wait(this.delay)
      .queue({
        opacity: 0
      }, {
        duration: this.duration,
        timing: this.timing
      })
      .restoreStyle()
      .queue((done) => {
        this.backgroundMask.remove();
        done();
      });

    const shouldAnimateToolbar = this._shouldAnimateToolbar(enterPage, leavePage);

    if (shouldAnimateToolbar) {

      enterPageElem.style.zIndex = 'auto';
      leavePageElem.style.zIndex = 'auto';

      animit.runAll(

        maskClear,

        animit(this._filterNotNull([
          enterPageDecomposition.content,
          enterPageDecomposition.bottomToolbar,
          enterPageDecomposition.background
        ]))
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)',
              opacity: 0.9
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(this._filterNotNull(enterPageDecomposition.pageLabels))
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3d(-' + delta + 'px, 0, 0)',
              opacity: 0
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(enterPageDecomposition.toolbar)
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(this._filterNotNull(enterPageDecomposition.other))
          .saveStyle()
          .queue({
            css: {opacity: 0},
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {opacity: 1},
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(this._filterNotNull([
          leavePageDecomposition.content,
          leavePageDecomposition.bottomToolbar,
          leavePageDecomposition.background
        ]))
          .queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          })
          .wait(0)
          .queue(function(finish) {
            enterPageElem.style.zIndex = '';
            leavePageElem.style.zIndex = '';
            done();
            finish();
          }),

        animit(this._filterNotNull(leavePageDecomposition.other))
          .queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 0,
            },
            duration: this.duration,
            timing: this.timing
          }),

        animit(leavePageDecomposition.toolbar)
          .queue({
            css: {
              background: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              borderColor: 'rgba(0, 0, 0, 0)'
            },
            duration: 0
          }),

        animit(this._filterNotNull(leavePageDecomposition.pageLabels))
          .queue({
            css: {
              transform: 'translate3d(0, 0, 0)',
              opacity: 1.0
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3d(' + delta + 'px, 0, 0)',
              opacity: 0,
            },
            duration: this.duration,
            timing: this.timing
          })
      );
    } else {

      enterPageElem.style.zIndex = 'auto';
      leavePageElem.style.zIndex = 'auto';

      animit.runAll(

        maskClear,

        animit(enterPageElem)
          .saveStyle()
          .queue({
            css: {
              transform: 'translate3D(-25%, 0px, 0px)',
              opacity: 0.9
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)',
              opacity: 1.0
            },
            duration: this.duration,
            timing: this.timing
          })
          .restoreStyle(),

        animit(leavePageElem)
          .queue({
            css: {
              transform: 'translate3D(0px, 0px, 0px)'
            },
            duration: 0
          })
          .wait(this.delay)
          .queue({
            css: {
              transform: 'translate3D(100%, 0px, 0px)'
            },
            duration: this.duration,
            timing: this.timing
          })
          .queue(function(finish) {
            enterPageElem.style.zIndex = '';
            leavePageElem.style.zIndex = '';
            done();
            finish();
          })
      );
    }
  }
}
