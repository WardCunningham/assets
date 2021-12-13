/*	LAMBDATALK | copyleft_GPL alainmarty 2021 */

//// LAMBDATALK & LAMBDATANK version 2021/11/11

"use strict";

var LAMBDATALK = (function() {
  var regexp = /\{([^\s{}]*)(?:[\s]*)([^{}]*)\}/g;
  var DICT = {}, LAMB_num = 0;  // primitives, lambdas & defs
  var QUOT = {}, QUOT_num = 0;  // quotes
  var MACR = {}, MACR_num = 0;  // macros

// 1) MAIN FUNCTION
  var evaluate = function(s) {
    var bal = balance(s);
    if (bal.left === bal.right) {
      s = eval_specials(s,'require',eval_require);
      s = preprocessing(s);
      s = eval_macros(s);
      s = eval_specials(s,'script',eval_script);
      s = eval_specials(s,'style',eval_style);
      s = eval_specials(s,'quote',eval_quote);
      s = eval_specials(s,'let',eval_let);

      s = eval_specials(s,'lambda',eval_lambda);
      s = eval_specials(s,'if',eval_if);
      s = eval_specials(s,'def',eval_def,true);

      s = eval_forms(s);
      s = postprocessing(s);
    }
    return { val:s, bal:bal };
  };

// 2) EVAL SEQUENCES OF NESTED FORMS FROM INSIDE OUT

  var eval_forms = function(s) { // nested (first rest)
    while (s !== (s = s.replace(regexp, eval_form)));
    return s;
  };

  var eval_form = function() {
    var f = arguments[1] || "", r = arguments[2] || "";
    return DICT.hasOwnProperty(f)
      ? DICT[f].apply(null, [r]) : "⊂" + f + " " + r + "⊃";
  };

// 3) CATCH & EVAL SPECIAL FORMS

  var eval_specials = function(s,symbol,eval_symbol,flag) {
    while (s !== (s = form_replace(s, symbol, eval_symbol, flag))) ;
    return s; 
  };

  var eval_macros = function(s) {
    s = eval_specials(s,'macro',eval_macro);
    for (var key in MACR)
      s = s.replace( MACR[key].one, MACR[key].two );
    return s
  };

//// LAMBDA : {lambda {args} expression}
  var eval_lambda = function(s) { 
    // s = eval_specials(s,'lambda',eval_lambda);     // cleaned on 20201211
    var index = s.indexOf("}"),
        argStr = supertrim(s.substring(1, index)),
        args = argStr === "" ? [] : argStr.split(" "),
        body = supertrim(s.substring(index + 2)),
        name = "_LAMB_" + LAMB_num++;
    body = eval_specials(body,'lambda',eval_lambda);  // improved on 20201211

    DICT[name] = function() {
      var valStr = supertrim(arguments[0]),
          vals = valStr === "" ? [] : valStr.split(" "),
          bod = body;
      if (vals.length < args.length) {          // 1) partial call
          for (var i = 0; i < vals.length; i++)
            bod = bod.replace(RegExp(args[i], "g"), vals[i]);
          var _args_ = args.slice(vals.length).join(" ");
          bod = eval_lambda("{" + _args_ + "} " + bod);
      } else if (vals.length === args.length) { // 2) total call
          for (var i=0; i < args.length; i++)
            bod = bod.replace( RegExp(args[i], "g"), vals[i] );
      } else {          // 3) extra are gathered in the last one
          var _vals_ = vals.slice(0,args.length);
          _vals_[args.length-1] = vals.slice(args.length-1,vals.length).join(' ');
          for (var i=0; i < args.length; i++)
            bod = bod.replace( RegExp(args[i], "g"), _vals_[i] ); 
      }
      bod = eval_specials(bod,'if',eval_if);
      return eval_forms(bod);
    };
    return name;
  };

//// DEF : {def name expression}
  var eval_def = function(s, flag) { 
    s = eval_specials(s,'def',eval_def,false);
    var index = s.search(/\s/);
    var name = s.substring(0, index).trim();
    var body = s.substring(index).trim();
    if (body.substring(0, 6) === "_LAMB_") {
      DICT[name] = DICT[body];
    } else {
      body = eval_forms(body);
      DICT[name] = function() {
        return body;
      };
    }
    return flag ? name : "";
  };

//// IF : {if bool then one else two}
  var eval_if = function(s) {
    s = eval_specials(s,'if',eval_if);
    var index1 = s.indexOf( 'then' ),
        index2 = s.indexOf( 'else' ),
        bool   = s.substring(0,index1).trim(),
        one    = s.substring(index1+5,index2).trim(),
        two    = s.substring(index2+5).trim(); 
    return (eval_forms(bool) === 'true')? one : two
  };

//// LET : (let ( (arg val) ...) body) -> ((lambda (args) body) vals) 
  var eval_let = function(s) {
    s = eval_specials(s,'let',eval_let);
    s = supertrim(s);
    var varvals = catch_form("{", s);
    var body = supertrim(s.replace(varvals, ""));
    varvals = varvals.substring(1, varvals.length - 1);
    var avv = [], i = 0;
    while (true) {
      avv[i] = catch_form("{", varvals);
      if (avv[i] === "none") break;
      varvals = varvals.replace(avv[i], "");
      i++;
    }
    for (var one = "", two = "", i = 0; i < avv.length - 1; i++) {
      var index = avv[i].indexOf(" ");
      one += avv[i].substring(1, index) + " ";
      two += avv[i].substring(index + 1, avv[i].length - 1) + " ";
    }
    return "{{lambda {" + one + "} " + body + "} " + two + "}";
  };

//// QUOTE : {quote ...} or '{...} -> _QUOT_xxx
  var eval_quote = function(s) { // (quote expressions)
    return quote(s);
  };
//// MACRO : {macro reg-exp to LAMBDATALK-exp}
var eval_macro = function(s) {
  var index = s.indexOf('to'),
      one = supertrim(s.substring(0, index)),
      two = supertrim(s.substring(index+2));
  one = RegExp( one, 'g' );
  two = two.replace( /€/g, '$' ); // because of PHP conflicts with $
  var name = '_MACR_' + MACR_num++;
  MACR[name] = {one:one, two:two };
  return '';
};


//// SCRIPT : {script JS code}
var eval_script = function (s) {    // some JS code
  var js = document.createElement('script');
  js.innerHTML = s; // unquote( s );
  document.head.appendChild( js );
  // document.head.removeChild( js ); // maybe not
  // console.log( '[ok script]' );
  return ''
};

//// STYLE : {style CSS rules}
var eval_style = function (s) {    // some CSS code
  var cs = document.createElement('style');
  cs.innerHTML = s; // unquote( s );
  document.head.appendChild( cs );
  // document.head.removeChild( cs ); // don't do that !
  // console.log( '[ok style]' );
  return ''
};

//// REQUIRE : {require lib_1 lib_2 ...}
var LIBS;   // initially undefined

var eval_require = function(s) { 
  if (LIBS !== undefined) return '';
  var WAIT = "<div style='font-size:2.0em; text-align:center; color:red;'>"
           + "Loading libraries...</div>"; 
  LAMBDATANK.display_update( WAIT );
  s = preprocessing( s );                // useless -> clear
  var libs = s.split(' ');  
  for (var i=0; i < libs.length; i++) {
    var x = new XMLHttpRequest();
    x.open('GET', 'pages/' + libs[i] + '.txt', false);  // false -> lock
    x.onreadystatechange = function () { 
      if (x.readyState == 4) {
        console.log( libs[i] + ': ' + x.statusText );
        if (x.status === 200) 
          LIBS += decodeHtmlEntity( x.responseText )
      }
    };
    x.send(null);   
  }
  console.log( 'libraries loaded' );
  // now unlocked and return libraries in a hidden container
  return "<div style='display:none'>" + LIBS + "</div>"
};

//// 4) PREPROCESSING / POSTPROCESSING
var preprocessing = function(s) {
    LAMB_num = 0;
    QUOT_num = 0;
    MACR_num = 0;

    s = ARRA.begin(s);
    s = PAIR.begin(s);
//    s = LIST.begin(s);

    s = comments( s );
    s = block2quote( s );
    s = HTML_macros( s );
    s = apo2quote( s );
    return s;
};

var postprocessing = function(s) {
    s = s.replace(/(_QUOT_\d+)/g, unquote);
    s = syntax_highlight( s );

    s = ARRA.end(s);
    s = PAIR.end(s);
//    s = LIST.end(s);

    LAMB_num = 0;
    QUOT_num = 0;
    MACR_num = 0;
    return s;
};

//// 5) HELPER FUNCTIONS 

//// while (s !== (s = form_replace(s, "sym",  eval_sym))) ;


var form_replace = function(str, symbol, func, flag) {
    symbol = "{" + symbol + " ";
    var s = catch_form(symbol, str);
    return s === "none" ? str : str.replace(symbol + s + "}", func(s, flag));
};
var catch_form = function(symbol, str) {
    var start = str.indexOf(symbol);
    if (start == -1) return "none";
    var d1, d2;
    if (symbol === "{") { // {:x v} in let
      d1 = 0; d2 = 1;
    } else {              // {symbol ...}
      d1 = symbol.length; d2 = 0;
    }
    var nb = 1, index = start;
    while (nb > 0) {
      index++;
      if (str.charAt(index) == "{") nb++;
      else if (str.charAt(index) == "}") nb--;
    }
    return str.substring(start + d1, index + d2);
};

var balance = function(s) {
    var strt = s.match(/\{/g),
        stop = s.match(/\}/g);
    strt = strt ? strt.length : 0;
    stop = stop ? stop.length : 0;
    return { left: strt, right: stop };
  };
var supertrim = function(s) {
    return s.trim().replace(/\s+/g, " ");
};
var quote = function(s) { // (quote x) -> _QUOT_n
    var name = "_QUOT_" + QUOT_num++;
    QUOT[name] = s;
    return name;
};
var unquote = function(s) { // _QUOT_n -> x
    var ss = QUOT[s]; //
    if (ss === '') return; 
    return ss.charAt(0) !== "_"
      ? ss                                // from (quote x)
      : "{" + ss.substring(1) + "}";      // from '(x)
};
var block2quote = function ( str ) {      // °° some text °° -> _QUOT_xxx
  var tab = str.match( /°°[\s\S]*?°°/g );
  if (tab == null) return str;
  for (var i=0; i< tab.length; i++) {
    var temp = tab[i];
    temp = temp.replace( /°°/g, '' );
    temp = quote(temp);
    str = str.replace( tab[i], temp );
  }
  return str;
};
var apo2quote = function (s) {  // '{x} -> {quote _x}
  return s.replace(/'\{/g, "{quote _");   //'
};

// start edit 2020/01/29
var comments = function (s) {
  s = s.trim()
       .replace( /°°°[\s\S]*?°°°/g, '' )  // delete multiline comments
       .replace( /;;[^\n]*/g, '' );    // delete one line comments
     //  .replace( /;; [^\s]*/g, '' );    // delete one line comments
  return s;
};

var HTML_macros = function(s) {
  s += '\n'; // add a CR at the end for "closing" a final alternate form  
  s = s.replace( /_h([1-6]) ([^\n]*)/g, '{h$1 $2}' )      // titles
       .replace( /_p ([^\n]*)/g, '{p $1}' )               // paragraphs
       .replace( /_ul(\w*?) ([^\n]*)/g,               // ul
            '{div {@ style="margin-left:{+ 20 $1}px; padding:0"}• $2}' )
       .replace( /_img ([^\n]*)/g, '{img {@ src="$1"  width="100%"}}' )
       .replace( /\[\[([^\[\]\|]*?)\]\]/g, '{a {@ href="?view=$1"}$1}' )
       .replace( /\[\[([^\|]*?)\|([^\[\]]*?)\]\]/g, '{a {@ href="$2"}$1}' );
  return s;
};
// end edit 2020/01/29

var decodeHtmlEntity = function(str) {
  // https://gist.github.com/CatTail/4174511
  return str.replace(/&#(\d+);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
};
var syntax_highlight = function( str ) { // highlight {} and special forms 
  str = str.replace( 
     /\{(lambda |def |if |let |quote |macro |script |style |macro |require)/g,
     '<span style="color:#f00;">{$1</span>' )
           .replace( /(\{|\})/g, '<span style="color:#888">$1</span>' );
  return str;
};

//// END OF THE LAMBDATALK'S KERNEL


//// 6) DICTIONARY populated with three functions, unquote, include and lib

//// unquote

DICT['unquote'] = function() {
  return unquote( arguments[0] )
};

//// include

  var PAGE = "";

  var include = function(page) { 
    if (PAGE === page) return '';
    
    var x = new XMLHttpRequest();
    x.open('GET', 'pages/' + page + '.txt', true);  // true -> async
    x.onreadystatechange = function () { 
      if (x.readyState == 4) {
        if (x.status === 200) {
           PAGE = page;
           var r = decodeHtmlEntity( x.responseText );
           document.getElementById("page_content").innerHTML += evaluate(r).val;
        }
      }
    };    
    x.send(null);   

  return ""
};

DICT["include"] = function() {   // {include page}
  return include( arguments[0].trim() )  
};

//// lib

DICT["lib"] = function() {
    var str = "",
      index = 0;
    for (var key in DICT) {
      if (DICT.hasOwnProperty(key) 
          && key.substring(0, 6) !== "_LAMB_") {
        str += key + ", ";
        index++;
      }
    }
    return "DICT: [" + index + "] [" + str.substring(0, str.length - 2) + "]";
};

//  The rest of dictionary is populated outside LAMBDATALK, extendable on demand

  return {
    evaluate: evaluate,
    eval_forms:eval_forms,
    balance:balance,
    form_replace:form_replace,
    catch_form:catch_form,
    supertrim: supertrim,
    quote:quote,
    unquote:unquote,
    DICT:DICT            // DICT is public -> caution!
  };

})(); // end of LAMBDATALK


//// Populating LAMBDATALK.DICT 

//// 1) with HTML and MATH 

//// HTML

var HTML = (function() {

var htmltags = [ 'div', 'span', 'a', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'tr', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'u', 'center', 'br', 'hr', 'blockquote', 'del', 'sup', 'sub', 'code', 'img', 'pre', 'textarea', 'audio', 'video', 'source', 'select', 'option', 'object', 'canvas', 
'svg', 'line', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'path', 'text', 'g', 'mpath', 'use', 'textPath', 'pattern', 'image', 'clipPath', 'defs', 'animate', 'set', 'animateMotion', 'animateTransform', 'title', 'desc' ];

LAMBDATALK.DICT['@'] = function() {
  return '@@' + LAMBDATALK.supertrim( arguments[0] ) + '@@' 
};

for (var i=0; i< htmltags.length; i++) {
  LAMBDATALK.DICT[htmltags[i]] = function(tag) {
    return function() {
      var args = arguments[0].trim(); // save spaces for pre
      var attr = args.match( /@@[\s\S]*?@@/ ); 
      if (attr == null) {
        return '<'+tag+'>'+args+'</'+tag+'>';
      } else {
        args = args.replace( attr[0], '' ).trim();
        attr = attr[0].replace(/^@@/, '').replace(/@@$/, '');
        return '<'+tag+' '+attr+'>'+args+'</'+tag+'>';
      }
    }
  }(htmltags[i]);      
}

LAMBDATALK.DICT['input'] = function () {
  // {input {@ type="a_type" value="val" onevent=" quote(JS) "}}
  var args = arguments[0]; 
  if (args.match( 'http://' )) // try to prevent cross_scripting
    return 'Sorry, external sources are not authorized in inputs!';
  if (args.match( /type\s*=\s*("|')\s*file\s*("|')/ ))
    return 'Sorry, type="file" is not allowed';
  var attr = args.match( /@@[\s\S]*?@@/ ); // any whitespace or not -> all
  if (attr == null) return 'ooops';
  attr = attr[0].replace(/^@@/, '').replace(/@@$/, '');   // clean attributes
  return '<input ' + attr + ' />';
};
LAMBDATALK.DICT['iframe'] = function() { // {iframe {@ src=".." height=".." width=".."}}
  var args = arguments[0];
  // comment the two following lines to allow external scripts 
  if (args.match( 'http://' )) // against cross_scripting but not https://
    return 'Sorry, external sources are not authorized in iframes!';
  var attr = args.match( /@@[\s\S]*?@@/ ); 
  if (attr == null)  return 'oops';
  attr = attr[0].replace(/^@@/, '').replace(/@@$/, '');   // clean attr
  return '<iframe ' + attr + ' ></iframe>';
}; 
LAMBDATALK.DICT['hide'] = function () {                              // {{hide} ...}
  return LAMBDATALK.eval_forms( 'div {@ style="display:none;"}' );
};
LAMBDATALK.DICT['prewrap'] = function () {                           // {prewrap ...}
  var args = arguments[0];
  return '{pre {@ style="word-wrap: break-word; white-space:pre-wrap;"}' + args + '}'
};

})();

//// MATH

var MATH = (function() {

LAMBDATALK.DICT["+"] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" "), r;
    if (a.length === 0)      r = 0;
    else if (a.length === 1) r = a[0];
    else if (a.length === 2) r = Number(a[0]) + Number(a[1]);
    else for (var r = 0, i = 0; i < a.length; i++) r += Number(a[i]);
    return r;
};
LAMBDATALK.DICT["*"] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" "), r;
    if (a.length === 0)      r = 1;
    else if (a.length === 1) r = a[0];
    else if (a.length === 2) r = a[0] * a[1];
    else for (var r = 1, i = 0; i < a.length; i++) r *= a[i];
    return r;
};
LAMBDATALK.DICT["-"] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    var r = a[0];
    if (a.length === 1) r = -r;
    else  for (var i = 1; i < a.length; i++) r -= a[i];
    return r;
};
LAMBDATALK.DICT["/"] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    var r = a[0];
    if (a.length === 1) r = 1 / r;
    else for (var i = 1; i < a.length; i++) r /= a[i];
    return r;
};
LAMBDATALK.DICT["%"] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    return Number(a[0]) % Number(a[1]);
};

LAMBDATALK.DICT["<"] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    var x = Number(a[0]), y = Number(a[1]);
    return (x < y) ? "true" : "false";
};
LAMBDATALK.DICT[">"] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    var x = Number(a[0]), y = Number(a[1]);
    return (x > y) ? "true" : "false";
};
LAMBDATALK.DICT["<="] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    var x = Number(a[0]), y = Number(a[1]);
    return (x <= y) ? "true" : "false";
};
LAMBDATALK.DICT[">="] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    var x = Number(a[0]), y = Number(a[1]);
    return (x >= y) ? "true" : "false";
};
LAMBDATALK.DICT['='] = function() {      // {= one two}
  var a = LAMBDATALK.supertrim(arguments[0]).split(' '),
      x = Number(a[0]), y = Number(a[1]); 
  return (!(x < y) && !(y < x))? 'true' : 'false';  
};

