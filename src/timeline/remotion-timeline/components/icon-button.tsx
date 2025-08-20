import React, {HTMLProps} from 'react';

export const IconButton: React.FC<HTMLProps<HTMLButtonElement>> = ({
	className,
	children,
	...props
}) => {
	return (
		<button
			className={`flex items-center gap-1 rounded-sm p-1 hover:bg-white/5 ${className}`}
			{...props}
			type="button"
		>
			{children}
		</button>
	);
};
