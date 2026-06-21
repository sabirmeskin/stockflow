import { Head, Link, usePage } from '@inertiajs/react';
import { Package, ArrowRight, Warehouse, ShieldCheck, Activity } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Bienvenue sur StockFlow" />
            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-50 p-6 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
                {/* Decorative background grid and gradients */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/5" />
                <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5" />

                <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
                    {/* Brand Logo Header */}
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30 text-white dark:bg-indigo-500 dark:shadow-indigo-500/10">
                            <Package className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
                            Stock<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
                        </h2>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                            Gestion Logistique Multi-Entrepôts
                        </span>
                    </div>

                    {/* Hero Message */}
                    <div className="space-y-4 max-w-xl mx-auto">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Pilotez votre inventaire avec précision.
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                            Suivi des flux en temps réel, double validation opérateur/administrateur, alertes de sous-stockage et rapports analytiques avancés.
                        </p>
                    </div>

                    {/* Features Badges */}
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
                            <Warehouse className="h-5 w-5 text-indigo-500" />
                            <span className="text-xs font-semibold">Multi-sites</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span className="text-xs font-semibold">Validations</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
                            <Activity className="h-5 w-5 text-rose-500" />
                            <span className="text-xs font-semibold">Alertes Min</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-700/40 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200"
                            >
                                Accéder au tableau de bord <ArrowRight className="h-5 w-5" />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-700/40 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200"
                            >
                                Se connecter <ArrowRight className="h-5 w-5" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Footer copyright */}
                <div className="absolute bottom-6 text-center text-xs text-neutral-400">
                    StockFlow Logistique &copy; {new Date().getFullYear()} • Conçu pour l'optimisation des flux
                </div>
            </div>
        </>
    );
}
