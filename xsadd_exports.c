#include <xsadd.h>
#include <stdlib.h>

uint32_t do_xsadd_uint32(xsadd_t * xsadd) {
	return xsadd_uint32(xsadd);
}

double do_xsadd_double(xsadd_t * xsadd) {
	return xsadd_double(xsadd);
}

void *dummy(int dumb) {
	return malloc(0);
}