LAMBDATALK.DICT['not'] = function () { 
  var a = LAMBDATALK.supertrim(arguments[0]); 
  return (a === 'true')? 'false' : 'true';
};
LAMBDATALK.DICT['or'] = function () {
  var terms = LAMBDATALK.supertrim(arguments[0]).split(' '); 
  for (var ret=false, i=0; i< terms.length; i++)
    if (terms[i] === 'true') return 'true';
  return ret;
};
LAMBDATALK.DICT['and'] = function () { // (and (= 1 1) (= 1 2)) -> false 
  var terms = LAMBDATALK.supertrim(arguments[0]).split(' '); 
  for (var ret=true, i=0; i< terms.length; i++)
    if (terms[i] === 'false') return 'false';
  return ret;
};

var mathtags = [ "abs", "acos", "asin", "atan", "ceil", "cos", "exp", "floor", "pow", "log", "random", "round", "sin", "sqrt", "tan", "min", "max" ];

for (var i = 0; i < mathtags.length; i++) {
    LAMBDATALK.DICT[mathtags[i]] = (function(tag) {
      return function() {
        var args = LAMBDATALK.supertrim(arguments[0]).split(" ");
        // var args = arguments[0].split(" ");
        return Math[tag].apply(null,args);
      };
    })(mathtags[i])
}


