
const example = process.env.EXAMPLE_VAR;
console.log(`Environment variable EXAMPLE_VAR: ${example}`);

let counter = 0;
for (let i = 0; i < 5; i++) {
	counter += i;
	console.log(`Counter at step ${i}: ${counter}`);
}
console.log(`Final counter value: ${counter}`);


