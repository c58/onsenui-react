import React from 'react';
import { applyModifiers } from '../modifier-util';
import classNames from 'classnames';


const scheme = {
  'text-input': 'text-input--*',
  'text-input__label': 'text-input--*__label',
  'radio-button': 'radio-button--*',
  'radio-button__input': 'radio-button--*__input',
  'radio-button__checkmark': 'radio-button--*__checkmark',
  'checkbox': 'checkbox--*',
  'checkbox__input': 'checkbox--*__input',
  'checkbox__checkmark': 'checkbox--*__checkmark'
};

export default class OnsInput extends React.Component {
  render() {
    const { name, checked, onChange, type, id, ...props } = this.props;
    const labelClassName = type === 'text-input'
      ? 'text-input__container' : type;
    const helperClassName = type === 'text-input'
      ? 'text-input__label' : `${type}__checkmark`;
    const inputClassName = type === 'text-input'
      ? 'text-input' : `${type}__input`;
    const inputType = type.split('-')[0];

    return applyModifiers(this.props, scheme, 3,
      <ons-input>
        <label className={labelClassName}>
          <span>
            <input className={inputClassName} name={name} checked={checked}
              id={id} onChange={onChange} type={inputType} />
            <span className={helperClassName} />
          </span>
          <span className="input-label">
            {this.props.children}
          </span>
        </label>
      </ons-input>
    );
  }
}