LAMBDATALK.DICT["PI"] = function() { return Math.PI };
LAMBDATALK.DICT["E"] = function() { return Math.E };
LAMBDATALK.DICT['date'] = function () { 
    var now = new Date();
    var year    = now.getFullYear(), 
        month   = now.getMonth() + 1, 
        day     = now.getDate(),
        hours   = now.getHours(), 
        minutes = now.getMinutes(), 
        seconds = now.getSeconds();
    if (month<10) month = '0' + month;
    if (day<10) day = '0' + day;
    if (hours<10) hours = '0' + hours;
    if (minutes<10) minutes = '0' + minutes;
    if (seconds<10) seconds = '0' + seconds;
    return year+' '+month+' '+day+' '+hours+' '+minutes+' '+seconds;
};  

})();  // end MATH

//// 2) with WORD, STRING, ARRAY, PAIR and LIST

//// WORD

var WORDS = (function() {

LAMBDATALK.DICT["W.equal?"] = function() {
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    return a[0] === a[1];
};
LAMBDATALK.DICT['W.empty?'] = function() { // {empty? word}
  var args = arguments[0].trim();
  return (args === ''); 
};
LAMBDATALK.DICT['W.length'] = function() { // {chars word}
  var args = arguments[0].trim();
  return args.length; 
};
LAMBDATALK.DICT['W.get'] = function () { // {nth n word}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var i = parseInt(args[0]);
  return args[1].charAt(i);
};

LAMBDATALK.DICT['W.first'] = function () { // {first word}
  var args = arguments[0].trim();
  return args.charAt(0);
};
LAMBDATALK.DICT['W.rest'] = function () { // {rest word}
  var args = arguments[0].trim();
  return args.slice(1);
};
LAMBDATALK.DICT['W.last'] = function () { // {last word}
  var args = arguments[0].trim();
  return args.charAt(args.length-1);
};
LAMBDATALK.DICT['W.slice'] = function() { // {substring i0 i1 word}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '),
      w = args[2],
      i0 = parseInt(args[0]),
      i1 = parseInt(args[1]);
  return w.slice(i0,i1); 
};
LAMBDATALK.DICT['W.reverse'] = function() { // {reverse word}
  var args = LAMBDATALK.supertrim(arguments[0]).split('');
  return args.reverse().join(''); 
};
LAMBDATALK.DICT['W.sort'] = function () { // {S.sort comp z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var comp = args.shift();    // comp
  args = args[0].split('');   
  if (comp === '<') 
     args.sort( function(a,b) { return a - b } );
  else if (comp === '>')
     args.sort( function(a,b) { return b - a } );
  else if (comp === 'before')
     args.sort( function(a,b) { return a.localeCompare(b) === 1 } );
  else if (comp === 'after')
     args.sort( function(a,b) { return b.localeCompare(a) === 1 } );
  return args.join('');
};
LAMBDATALK.DICT["W.lib"] = function() {
    var str = "",
      index = 0;
    for (var key in LAMBDATALK.DICT) {
      if (LAMBDATALK.DICT.hasOwnProperty(key) && key.substring(0,2) === "W.") {
        str += key + ", ";
        index++;
      }
    }
    return "WORD: [" + index + "] [" + str.substring(0, str.length - 2) + "]";
};

})();  // end WORD

