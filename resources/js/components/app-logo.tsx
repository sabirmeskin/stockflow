import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground bg-indigo-600 dark:bg-indigo-500">
                <AppLogoIcon className="size-5 text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-neutral-900 dark:text-neutral-100">
                    StockFlow
                </span>
                <span className="text-[10px] text-neutral-400 font-medium leading-none">
                    Gestion de Stocks
                </span>
            </div>
        </>
    );
}
