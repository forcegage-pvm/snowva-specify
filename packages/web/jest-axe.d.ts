declare module 'jest-axe';

declare global {
	namespace jest {
		interface Matchers<R> {
			toHaveNoViolations(): R;
		}

		interface Expect {
			toHaveNoViolations(): void;
		}
	}
}

export { };

