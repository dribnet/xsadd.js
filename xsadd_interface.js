
// this gets concatenated to the end of the compiled output
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


function module_call_xsadd_init_by_array(xsaddPtr, array) {
  // Create example data to test float_multiply_array
  var data = new Uint32Array(array);

  // Get data byte size, allocate memory on Emscripten heap, and get pointer
  var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
  var dataPtr = Module._malloc(nDataBytes);

  // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
  var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
  dataHeap.set(new Uint8Array(data.buffer));

  // Call function and get result
  xsadd_init_by_array(xsaddPtr, dataHeap.byteOffset, data.length);

  // Free memory
  Module._free(dataHeap.byteOffset);
  // TODO: free dataPtr?
}

function XSadd() {
  var dataPtr = Module._malloc(16);
  var o = {
    init: function(seed) {
      xsadd_init(dataPtr, seed);
    },
    init_by_array: function(array) {
      console.log("init_by_array", array)
      module_call_xsadd_init_by_array(dataPtr, array);
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
      return ((xsadd_uint32(dataPtr) + 0x100000000) % 0x100000000)
    },
    double: function() {
      return xsadd_double(dataPtr);
    },
    free: function() {
      if(dataPtr != 0) {
        Module._free(dataPtr);
        dataPtr = 0;
      }
    }
  }
  o.seed.apply(this, arguments);
  return o;
  // xsadd_init(dataPtr, seed)
}
