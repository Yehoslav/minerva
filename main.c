#include "stdio.h"

extern int add(int, int);

int main(int argc, char **argv) {

	if (argc != 3) {
		printf("usage: %s <num1> <num2>\n", argv[0]);
		return 1;
	}

	int a, b;
	sscanf(argv[1], "%d", &a);
	sscanf(argv[2], "%d", &b);

	printf("%d", add(a, b));

	return 0;
}