//// STRING

var STRINGS = (function() {

LAMBDATALK.DICT["S.equal?"] = function() {   // just compare first and second, useless
    var a = LAMBDATALK.supertrim(arguments[0]).split(" ");
    return a[0] === a[1];
};
LAMBDATALK.DICT['S.empty?'] = function() { // {empty? string}
  var args = LAMBDATALK.supertrim(arguments[0]);
  return (args === ''); 
};

LAMBDATALK.DICT['S.length'] = function () { // {length a b c d}
  var args = LAMBDATALK.supertrim(arguments[0]);
  return (args === '')? 0 : args.split(' ').length
};

LAMBDATALK.DICT['S.first'] = function () { // {first a b c d}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); // [a,b,c,d]
  return args[0];
};
LAMBDATALK.DICT['S.rest'] = function () { // {rest a b c d}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); // [a,b,c,d]
  return args.slice(1).join(' ');
};
LAMBDATALK.DICT['S.last'] = function () { // {last a b c d}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); // [a,b,c,d]
  return args[args.length-1];
};
LAMBDATALK.DICT['S.get'] = function () { // {nth n a b c d}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); // [a,b,c,d]
  return args[args.shift()];
};

LAMBDATALK.DICT['S.slice'] = function() { // {substring i0 i1 some text}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '), // ["i0","i1","some","text"]
      i0 = parseInt(args.shift()),
      i1 = parseInt(args.shift()),
      s  = args;
  return s.slice(i0,i1+1); 
};

LAMBDATALK.DICT['S.serie'] = function () { // {serie start end [step]}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var start = parseFloat( args[0] ),
      end   = parseFloat( args[1] ),
      step  = parseFloat( args[2] || 1),
      str   = '';
  if (step == 0) return start;  
  step = Math.abs(step);
  if (start === end)
    return start;
  else if (start < end)
    for (var i=start; i<=end; i+= step) { str += i + ' '; }
  else if (start > end)
    for (var i=start; i>=end; i-= step) { str += i + ' '; }
  return str.substring(0, str.length-1);
};

LAMBDATALK.DICT['S.map'] = function () { // {map func serie}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var func = args.shift(); 
  var str = '';
  if (LAMBDATALK.DICT[func] !== undefined) {
    for (var i=0; i< args.length; i++)
      str += LAMBDATALK.DICT[func].call( null, args[i] ) + ' ';
  }
  return str.substring(0, str.length-1);
};
LAMBDATALK.DICT['S.reduce'] = function () { // {reduce func serie}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var func = args.shift();             // *
  var r = args[0];                     // [1,2,3,4]
  for (var i=1; i< args.length; i++)   // {* r args[i]}
    r = LAMBDATALK.DICT[func].call(null, (r + " " + args[i]));
  return r
};

LAMBDATALK.DICT['S.replace'] = function () { // {replace one by two in some text}
  var str = LAMBDATALK.supertrim(arguments[0]); // one by two in text
  var index = str.indexOf('by');
  var one = str.substring(0,index).trim();
  str = str.substring(index+2).trim();
  index = str.indexOf('in');
  var two = str.substring(0,index).trim().replace(/€/g,'$');
  two = (two !== 'space')? two : ' ';
  str = str.substring(index+2).trim();
  str = str.replace( RegExp(one,'g'), two );
  return str;
};
LAMBDATALK.DICT['S.reverse'] = function() { // {reverse word}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  return args.reverse().join(' '); 
};


LAMBDATALK.DICT['S.sort'] = function () { // {S.sort comp z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var comp = args.shift();
      
  if (comp === '<') 
     args.sort( function(a,b) { return a - b } );
  else if (comp === '>')
     args.sort( function(a,b) { return b - a } );
  else if (comp === 'before')
     args.sort( function(a,b) { return a.localeCompare(b) === 1 } );
  else if (comp === 'after')
     args.sort( function(a,b) { return b.localeCompare(a) === 1 } );
  return args.join(' ');
};

LAMBDATALK.DICT["S.lib"] = function() {
    var str = "",
      index = 0;
    for (var key in LAMBDATALK.DICT) {
      if (LAMBDATALK.DICT.hasOwnProperty(key) && key.substring(0,2) === "S.") {
        str += key + ", ";
        index++;
      }
    }
    return "STRING: [" + index + "] [" + str.substring(0, str.length - 2) + "]";
};


})();  // end STRING

