// From 2.2 of http://lambdaway.free.fr/lambdawalks/?view=meta6

export {
  DICT,      // populated externally
  evaluate,  // called by eval()
  balance    // idem
}

const supertrim = str => str.trim().replace(/\s+/g, " ")

var DICT = {},
    FUN_num = 0, 
    regexp = /\(([^\s()]*)(?:[\s]*)([^()]*)\)/g;

var evaluate = function(s) {
  s = pre_processing(s);
  s = eval_specials(s, "'", eval_apo, null);
  s = eval_specials(s, "fun", eval_fun, null);
  s = eval_specials(s, "def", eval_def, true);
  s = eval_forms(s);       
  s = post_processing(s);
  return s;
};

var pre_processing = function(s) {
  return s.replace( /'\(/g , "(' " )
};

var post_processing = function(s) {
  return s.replace( /«/g, "(" ).replace( /»/g, ")" )
};

var eval_forms = function(s) {
  while ( s !== (s = s.replace(regexp, eval_form))) ;
  return s;
};

var eval_specials = function(s, special, eval_special, env) {
// sequence of (nested) special forms
  var exp = special_catch(special, s);  // (special exp) -> exp
  if (exp === "none") {    // no more special forms
    return s
  } else {
    var one = "(" + special + " " + exp + ")";
    var two = eval_special(exp, env);
    s = s.replace(one, two);
    return eval_specials(s, special, eval_special, env)
  }
};

var eval_apo = function(s) {
  return "«" + s.replace( /\(/g, "«" ).replace( /\)/g, "»" ) + "»"
};

var eval_form = function() {
  var f = arguments[1] || "", r = arguments[2] || "";
  if (DICT.hasOwnProperty(f)) 
    return DICT[f].apply(null, [r]) 
  else
    return f + " is unknown";
};

var eval_fun = function(s, env) {  // eval a (nested) lambda
  var index = s.indexOf(")"),
     argStr = supertrim(s.substring(1, index)),
       args = argStr === "" ? [] : argStr.split(" "),
       body = supertrim(s.substring(index + 2)),
        ref = "_FUN_" + FUN_num++;
  body = eval_specials(body, "fun", eval_fun, env); // recurse inside  

  DICT[ref] = function() { 
    var valStr = supertrim(arguments[0]),
          vals = valStr === "" ? [] : valStr.split(" "),
           bod = body;

    if (vals.length < args.length) {          // 1) partial call
        for (var i = 0; i < vals.length; i++)
          bod = bod.replace(RegExp(args[i], "g"), vals[i]);
        var _args_ = args.slice(vals.length).join(" ");
        bod = eval_fun("(" + _args_ + ") " + bod, env);
    } else if (vals.length === args.length) { // 2) total call
       for (var i=0; i < args.length; i++)
         bod = bod.replace( RegExp(args[i], "g"), vals[i] );
    } else {                                  // 3) extra in the last one
        var _vals_ = vals.slice(0,args.length);
        _vals_[args.length-1] = vals.slice(args.length-1,vals.length).join(' ');
        for (var i=0; i < args.length; i++)
          bod = bod.replace( RegExp(args[i], "g"), _vals_[i] ); 
    }
    return eval_forms(bod);
  };
  return ref;
};

var eval_def = function(s, env) { 
  s = eval_specials(s, "def", eval_def, false);
  var index = s.search(/\s/);
  var name = s.substring(0, index).trim();
  var body = s.substring(index).trim();
  if (body.substring(0, 5) === "_FUN_") { 
    DICT[name] = DICT[body];  // an alias
  } else {
    body = eval_forms(body);
    DICT[name] = function() {
      return body;
    };
  }
  return env ? name : "";
};

var special_catch = function(symbol, str) {           
// input: (symbol exp)
// side effect: none
// output: exp or none
  symbol = "(" + symbol + " ";
  var start = str.indexOf(symbol);
  if (start == -1) return "none";
  var nb = 1, index = start;
  while (nb > 0 && index < 100000) {
    index++;
    if (str.charAt(index) == "(") nb++;
    else if (str.charAt(index) == ")") nb--;
  }
  return str.substring(start + symbol.length, index); 
}; 

var balance = function(s) {
// input: a sequence of expressions {first rest}
// side effect: none
// output: the pair {left,right}
  var strt = s.match(/\(/g),
      stop = s.match(/\)/g);
  strt = strt ? strt.length : 0;
  stop = stop ? stop.length : 0;
  return { left: strt, right: stop };
};
