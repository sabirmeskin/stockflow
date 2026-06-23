import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Connexion" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Adresse e-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Mot de passe oublié ?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Mot de passe"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Se souvenir de moi</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Se connecter
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-3 border-t pt-6">
                <p className="text-sm text-muted-foreground">Logins de test (Raccourcis)</p>
                <div className="flex flex-wrap justify-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        type="button"
                        onClick={() => {
                            (document.getElementById('email') as HTMLInputElement).value = 'admin@stockflow.com';
                            (document.getElementById('password') as HTMLInputElement).value = 'password';
                            (document.querySelector('button[data-test="login-button"]') as HTMLButtonElement)?.click();
                        }}
                    >
                        Admin
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        type="button"
                        onClick={() => {
                            (document.getElementById('email') as HTMLInputElement).value = 'operator@stockflow.com';
                            (document.getElementById('password') as HTMLInputElement).value = 'password';
                            (document.querySelector('button[data-test="login-button"]') as HTMLButtonElement)?.click();
                        }}
                    >
                        Opérateur
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        type="button"
                        onClick={() => {
                            (document.getElementById('email') as HTMLInputElement).value = 'consultant@stockflow.com';
                            (document.getElementById('password') as HTMLInputElement).value = 'password';
                            (document.querySelector('button[data-test="login-button"]') as HTMLButtonElement)?.click();
                        }}
                    >
                        Consultant
                    </Button>
                </div>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Connexion à votre compte',
    description: 'Saisissez vos identifiants ci-dessous pour vous connecter',
};
