type ButtonProps = {
	onClick: () => void;
	className?: string;
	children: React.ReactNode;
};

const Button = ({onClick, className, children}: ButtonProps) => {
	return (
		<button
			type="button"
			className={`bg-timeline-panel flex items-center justify-center gap-1 rounded-sm px-2 py-1 text-sm font-semibold text-white shadow-xs hover:bg-white/20 ${className}`}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export default Button;
