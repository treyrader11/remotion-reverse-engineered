import {useEffect, useRef, useState} from 'react';

/**
 * Returns a throttled version of the input value.
 * The value updates at most once every `delay` ms.
 *
 * @param value - The value to throttle.
 * @param delay - Throttle interval in milliseconds.
 * @returns Throttled value.
 */
function useThrottleValue<T>(value: T, delay: number): T {
	const [throttledValue, setThrottledValue] = useState<T>(value);
	const lastExecuted = useRef<number>(Date.now());

	useEffect(() => {
		const now = Date.now();
		const timeSinceLastExecution = now - lastExecuted.current;

		if (timeSinceLastExecution >= delay) {
			setThrottledValue(value);
			lastExecuted.current = now;
		} else {
			const timeout = setTimeout(() => {
				setThrottledValue(value);
				lastExecuted.current = Date.now();
			}, delay - timeSinceLastExecution);

			return () => clearTimeout(timeout);
		}
	}, [value, delay]);

	return throttledValue;
}

export default useThrottleValue;