//// ARRAY 

// following: https://developer.mozilla.org/fr/
//            docs/Web/JavaScript/Reference/Objets_globaux/Array
// extended with list-like functions

var ARRA = (function() {

var ARRA = {}, ARRA_num = 0;  // arrays

LAMBDATALK.DICT['A.new'] = function () { // {array.new 12 34 56} -> [12,34,56]
  var args = LAMBDATALK.supertrim(arguments[0]);
  var name = '_ARRA_' + ARRA_num++;
  ARRA[name] = (args != '')? args.split(' ') : [];
  return name;
};
var isARRA = function (z) {
  return (z !== '' && z.substring(0,6) === '_ARRA_') 
};
LAMBDATALK.DICT['A.disp'] = function () { // {array.disp z} or {z}
  var args = arguments[0].trim(), str = ''; 
  var rdisp = function( a ) {
    for (var i=0; i<ARRA[a].length; i++) {
      if (isARRA(ARRA[a][i])) {
        str += '[';
        rdisp( ARRA[a][i] );
        str = str.substring(0, str.length-1) + '],';
      } else
        str += ARRA[a][i] + ',';
    }
    return str.substring(0, str.length-1) ;
  };
  return (isARRA(args))? '[' + rdisp( args ) + ']' : args;
};
LAMBDATALK.DICT['A.join'] = function () {    // {#.join z}
  var args = arguments[0].trim();
  return ARRA[args].join('')
};
LAMBDATALK.DICT['A.split'] = function () {   // {#.split string}
  var args = arguments[0].trim();
  var name = '_ARRA_' + ARRA_num++;
  ARRA[name] = args.split('');
  return name;
};
LAMBDATALK.DICT['A.array?'] = function () { // {#.array? z}
  var args = arguments[0].trim();
  return (isARRA(args));
};
LAMBDATALK.DICT['A.null?'] = function () { // {#.null z}
  var args = arguments[0].trim();
  if (ARRA[args] === undefined) return true;
  return (ARRA[args][0] === undefined);
};
LAMBDATALK.DICT['A.empty?'] = function () { // {#.empty z}
  var args = arguments[0].trim();
  return (ARRA[args].length < 1);
};
LAMBDATALK.DICT['A.in?'] = function() { // {#.in? v z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  return ARRA[args[1]].lastIndexOf(args[0]);
};
LAMBDATALK.DICT['A.equal?'] = function () { // 
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); 
  return args[0] === args[1]
};

LAMBDATALK.DICT['A.length'] = function () { // {#.length z}
  var args = arguments[0].trim(); // z
  return (isARRA(args))? ARRA[args].length : 0;
};
LAMBDATALK.DICT['A.get'] = function () { // {#.item i z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); 
  return (isARRA(args[1]))? ARRA[args[1]][args[0]] : args[1];
};
LAMBDATALK.DICT['A.first'] = function () { // {#.first z}
  var args = arguments[0].trim(); // z
  return ARRA[args][0];
};
LAMBDATALK.DICT['A.last'] = function () { // {#.last z}
  var args = arguments[0].trim(); // z
  return ARRA[args][ARRA[args].length-1];
};
LAMBDATALK.DICT['A.rest'] = function () { // {#.rest z}
  var args = arguments[0].trim(); // z
  var name = '_ARRA_' + ARRA_num++;
  ARRA[name] = ARRA[args].slice(1); // a new one
  return name;
};
LAMBDATALK.DICT['A.slice'] = function () { // {#.slice i0 i1 z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); 
  var name = '_ARRA_' + ARRA_num++;
  ARRA[name] = ARRA[args[2]].slice(args[0],args[1]); // a new one
  return name;
};

LAMBDATALK.DICT['A.duplicate'] = function () { // {#.slice z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var name = '_ARRA_' + ARRA_num++;
  ARRA[name] = ARRA[args[0]].slice(); // a new one
  return name;
};
LAMBDATALK.DICT['A.reverse'] = function () { // {#.reverse z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var name = '_ARRA_' + ARRA_num++;
  ARRA[name] = ARRA[args[0]].slice().reverse(); // a new one
  return name;
};
LAMBDATALK.DICT['A.concat'] = function () { // {#.concat z1 z2}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); // [z1,z2]
  var name = '_ARRA_' + ARRA_num++;
  ARRA[name] = ARRA[args[0]].concat(ARRA[args[1]]); // a new one
  return name;
};

LAMBDATALK.DICT['radic'] = function () {  // just debug
  var args = arguments[0].trim();
  return Math.sqrt(args)
};

LAMBDATALK.DICT['A.map'] = function () { // {map func array}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  var func = LAMBDATALK.DICT[args[0]]; 
  var arr  = ARRA[args[1]];
  var res  = [];
  if (func !== undefined) {
    for (var i=0; i< arr.length; i++)
      res[i] = func.call( null, arr[i] );
  }
  var name = '_ARRA_' + ARRA_num++;
  ARRA[name] = res;
  return name;
};

///// side effects, the input array is modified

LAMBDATALK.DICT['A.set!'] = function () { // {#.set! i v z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); 
  ARRA[args[2]][args[0]] = args[1];
  return args[2];
};
// DICT['#.push!'] =      // deprecated
LAMBDATALK.DICT['A.addlast!'] = function () { // {#.push! v z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '); 
  ARRA[args[1]].push( args[0] );
  return args[1];
};
// DICT['#.pop!'] =       // deprecated
LAMBDATALK.DICT['A.sublast!'] = function () { // {#.pop! z}
  var args = arguments[0].trim(); // z
  ARRA[args].pop();
  return args;
};
// DICT['#.unshift!'] =   // deprecated
LAMBDATALK.DICT['A.addfirst!'] = function () { // {#.unshift! v z}
  var args = arguments[0].trim().split(' '); // [z,val]
  ARRA[args[1]].unshift( args[0] );
  return args[1];
};
// DICT['#.shift!'] =     // deprecated
LAMBDATALK.DICT['A.subfirst!'] = function () { // {#.shift! z}
  var args = LAMBDATALK.supertrim(arguments[0]);
  ARRA[args].shift();
  return args;
};
LAMBDATALK.DICT['A.reverse!'] = function () { // {#.reverse! z}
  var args = arguments[0].trim();
  ARRA[args].reverse();
  return args;
};
LAMBDATALK.DICT['A.sort!'] = function () { // {#.sort! comp z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
  if (args[0] === '<') 
     ARRA[args[1]].sort( function(a,b) { return a - b } );
  else if (args[0] === '>')
     ARRA[args[1]].sort( function(a,b) { return b - a } );
  else if (args[0] === 'before')
     ARRA[args[1]].sort( function(a,b) { return a.localeCompare(b) === 1 } );
  else if (args[0] === 'after')
     ARRA[args[1]].sort( function(a,b) { return b.localeCompare(a) === 1 } );
  return args[1];
};

LAMBDATALK.DICT['A.swap!'] = function () { // {A.swap! i j z}
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '),
         i = args[0],
         j = args[1],
         z = args[2];
  var temp = ARRA[z][i];
  ARRA[z][i] = ARRA[z][j];
  ARRA[z][j] = temp;
  return z
};

// todo: add indexOf lastIndexOf toString splice! copyWithin! fill!

LAMBDATALK.DICT["A.lib"] = function() {
    var str = "",
      index = 0;
    for (var key in LAMBDATALK.DICT) {
      if (LAMBDATALK.DICT.hasOwnProperty(key) && key.substring(0,2) === "A.") {
        str += key + ", ";
        index++;
      }
    }
    return "ARRAY: [" + index + "] [" + str.substring(0, str.length - 2) + "]";
};

var array_display = function(s) { // _ARRA_xxx -> [a,b,c,d]
  s = s.replace( /_ARRA_\d+/g, 
    function(v) { return LAMBDATALK.eval_forms( '{A.disp ' + v + '}' ) });
  return s;
};

var begin = function(s) {
  ARRA_num = 0; 
  return s;
};
var end = function(s) { 
  s = s.replace(/(_ARRA_\d+)/g, array_display);
  ARRA_num = 0;
  return s;
}

return {begin:begin, end:end}

})();  // end ARRAY

