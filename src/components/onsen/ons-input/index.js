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

  componentDidMount() {
    if (this.props.type === 'text-input') {
      this._initInputHandlers();
    }
  }

  componentDidUpdate(prevProps) {
    const newType = this.props.type;
    if (prevProps.type !== newType) {
      this._clearInputHandlers();
      if (newType === 'text-input') {
        this._initInputHandlers();
      }
    }
  }

  componentWillUnmount() {
    this._clearInputHandlers();
  }

  _updateLabelColor() {
    if (this._input.value.length > 0 && this._input === document.activeElement) {
      this._helper.style.color = '';
    }
    else {
      this._helper.style.color = 'rgba(0, 0, 0, 0.5)';
    }
  }

  _updateLabelClass() {
    if (this._input.value.trim() === '') {
      this._helper.classList.remove('text-input__label--active');
    }
    else {
      this._helper.classList.add('text-input__label--active');
    }
  }

  _initInputHandlers = () => {
    this._input.addEventListener('input', this._handleInputChange);
    this._input.addEventListener('focusin', this._handleInputChange);
    this._input.addEventListener('focusout', this._handleInputChange);
    this._updateLabelColor();
    this._updateLabelClass();
  }

  _clearInputHandlers = () => {
    this._input.addEventListener('input', this._handleInputChange);
    this._input.addEventListener('focusin', this._handleInputChange);
    this._input.removeEventListener('focusout', this._handleInputChange);
  }

  _handleInputChange = () => {
    this._updateLabelColor();
    this._updateLabelClass();
  };

  render() {
    const {
      name, checked, onChange, type, id, float,
      className, style, placeholder, value, ...props,
    } = this.props;

    const labelClassName = type === 'text-input'
      ? '' : type;
    const helperClassName = type === 'text-input'
      ? 'text-input__label' : `${type}__checkmark`;
    const inputClassName = type === 'text-input'
      ? 'text-input' : `${type}__input`;
    const inputContainerClassName = type === 'text-input'
      ? 'text-input__container' : '';
    const inputType = type.split('-')[0];

    return applyModifiers(this.props, scheme, 3,
      <ons-input className={labelClassName} float={float}>
        <label>
          <span className={inputContainerClassName}>
            <input {...props} className={inputClassName} name={name} checked={checked}
              id={id} onChange={onChange} type={inputType} value={value}
              ref={(d) => this._input = d} placeholder={placeholder} />
            <span className={helperClassName} ref={(d) => this._helper = d}>
              {placeholder}
            </span>
          </span>
          <span className="input-label">
            {this.props.children}
          </span>
        </label>
      </ons-input>
    );
  }
}
