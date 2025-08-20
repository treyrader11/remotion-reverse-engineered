export function generateRandomId(length: number = 4) {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

const itemColors = ['blue', 'green', 'red', 'purple'];

export const getRandomItemColor = () => {
	return itemColors[Math.floor(Math.random() * itemColors.length)];
};