//// PAIR

var PAIR = (function() {
  var PAIR = {}, PAIR_num = 0;  // pairs & trees

LAMBDATALK.DICT['cons'] =    // added for historic reasons
LAMBDATALK.DICT['P.new'] = function () { // {pair 12 34}
  if (arguments[0] === '') return 'nil';
  var a = LAMBDATALK.supertrim(arguments[0]).split(' '); // [12,34]
  var name = '_PAIR_' + PAIR_num++;
  PAIR[name] = a;
  return name; 
};
var ispair = function(s) {
  return (s !== '' && s.substring(0,6) === '_PAIR_') 
};
LAMBDATALK.DICT['P.pair?'] = function () { // {pair? xx}
  var a = arguments[0].trim(); // xx
  return (ispair(a)); 
};

LAMBDATALK.DICT['car'] =           // added for historic reasons
LAMBDATALK.DICT['P.left'] = function () { // {left _PAIR_n}
  var a = arguments[0].trim(); // _PAIR_n
  return (ispair(a))? PAIR[a][0] : a;
};
LAMBDATALK.DICT['cdr'] =          // added for historic reasons
LAMBDATALK.DICT['P.right'] =  function () { // {right _PAIR_n}
  var a = arguments[0].trim(); // _PAIR_n
  return (ispair(a))? PAIR[a][1] : a; 
};
LAMBDATALK.DICT['P.disp'] = function () { 
// {cons {cons 12 34} {cons 56 78}}            -> ((12 34) (56 78))
// {cons 12 {cons 34 {cons 56 {cons 78 nil}}}} -> (12 (34 (56 (78 nil))))
  var recur = function (z) {
    return ( ispair(z) )?  
       '(' + recur( PAIR[z][0] ) + ' ' + recur( PAIR[z][1] ) + ')' : z;
  };
  var z = arguments[0];
  return ( ispair(z) )? recur( z ) : z;
};

LAMBDATALK.DICT["P.lib"] = function() {
    var str = "",
      index = 0;
    for (var key in LAMBDATALK.DICT) {
      if (LAMBDATALK.DICT.hasOwnProperty(key) && key.substring(0,2) === "P.") {
        str += key + ", ";
        index++;
      }
    }
    return "PAIR: [" + index + "] [" + str.substring(0, str.length - 2) + "]";
};

var pair_display = function(s) {  // _PAIR_xxx -> ((a b) (c d))
  s = s.replace( /_PAIR_\d+/g, 
    function(v) { return LAMBDATALK.eval_forms( '{P.disp ' + v + '}' ) });
  return s;
};

var begin = function(s) {
  PAIR_num = 0;
  return s;
};
var end = function(s) {
  s = s.replace(/(_PAIR_\d+)/g, pair_display);
  PAIR_num = 0;
  return s;
};

return {begin:begin, end:end}

})();  // end PAIR

//// 3) miscelaneous ...

//// LOCALSTORAGE

