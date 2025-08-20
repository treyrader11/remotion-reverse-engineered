const ImageIcon = ({className = 'size-4'}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		className={className}
	>
		<path
			fillRule="evenodd"
			d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
			clipRule="evenodd"
		/>
	</svg>
);

const MinusIcon = ({className = 'size-4'}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 448 512"
		fill="currentColor"
		className={className}
	>
		<path
			fill="currentColor"
			d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"
		></path>
	</svg>
);

const PlusIcon = ({className = 'size-4'}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		className={className}
	>
		<path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
	</svg>
);

const TextIcon = ({className = 'size-4'}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		className={className}
	>
		<path
			fillRule="evenodd"
			d="M8 2.75A.75.75 0 0 1 8.75 2h7.5a.75.75 0 0 1 0 1.5h-3.215l-4.483 13h2.698a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3.215l4.483-13H8.75A.75.75 0 0 1 8 2.75Z"
			clipRule="evenodd"
		/>
	</svg>
);

const TrashIcon = ({className = 'size-3'}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 448 512"
	>
		<path
			fill="currentcolor"
			d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"
		/>
	</svg>
);

const VideoIcon = ({className = 'size-4'}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		className={className}
	>
		<path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 0 0 1.28-.53V4.75Z" />
	</svg>
);

const AudioIcon = ({className = 'size-4'}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 384 512"
		fill="currentColor"
		className={className}
	>
		<path d="M384 32c0-9.9-4.5-19.2-12.3-25.2S353.8-1.4 344.2 1l-128 32C202 36.5 192 49.3 192 64l0 64 0 231.7c-14.5-4.9-30.8-7.7-48-7.7c-61.9 0-112 35.8-112 80s50.1 80 112 80s112-35.8 112-80l0-279L359.8 127C374 123.5 384 110.7 384 96l0-64z" />
	</svg>
);

const ScissorsIcon = ({className = 'size-4'}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 512 512"
		fill="currentColor"
	>
		<path d="M256 192l-39.5-39.5c4.9-12.6 7.5-26.2 7.5-40.5C224 50.1 173.9 0 112 0S0 50.1 0 112s50.1 112 112 112c14.3 0 27.9-2.7 40.5-7.5L192 256l-39.5 39.5c-12.6-4.9-26.2-7.5-40.5-7.5C50.1 288 0 338.1 0 400s50.1 112 112 112s112-50.1 112-112c0-14.3-2.7-27.9-7.5-40.5L499.2 76.8c7.1-7.1 7.1-18.5 0-25.6c-28.3-28.3-74.1-28.3-102.4 0L256 192zm22.6 150.6L396.8 460.8c28.3 28.3 74.1 28.3 102.4 0c7.1-7.1 7.1-18.5 0-25.6L342.6 278.6l-64 64zM64 112a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm48 240a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
	</svg>
);

export {
	AudioIcon,
	ImageIcon,
	MinusIcon,
	PlusIcon,
	ScissorsIcon,
	TextIcon,
	TrashIcon,
	VideoIcon,
};
