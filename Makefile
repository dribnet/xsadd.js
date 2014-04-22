#for GNU make

#DDEBUG = -O0 -g -ggdb -DDEBUG=1
CCOPTION = -I. -Wall -Wextra -O3 -std=c99 -Wmissing-prototypes $(DDEBUG)
CC = gcc
#CC = icc
#CC = clang

all: xsadd.js

xsadd_compiled.js: xsadd-src/xsadd.c xsadd_exports.c
	emcc -O2 -I./xsadd-src xsadd-src/xsadd.c xsadd_exports.c -o xsadd_compiled.js -s EXPORTED_FUNCTIONS="['_xsadd_init','_do_xsadd_uint32', '_do_xsadd_double', '_xsadd_init_by_array']"

xsadd.js: xsadd_compiled.js xsadd_interface.js
	cat xsadd_compiled.js xsadd_interface.js > xsadd.js

clean:
	rm -rf xsadd_compiled.js.map xsadd_compiled.js xsadd.js
