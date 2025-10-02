
'use client';

import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        const date = new Date();
        setLastUpdated(date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }));
    }, []);

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-8 text-foreground">
                <div>
                    <h1 className="font-headline text-4xl font-bold tracking-tight">Privacy Policy</h1>
                    <p className="mt-2 text-muted-foreground">Last updated: {lastUpdated || '...'}</p>
                </div>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
                        <p className="text-muted-foreground">
                            Welcome to Hackura. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">2. Information We Collect</h2>
                        <p className="text-muted-foreground">
                            We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use. The personal information we collect may include the following: name, email address, and payment information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground">
                            We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We use the information we collect or receive to facilitate account creation, to process payments, to send you marketing and promotional communications, and to respond to your inquiries.
                        </p>
                    </section>

                     <section>
                        <h2 className="text-2xl font-bold mb-3">4. Will Your Information Be Shared With Anyone?</h2>
                        <p className="text-muted-foreground">
                            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, or Legal Obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">5. How Long Do We Keep Your Information?</h2>
                        <p className="text-muted-foreground">
                            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-3">6. Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have questions or comments about this policy, you may email us at hackura@gmail.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