var LOCALSTORAGE = (function() {

LAMBDATALK.DICT["LS.display"] = function() {    // {localStorage.display}
    var str = "",
      index = 0;
    for (var key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        str += key + "\n";
        index++;
      }
    }
    str = "localStorage: " + index + " items\n[\n" 
        + str.substring(0, str.length - 1) + '\n]';
    return str;
};
LAMBDATALK.DICT["LS.setItem"] = function() {    // {localStorage.setItem key content}
    var args = LAMBDATALK.supertrim(arguments[0]).split(' ');
    var key = args.shift();
    var content = args.join(' ');
    try {
       localStorage.setItem( key, content );
       console.log( key + ' updated' );
     } catch(e) {
       console.log( 'localStorage not available' );
     }
    return ''
};
LAMBDATALK.DICT["LS.getItem"] = function() {    // {localStorage.getItem key}
    var key = arguments[0].trim();
    return localStorage.getItem( key );
};
LAMBDATALK.DICT["LS.removeItem"] = function() { // {localStorage.removeItem key}
    var key = arguments[0].trim();
    localStorage.removeItem( key )
    return ''
};
LAMBDATALK.DICT["LS.clear"] = function() {      // {localStorage.clear}
    localStorage.clear();
    return ''
};

LAMBDATALK.DICT["show_last_code"] = function() {  // {show_last_code}
    return '<input type="button" value="•" style="position:fixed; top:2px; left:2px;" '
            + 'onclick="'
            + "document.getElementById('last_code_wind').innerHTML = localStorage.getItem('last_code');"
            + "LAMBDATANK.toggle_display('last_code_wind'); this.value=(this.value==='•') ? 'hide' : '•'"
            + '" />'
            + '<textarea id="last_code_wind" '
            + 'style="position:fixed; top:70px; left:50%; width:600px; margin-left:-310px; height:500px; ' 
            + 'padding:10px; display:none; z-index:10; border:0; box-shadow:0 0 8px #000; opacity:0.9;"></textarea>';
};

})();  // end LOCALSTORAGE

//// TURTLE FOR SVG

LAMBDATALK.DICT['turtle'] = function () {
  var draw = function(str) { // {turtle x0 y0 a0 M100 T90 M50 T-45 ...}
    var args = str.split(' ');
    var x0 = parseFloat(args[0]),
        y0 = parseFloat(args[1]),
        a0 = parseFloat(args[2]),
        poly = [];
    poly.push( [x0, y0, a0] );
    for (var i=3; i < args.length; i++) {
      var act = args[i].charAt(0),
          val = parseFloat(args[i].substring(1));
      if (act === 'M') {
        var p = poly[poly.length-1],
            a = p[2] * Math.PI / 180.0,
            x = p[0] + val * Math.sin(a),
            y = p[1] + val * Math.cos(a);
        poly.push( [x,y,p[2]] )
      } else {
        var p = poly.pop();
        poly.push( [p[0],p[1],p[2]+val] ) 
      }
    }
    for (var pol = '', i=0; i < poly.length; i++)
      pol += Math.round(poly[i][0]) + ' ' +  Math.round(poly[i][1]) + ' ';
    return pol
  };
  return draw( LAMBDATALK.supertrim(arguments[0]) );
};

//// LONG INTEGER

LAMBDATALK.DICT['long_add'] = function () {
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '),
         a = args[0].split("").reverse(),
         b = args[1].split("").reverse(),
         n = Math.max(a.length, b.length), 
         c = [], 
         d = 0;
  for (var i=0; i < n; i++) {
    c[i] = (a[i] | 0) + (b[i] | 0) + d;
    if (c[i] > 9) {
      c[i] -= 10;
      d = 1;
    } else {
      d = 0;
    }
  } 
  if (d === 1) c.push(1);
  return c.reverse().join('') 
};

LAMBDATALK.DICT['long_mult'] = function () {
  var args = LAMBDATALK.supertrim(arguments[0]).split(' '),
         a = args[0].split("").reverse(),
         b = args[1].split("").reverse(),
         c = [];
  for ( var i1 = 0; i1 < a.length; i1++ ) {
    for ( var i2 = 0; i2 < b.length; i2++ ) {
      var j = i1 + i2;
      c[j] = a[i1] * b[i2] + (c[j] | 0);
      if ( c[j] > 9 ) { 
        var f = Math.floor( c[j] / 10 );
        c[j] -= f * 10;
        c[j+1] = f + (c[j+1] | 0);
      }
    }   
  }
  return c.reverse().join("")
};

//// a simple and funny effect

LAMBDATALK.DICT["uncover"] = function() {
  var args = LAMBDATALK.supertrim(arguments[0]).split(" "),
      im = args.shift(),
      h1 = args.shift(),
      h2 = args.shift(),
      txt = args.join(" ");

  return `<img src="${im}"
          style="width:100%;
                 height:${h1}px;
                 object-fit:cover;
                 cursor:zoom-in;
                 transition: all 1s;"
          onclick="this.style.height=(this.style.height==='${h1}px')? '${h2}px' : '${h1}px';
                   this.nextSibling.style.fontSize=(this.nextSibling.style.fontSize==='0px')? '1.0em' : '0px';
                  " /><div style="font-size:0px; text-align:center; ">${txt}</div>`
};

//// DRAG 

// DRAG is used to move any div via {drag}
// DRAG is also used to move the wiki's page_view and editor_frame 
// CAUTION : div parent must have a defined position, top and left
// draging editor, view frames and also divs via {drag}

var DRAG = (function() {
var beginDrag = function ( elementToDrag, event ) {
  var x, y, ymin = 20;
  if( window.getComputedStyle ) { 
    x = parseInt( window.getComputedStyle(elementToDrag,null).left ); 
    y = parseInt( window.getComputedStyle(elementToDrag,null).top );
  } else if( elementToDrag.currentStyle ) { 
    x = parseInt( elementToDrag.currentStyle.left );
    y = parseInt( elementToDrag.currentStyle.top );
  }  
  var deltaX = event.clientX - x;
  var deltaY = event.clientY - y;
  document.addEventListener( "mousemove", moveHandler, true );
  document.addEventListener( "mouseup", upHandler, true );
  event.stopPropagation();
  event.preventDefault();

  function moveHandler ( event ) {
    x = event.clientX;
    y = event.clientY; if (y < ymin) y = ymin;  // top window < ymin  
    elementToDrag.style.left = (x - deltaX) + "px";
    elementToDrag.style.top  = (y - deltaY) + "px";
    event.stopPropagation();
  }
  function upHandler ( event ) {
    document.removeEventListener( "mouseup", upHandler, true );
    document.removeEventListener( "mousemove", moveHandler, true );
    event.stopPropagation();
  }
};
var drag = function() {    // {drag}
  return '<div style="cursor:move; background:red; width:10px; height:10px; line-height:20px; border:1px solid black;" onmousedown="DRAG.beginDrag( this.parentNode, event );">&nbsp;</div>';
};
return { beginDrag:beginDrag, drag:drag }
})();

