// this gets concatenated to the end of the compiled output

var XSadd = function() {
  xsadd_init = Module.cwrap(
    'xsadd_init', 'number', ['number', 'number', 'number']
  );

  xsadd_uint32 = Module.cwrap(
    'do_xsadd_uint32', 'number', ['number']
  );

  xsadd_double = Module.cwrap(
    'do_xsadd_double', 'number', ['number']
  );

  xsadd_init_by_array =  Module.cwrap(
    'xsadd_init_by_array', 'number', ['number', 'number', 'number']
  );

  var xsadd_call_wrapped_function = function(state, f, args) {
    if(state.length != 4)
      return;
    // Create Uint32Array version of state
    var data = new Uint32Array(state);
    // NODE: we could do this malloc once globally and never free (reuse), but didn't measure faster.
    // Get data byte size, allocate memory on Emscripten heap, and get pointer
    var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
    var dataPtr = Module._malloc(nDataBytes);
    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(data.buffer));
    // now build new args array
    var argsCopy = [dataHeap.byteOffset].concat(args);
    // Call function and get result
    var result = f.apply(null, argsCopy);
    var newstate = new Uint32Array(dataHeap.buffer, dataHeap.byteOffset, data.length);
    // copy result back to state
    state.length = 0;
    Array.prototype.push.apply(state, newstate);
    // Free memory
    Module._free(dataHeap.byteOffset);
    return result;
  }

  var xsadd_init_by_array_wrapper = function(state, array) {
    // Create example data to test float_multiply_array
    var data = new Uint32Array(array);

    // Get data byte size, allocate memory on Emscripten heap, and get pointer
    var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
    var dataPtr = Module._malloc(nDataBytes);

    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(data.buffer));

    // Call function and get result
    // xsadd_init_by_array(xsaddPtr, dataHeap.byteOffset, data.length);
    var retval = xsadd_call_wrapped_function(state, xsadd_init_by_array, [dataHeap.byteOffset, data.length]);

    // Free memory
    Module._free(dataHeap.byteOffset);
    // TODO: free dataPtr?
    return retval;
  }

  var state = [0, 0, 0, 0];
  var o = {
    state: state,
    init: function(seed) {
      xsadd_call_wrapped_function(state, xsadd_init, [seed]);
    },
    init_by_array: function(array) {
      xsadd_init_by_array_wrapper(state, array);
    },
    seed: function() {
      // now different flavors of init
      if (arguments.length === 0) {
        var d = new Date();        
        o.init(d.getTime() & 0xffff);
      }
      else if (arguments.length === 1) {
        if(typeof arguments[0] === 'number') {
          o.init(arguments[0]);
        }
        else if (typeof arguments[0] === 'string') {
          var map = Array.prototype.map
          var a = map.call(arguments[0], function(x) { return x.charCodeAt(0); })
          o.init_by_array(a)
        }
        else {
          // assume array
          o.init_by_array(arguments[0]);
        }
      }
      else {
        // init by arguments array
        var args = Array.prototype.slice.call(arguments);
        o.init_by_array(args);
      }
    },
    uint32: function() {
      return ((xsadd_call_wrapped_function(state, xsadd_uint32, []) + 0x100000000) % 0x100000000);
    },
    double: function() {
      return xsadd_call_wrapped_function(state, xsadd_double, []);
    }
  }
  o.seed.apply(this, arguments);
  return o;
}
