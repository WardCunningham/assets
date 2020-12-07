// From 2.1 of http://lambdaway.free.fr/lambdawalks/?view=meta6

import * as META from './meta.js';
import DICT from './dict.js';
export { eval_ as default }

const eval_ = DICT["eval"] = function () {
  var args = arguments[0].trim();
  var bal = META.balance(args);
  return (bal.left === bal.right) ?
    META.evaluate( args ) : '('+bal.left+'|'+bal.right+')';
};