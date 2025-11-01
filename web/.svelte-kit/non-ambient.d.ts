
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/buildTree" | "/auth" | "/auth/signup" | "/elections" | "/elections/[id]";
		RouteParams(): {
			"/elections/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/api": Record<string, never>;
			"/api/buildTree": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/signup": Record<string, never>;
			"/elections": { id?: string };
			"/elections/[id]": { id: string }
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/buildTree" | "/api/buildTree/" | "/auth" | "/auth/" | "/auth/signup" | "/auth/signup/" | "/elections" | "/elections/" | `/elections/${string}` & {} | `/elections/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/fonts/Geist.ttf" | "/fonts/Morganite-Bold.ttf" | "/fonts/Morganite-Book.ttf" | "/fonts/Morganite-Light.ttf" | "/robots.txt" | string & {};
	}
}