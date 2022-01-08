// Biota interpreter (original in Smalltalk by Ward Cunningham)
// Copyright 2005 Ian Osgood

// Run from a page having fields with these ids:
//   large PRE blocks containing sample code or a textarea for code and data input
//   dcdir:  data direction 0..7 (0 is to the right, increases clockwise)
//   code:  empty PRE block for showing the program execution

// Buttons can execute these commands:
//   format(id):  copy program from given element to code & setup PC and DC
//   step:    single step and highlight current position
//     uses number from field id "repeat" to step n times
//   run:    toggle running steps on a timer
//     sets milliseconds per step from field id "speed" 

var code = "";		// formatted code

// workaround for immutable strings
function setCodeAt(i,c) {
	code = code.substring(0,i)
	     + c
	     + code.substring(i+1);
}
function empty(i) { return code.charAt(i) == ' '; }
function full(i)  { return code.charAt(i) != ' '; }

var offs;			// offsets indexed by dir
function setWidth(w) {
  offs = [ 1, w+1, w, w-1, -1, -w-1, -w, 1-w ];
}

// program and data counters
var PC = { ip:0, dir:0, color:"pink" };
var DC = { ip:0, dir:0, color:"lightgreen" };

// go:   ip += offs[dir];
// back: ip -= offs[dir];
// turn(n): dir = (dir+n)&7;

function cspan(c) {
	return '<span style="background:' + c.color + '">' + code.charAt(c.ip) + '</span>';
}
function dump() {
	// show the formatted code in a PRE block (id=code)
	var c1,c2;
	if (PC.ip < DC.ip) {
		c1 = PC; c2 = DC;
	} else {
		c1 = DC; c2 = PC;
	}
	document.getElementById("code").innerHTML
		= code.substring(0,c1.ip)
		+ cspan(c1)
		+ code.substring(c1.ip+1, c2.ip)
		+ cspan(c2)
		+ code.substring(c2.ip+1);

	var dcdir = document.getElementById("dcdir");
	if (dcdir) dcdir.value = DC.dir.toString();
}

var spaces = "     ";
function format(id) {
	var el = document.getElementById(id);
	var raw = el.value || el.innerHTML;
	var lines = raw.split('\n');
	var w = 80;
	var px=0,py=0,dx=0,dy=0;

	for (var i in lines) {
		// extract even characters as code
		var line = "";
		for (var j=0; j<lines[i].length; j+=2)
			line += lines[i].charAt(j);
		// scan odd characters for initial counter locations
		for (var j=1; j<lines[i].length; j+=2) {
			if (lines[i].charAt(j) == '$') {
				px = (j-1)/2;  py = i;
			} else
			if (lines[i].charAt(j) == '#') {
				dx = (j-1)/2;  dy = i;
			}
		}
		lines[i] = line;
		w = Math.max(w, line.length);
	}
	// format the buffer to evenly pad the line lengths
	while (spaces.length < w)
		spaces += spaces;
	for (var i in lines)
		lines[i] += spaces.substring(0, w - lines[i].length);

	code = lines.join('\n');
	setWidth(++w);
	
	PC.ip = px + py*w;
	PC.dir = 0;
	DC.ip = dx + dy*w;
	DC.dir = 0;
	var dcdir = document.getElementById("dcdir");
	if (dcdir) DC.dir = dcdir.value & 7;

	dump();
	
	window.scroll(0,document.getElementById("code").offsetTop);
}

//
// Biota engine
//

var turns = [ 0, 1,-1, 2,-2, 3,-3, 4 ];
function next(p,ok) {
	// find next acceptable character from this counter
	for (var i in turns) {
		var dir = (p.dir + turns[i]) & 7;	// unsigned % 8;
		var ip = p.ip + offs[dir];
		if (ok(ip)) {
			p.ip = ip; p.dir = dir;
			return true;
		}
	}
	return false;
}

var commands = {
	s:function() {
		var ip = DC.ip + offs[DC.dir];
		if (empty(ip)) return false;
		DC.ip = ip; return true;
	},
	b:function() {
		var ip = DC.ip - offs[DC.dir];
		if (empty(ip)) return false;
		DC.ip = ip; return true;
	},
	g:function() { return next(DC, full); },
	f:function() {
		if (!next(DC, full)) return false;
		DC.ip -= offs[DC.dir]; return true;
	},
	t:function() { DC.dir = (DC.dir+1)&7; return true; },
	u:function() { DC.dir = (DC.dir-1)&7; return true; },
	c:function() {
		if (empty(DC.ip)) return false;
		setCodeAt(DC.ip, ' '); return true;
	},
	d:function() {
		var dest = DC.ip + offs[(DC.dir-2)&7];
		var c = code.charAt(DC.ip);
		if ( c == ' ' || full(dest)) return false;
		setCodeAt(dest, c); return true;
	},
	r:function() {
		var dest = { ip: DC.ip, dir: DC.dir };
		if (!next(dest, empty)) return false;
		setCodeAt(dest.ip, code.charAt(DC.ip)); return true;
	},
	".":function() { return true; }
};

function executable(ip) {
	var c = code.charAt(ip);
	if (!commands[c]) return false;
	return commands[c]();
}

function body() {
	if (!next(PC, executable))
		next(PC, full);
}

var tid = 0;
function step() {
	var n = document.getElementById("repeat").value - 0;
	while (--n>=0)
		body();
	dump();
}

function trace() {
	let w = offs[2]
	let log = []
	var n = document.getElementById("repeat").value - 0;
	while (--n>=0) {
			body();
			log.push(([PC.ip%w,Math.floor(PC.ip/w,n),n]))
	}
	dump();
	return log
}

function run() {
	var runButton = document.getElementById("run");
	if (tid) {
		clearInterval(tid);
		tid = 0;
		runButton.value = "Run";
	} else {
		var speed = document.getElementById("speed");
		var n = speed.value - 0;
		if (n<10) { n=10; speed.value = "10"; }
		tid = setInterval(step, n);
		runButton.value = "Stop";
	}
}