LAMBDATALK.DICT['drag'] = function () { return DRAG.drag() };

/////  SECTIONEDIT  

// only for retro-compatibility, use block_edit instead
// CAUTION : due to a LAMBDATALK.catch_form() limit/issue/bug
// num must be followed by at least one "true" space, not a line return

var SECTIONEDIT = (function() {
var code = '', content = '', oldval = '';

var create = function ( args ) {
  args = args.split(' ');
  var num = args.shift();
  var content = args.join(' ').trim();
  return '{input {@ id="' 
  + num + '" class="sectionedit" type="submit" value="edit"'
  + ' style="float:left; margin-left:-45px;"'
  + ' onclick="SECTIONEDIT.section_open(this.id)"}}'
  + '{div {@ style="border:1px dashed #ccc;"}' + content + '}';
};
var section_open = function ( id ) {
  code = document.getElementById('page_textarea').value;
  oldval =  LAMBDATALK.catch_form( "{editable " + id + " ", code );
  content = document.getElementById(id).nextSibling.innerHTML;
  document.getElementById(id).nextSibling.innerHTML =
    '<div style="opacity:0.5;">' + content + '</div><textarea id="temp_' + id + '" ' 
    + 'style="width:99%; height:200px;">' + oldval + '</textarea><br/>'
    + '<input type="submit" value="save" onclick="SECTIONEDIT.section_save(' + id + ')" />'
    + '<input type="submit" value="cancel" onclick="SECTIONEDIT.section_cancel(' + id + ')" />';
  button_edit_disable( true );
};
var section_save = function ( id ) {
  var newval = document.getElementById('temp_'+id).value;
  document.getElementById('page_textarea').value = code.replace( oldval, newval );
  document.getElementById('save_button').click(); 
};
var section_cancel = function ( id ) {
  document.getElementById(id).nextSibling.innerHTML = content;
  button_edit_disable( false );
};
var button_edit_disable = function ( flag ) {
  var butt = document.getElementsByClassName( 'sectionedit' );
  for (var i=0; i < butt.length; i++)
    butt[i].disabled = flag;
};

return { 
  create:create, 
  section_open:section_open, 
  section_save:section_save,
  section_cancel:section_cancel 
}
}()); // end of SECTIONEDIT

///// added as an interface to the LAMBDATALK DICTionary
LAMBDATALK.DICT['editable'] = function () { 
  return SECTIONEDIT.create( arguments[0] );
};

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

////  LAMBDATALK can be called in a console
/* 
    Use a simple HTML file must contain these three containers:
1)  <textarea id="page_textarea" onkeyup="display_update()"> </textarea>
2)  <div id="page_infos"></div>
3)  <div id="page_view"></div>
*/

var display_update = function() {
  var t0 = new Date().getTime(),
      code = document.getElementById('page_textarea').value,
      result = LAMBDATALK.evaluate( code ),  // {val,bal}
      time = new Date().getTime() - t0;
  document.getElementById('page_infos').innerHTML = 
    '{' + result.bal.left + ':' + result.bal.right  + '} ' + time + 'ms';           
  if (result.bal.left === result.bal.right)
     document.getElementById('page_content').innerHTML = result.val ;
};

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

//// LAMBDATALK can be called in the wiki called LAMBDATANK

var LAMBDATANK = (function() {

var TIMEOUT = null, DELAY = 250, LOCK = false, FLAG;

var update = function( flag ) {
  if (LOCK) return;
  FLAG = flag;
  if (FLAG) {  // from onload='LAMBDATANK.update(true)'
    console.log( 'from onload' );
    do_update();
  } else {     // from onkeyup='LAMBDATANK.update(false)'
    console.log( 'from onkeyup' );
    clearTimeout( TIMEOUT );
    TIMEOUT = setTimeout( do_update, DELAY );
  }
};
var do_update = function() { 
  var ID = getId('page_textarea');
  if (ID === null)  {
    console.log( 'page_textarea does not exist' );
    return; 
  }
  var code = ID.value;
  if (code === '') {
     var pagename = get_pagename().split('::');
     var wiki = pagename[0], nom = pagename[1];
     nom = (nom !== '_')? nom : 'start';
     code = ' {p It\'s a new page of "{b ' + wiki 
          + '}". Please click on "{b ' + nom + '}" and edit.} ';
  }
  display_update( code );
};
var display_update = function(code) {
  var t0 = new Date().getTime();
  var result = LAMBDATALK.evaluate( code );  // {val,bal}
  var time = new Date().getTime() - t0;
  getId('page_infos').innerHTML = 
    '{' + result.bal.left + ':' + result.bal.right  + '} ' + time + 'ms';           
  if (result.bal.left === result.bal.right) {
     getId('page_content').innerHTML = result.val ;
// added on 2019/11/19 start
     if (!FLAG) {  // from onkeyup='LAMBDATANK.update(false)'
       try {
         localStorage.setItem('last_code', code);
         console.log( 'last code localStored' );
       } catch(e) {
         console.log( 'localStorage not available' );
       }
     }
// added on 2019/11/19 end
  }
};

var get_pagename = function() {  
  var titre = window.document.title; // LAMBDATALK :: pagename
  return titre.replace(/\s/g,'');    // LAMBDATALK::pagename
};

var toggle_lock = function(id) {
   LOCK = !LOCK;
   id.value = (LOCK)? "unlock" : "lock";
   if (!LOCK) do_update();
   return ''
};
var toggle_display = function ( id ) {
  document.getElementById(id).style.display = 
    (document.getElementById(id).style.display == "block") ? "none" : "block";
};
var toggle_visibility = function ( id ) {
  var OK = (getId(id).style.visibility == "visible");
  getId(id).style.visibility = (OK)? "hidden" : "visible";
};
var getId = function(id) {
  return document.getElementById(id); 
};

return {
  update:update,
  display_update:display_update,
  toggle_display:toggle_display,
  toggle_visibility:toggle_visibility,
  toggle_lock:toggle_lock,
  getId:getId
}
})();  // end LAMBDATANK



// called here via a setTimeout( LAMBDATANK.update, 10, true );  
// or called in the HTML file via <body onload='LAMBDATANK.update(true)'>
