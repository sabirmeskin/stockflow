import { Head, useForm } from '@inertiajs/react';
import { Settings, Building, Mail, Phone, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    settings: {
        company_name: string;
        company_address: string;
        company_phone: string;
        company_email: string;
        currency: string;
    };
}

export default function SystemSettings({ settings }: Props) {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        company_name: settings.company_name,
        company_address: settings.company_address,
        company_phone: settings.company_phone,
        company_email: settings.company_email,
        currency: settings.currency,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/system');
    };

    return (
        <>
            <Head title="Configuration du système" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Configuration Système</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Définissez les paramètres globaux de l'application et les coordonnées de l'entreprise.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border border-neutral-200/50 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-indigo-500" /> Paramètres Généraux
                            </CardTitle>
                            <CardDescription>
                                Ces informations apparaissent sur les rapports analytiques PDF et Excel générés.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            
                            {/* Success message */}
                            {wasSuccessful && (
                                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 rounded-lg flex items-center gap-2 text-sm font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Paramètres enregistrés avec succès !
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label htmlFor="company_name">Nom de l'entreprise</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                        <Input 
                                            id="company_name" 
                                            value={data.company_name} 
                                            onChange={e => setData('company_name', e.target.value)} 
                                            className="pl-9"
                                            required 
                                        />
                                    </div>
                                    {errors.company_name && <p className="text-xs text-rose-500">{errors.company_name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="currency">Devise par défaut</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                        <Input 
                                            id="currency" 
                                            value={data.currency} 
                                            onChange={e => setData('currency', e.target.value)} 
                                            className="pl-9"
                                            required 
                                        />
                                    </div>
                                    {errors.currency && <p className="text-xs text-rose-500">{errors.currency}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label htmlFor="company_email">Email de contact</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                        <Input 
                                            id="company_email" 
                                            type="email"
                                            value={data.company_email} 
                                            onChange={e => setData('company_email', e.target.value)} 
                                            className="pl-9"
                                        />
                                    </div>
                                    {errors.company_email && <p className="text-xs text-rose-500">{errors.company_email}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="company_phone">Téléphone de contact</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                        <Input 
                                            id="company_phone" 
                                            value={data.company_phone} 
                                            onChange={e => setData('company_phone', e.target.value)} 
                                            className="pl-9"
                                        />
                                    </div>
                                    {errors.company_phone && <p className="text-xs text-rose-500">{errors.company_phone}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="company_address">Adresse complète de l'entreprise</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        id="company_address" 
                                        value={data.company_address} 
                                        onChange={e => setData('company_address', e.target.value)} 
                                        className="pl-9"
                                    />
                                </div>
                                {errors.company_address && <p className="text-xs text-rose-500">{errors.company_address}</p>}
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800 px-6 py-4">
                            <Button type="submit" disabled={processing}>
                                Sauvegarder la configuration
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

            </div>
        </>
    );
}

SystemSettings.layout = {
    breadcrumbs: [
        {
            title: 'Configuration',
            href: '/settings/system',
        },
    ],
};
