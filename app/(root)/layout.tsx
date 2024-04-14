import React, { ReactNode } from 'react';
import StreamVideoProvider from "@/providers/StreamClientProvider";
import type {Metadata} from "next";

export const metadata: Metadata = {
	title: "YOOM",
	description: "Созванивайся с людьми прямо тут",
	icons: '/icons/logo.svg'
};

const RootLayout = ({ children }: { children: ReactNode }) => {
	return (
		<main>
			<StreamVideoProvider>
				{children}
			</StreamVideoProvider>
		</main>
	);
};

export default RootLayout;
