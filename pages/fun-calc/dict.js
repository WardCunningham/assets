// From 2.3 of http://lambdaway.free.fr/lambdawalks/?view=meta6

import * as META from './meta.js';
export default META.DICT

const supertrim = str => str.trim().replace(/\s+/g, " ")

META.DICT["equal?"] = function() {
    var a = supertrim(arguments[0]).split(" ");
    return a[0] === a[1]
};

META.DICT["+"] = function() {
    var a = supertrim(arguments[0]).split(" "), r;
    if (a.length === 0)      r = 0;
    else if (a.length === 1) r = a[0];
    else if (a.length === 2) r = Number(a[0]) + Number(a[1]);
    else for (var r = 0, i = 0; i < a.length; i++) r += Number(a[i]);
    return r;
};
META.DICT["*"] = function() {
    var a = supertrim(arguments[0]).split(" "), r;
    if (a.length === 0)      r = 1;
    else if (a.length === 1) r = a[0];
    else if (a.length === 2) r = a[0] * a[1];
    else for (var r = 1, i = 0; i < a.length; i++) r *= a[i];
    return r;
};
META.DICT["-"] = function() {
    var a = supertrim(arguments[0]).split(" ");
    var r = a[0];
    if (a.length === 1) r = -r;
    else  for (var i = 1; i < a.length; i++) r -= a[i];
    return r;
};
META.DICT["/"] = function() {
    var a = supertrim(arguments[0]).split(" ");
    var r = a[0];
    if (a.length === 1) r = 1 / r;
    else for (var i = 1; i < a.length; i++) r /= a[i];
    return r;
};

META.DICT["sqrt"] = function() {
    var a = supertrim(arguments[0]);
    return Math.sqrt( a );
};