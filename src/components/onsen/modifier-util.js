import React from 'react';
import classNames from 'classnames';


// Internals
let _defaultModifier = '';

export function _createClassWithModifier(original, others, modifiers, scheme, isRoot) {
  let modPatterns;
  if (isRoot && scheme['']) {
    modPatterns = [scheme['']];
  } else if (original) {
    modPatterns = original.split(' ').map(x => scheme[x.trim()]).filter(x => x);
  }

  let modClasses = '';
  if (modPatterns && modPatterns.length) {
    modPatterns.forEach(p => {
      modifiers.forEach(m => {
        modClasses += ' ' + p.replace('*', m);
      });
    });
  }

  return classNames(original, others, modClasses.trim());
}


/**
 * Apply modifier deeply to a component by given scheme
 * @param  {Object}  props     component props
 * @param  {Object}  scheme
 * @param  {Component}  component
 * @return {Component}
 */
export function applyModifiers(props, scheme, deepLevel, component, currLevel = 0, isRoot = true) {
  if (currLevel > deepLevel) {
    return component;
  }

  let modifiersStr = _defaultModifier;
  modifiersStr += props.modifier ? ' ' + props.modifier.trim() : '';
  const modifiers = modifiersStr.split(' ').filter(x => x);

  const res = React.Children.map(component, (x) => {
    if (x) {
      const modifiedProps = {};

      let classField = 'className';
      if (typeof x.type === 'string' && x.type.substr(0, 4) === 'ons-') {
        classField = 'class';
      }

      const originalClass = x.props[classField];
      const otherClasses = classField === 'class' ? x.props.className : '';
      modifiedProps[classField] = _createClassWithModifier(originalClass,
        otherClasses, modifiers, scheme, isRoot);

      if (
        modifiers.length &&
        (x.props && x.props.children) &&
        (React.isValidElement(x.props.children) || Array.isArray(x.props.children)) &&
        !x.props.noModifiers
      ) {
        modifiedProps.children = applyModifiers(props, scheme, deepLevel,
          x.props.children, currLevel + 1, false);
      }

      return React.cloneElement(x, modifiedProps);
    }
  });

  return isRoot ? res[0] : res;
}

/**
 * Sets default modifier that will be applied to all components
 * in the app
 * @param {String} modifier
 */
export function setDefaultModifier(modifier) {
  _defaultModifier = modifier;
}
