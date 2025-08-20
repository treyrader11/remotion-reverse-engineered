export function AppLayout({children}: {children: React.ReactNode}) {
	return (
		<div className="bg-timeline-bg min-h-screen">
			<div className="mx-4 flex flex-col items-center gap-2 pt-10 lg:mx-36">
				{children}
			</div>
		</div>
	);
}

export function PreviewContainer({children}: {children: React.ReactNode}) {
	return (
		<div className="flex max-w-3xl flex-col items-center gap-2">{children}</div>
	);
}
