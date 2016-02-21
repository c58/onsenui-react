import invariant from 'invariant';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import StaticContainer from 'react-static-container';
import { isReactChildren } from 'react-router/lib/RouteUtils';
import { compilePattern } from 'react-router/lib/PatternUtils';
import getRouteParams from 'react-router/lib/getRouteParams';
import RouterContext from 'react-router/lib/RouterContext';
import AnimatorFactory from '../animator-factory';
import platform from '../platform';
import IOSSlideAnimator from './ios-slide-animator';
import SimpleSlideAnimator from './simple-slide-animator';
import FadeSlideAnimator from './fade-slide-animator';
import LeftSlideAnimator from './lift-slide-animator';
import NoneSlideAnimator from './none-slide-animator';
import NavigatorTransitionAnimator from './animator';


// Internals
const _animatorDict = {
  'default': platform.isAndroid() ? SimpleSlideAnimator : IOSSlideAnimator,
  'slide': platform.isAndroid() ? SimpleSlideAnimator : IOSSlideAnimator,
  'simpleslide': SimpleSlideAnimator,
  'lift': LeftSlideAnimator,
  'fade': FadeSlideAnimator,
  'none': NoneSlideAnimator
};

/**
 * Animated navigator component
 */
class FlatNavigator extends Component {
  static childContextTypes = {
    location: React.PropTypes.object
  };

  constructor(props, context) {
    super(props, context)
    this.state = { children: props.route.children };
    this.queue = [];
    this.transitionActive = false;
    this._animatorFactory = new AnimatorFactory({
      animators: _animatorDict,
      baseClass: NavigatorTransitionAnimator,
      baseClassName: 'NavigatorTransitionAnimator',
      defaultAnimation: 'default'
    });
  }

  componentWillMount() {
    const curPageIdx = this.state.children.length - 1;
    this.animateBetween = [curPageIdx, curPageIdx];
  }

  componentWillReceiveProps(nextProps) {
    this.queue.push(nextProps);
    this._maybeProcessQueue();
  }

  componentDidUpdate() {
    const [ from, to ] = this.animateBetween;

    if (from !== to) {
      const fromElem = this.refs[from];
      const toElem = this.refs[to];
      const direction = to < from ? 'pop' : 'push';
      this._runAnimation(direction, toElem, fromElem);
    } else {
      this.transitionActive = false;
      this._maybeProcessQueue();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Component is never updated by new props.
    // Only manually when transition ends
    return false;
  }

  getChildContext() {
    return { location: this.props.location }
  }

  _runAnimation(direction, toElem, fromElem) {
    const optsCont = direction === 'push' ? toElem : fromElem;
    const animator = this._animatorFactory.newAnimator(optsCont.props.route);
    animator[direction](
      toElem,
      fromElem,
      this._handleEndAnimation.bind(this)
    );
  }

  _maybeProcessQueue() {
    if (!this.transitionActive && this.queue.length) {
      this.transitionActive = true;
      const nextProps = this.queue.shift();
      const starter = this._startTransition.bind(this, nextProps);
      setTimeout(starter, 1000 / 60);
    }
  }

  _startTransition(nextProps) {
    const nextChildren = nextProps.route.children;
    const prevChildren = this.state.children;

    this.animateBetween = [
      prevChildren.length - 1,
      nextChildren.length - 1,
    ];

    if (prevChildren.length > nextChildren.length) {
      Array.prototype.push.apply(
        nextChildren,
        prevChildren.slice(nextChildren.length)
      );
    }
    
    this.setState({ children: nextChildren });
    this.forceUpdate();
  }

  _handleEndAnimation() {
    const currPageIdx = this.animateBetween[1];
    const newChildren = this.state.children.slice(0, currPageIdx + 1);
    this.animateBetween = [currPageIdx, currPageIdx];
    this.setState({ children: newChildren });
    this.forceUpdate();
  }

  _shouldUpdatePage(idx) {
    return (
      this.animateBetween[1] === idx ||
      this.animateBetween[0] === idx
    );
  }

  _isPageVisible(idx) {
    return (
      this.animateBetween[0] === idx ||
      this.animateBetween[1] === idx
    );
  }

  render() {
    const { children } = this.state;
    return (
      <div className="ons-react-navigator">
        {children.map((x, i) => {
          const reffedChild = React.cloneElement(x, {ref: i});
          return (
            <div key={i} style={{display: this._isPageVisible(i) ? 'block' : 'none'}}>
              <StaticContainer shouldUpdate={this._shouldUpdatePage(i)}>
                {reffedChild}
              </StaticContainer>
            </div>
          );
        })}
      </div>
    );
  }
}


/**
 * Context for using animated OnsPage changes for routes
 * with `flat` prop.
 */
export default class OnsNavigatorContext extends RouterContext {
  makeLocationWithPrevious() {
    const { history, location, routes, params, components } = this.props
    const pathname = decodeURIComponent(location.pathname);
    const lastPath = routes[routes.length - 1].path;
    if (lastPath) {
      let { regexpSource, paramNames, tokens } = compilePattern(lastPath);
      const match = pathname.match(new RegExp(regexpSource + '/?$', 'i'));
      location.prevPath = match && pathname.substr(0, match.index - 1);
    }
  }

  getFlattenComponents() {
    const { history, location, routes, params, components } = this.props
    const result = [];
    let flatChildren = null;

    components.forEach((x, i) => {
      const route = routes[i];

      if (route.flat && !flatChildren) {
        flatChildren = [];
      }
      if (flatChildren) {
        invariant(
          typeof x !== 'object',
          'Each element of flat navigation must be a single component'
        );

        const routeParams = getRouteParams(route, params)
        const props = {
          history,
          location,
          params,
          route,
          routeParams,
          routes
        }
        const element = this.createElement(x, props);
        flatChildren.push(element);
      } else {
        result.push(x);
      }
    });

    if (flatChildren) {
      result.push(FlatNavigator);
      routes[result.length - 1] = {
        children: flatChildren
      }
    }

    return result;
  }

  render() {
    this.makeLocationWithPrevious();
    const flattenComponents = this.getFlattenComponents();
    return <RouterContext {...this.props} components={flattenComponents} />
  }
}
