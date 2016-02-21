import NavigatorTransitionAnimator from './animator';


export default class NoneNavigatorTransitionAnimator extends NavigatorTransitionAnimator {
  constructor(options) {
    super(options);
  }
  push(enterPage, leavePage, callback) {
    callback();
  }

  pop(enterPage, leavePage, callback) {
    callback();
  }
}
