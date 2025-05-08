'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { interpretDream } from '@/lib/dreamInterpreter';
import { Dream } from '@/lib/types';
import { useDreamStorage } from '@/lib/dreamStorage';
import { ArrowLeftIcon, RotateCwIcon, SaveIcon } from 'lucide-react';
import { Header } from '@/components/ui/header';

type Props = {
    dateKey: string;
};
export default function Interpretation({ dateKey }: Props) {
    const router = useRouter();
    const { getDream, saveDream } = useDreamStorage();
    const [dream, setDream] = useState<Dream | null>(null);
    const [interpretation, setInterpretation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load the dream when the component mounts
    useEffect(() => {
        if (!dateKey) {
            router.push('/dashboard');
            return;
        }

        const savedDream = getDream(dateKey);
        if (!savedDream) {
            router.push('/dashboard');
            return;
        }

        setDream(savedDream);
        setInterpretation(savedDream.interpretation || null);

        // If no interpretation exists, generate one automatically
        if (!savedDream.interpretation) {
            generateInterpretation(savedDream.content);
        }
    }, [dateKey, router, getDream]);

    // Function to generate a dream interpretation
    const generateInterpretation = async (content: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await interpretDream(content);

            if (result.success && result.interpretation) {
                setInterpretation(result.interpretation);
            } else {
                setError(result.error || 'Failed to interpret dream');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Save the interpretation and return to dashboard
    const handleSaveInterpretation = () => {
        if (!dream || !interpretation || !dateKey) return;

        // Update the dream with the interpretation
        const updatedDream = { ...dream, interpretation };
        saveDream(dateKey, updatedDream);

        // Navigate back to dashboard
        router.push('/dashboard');
    };

    // Regenerate the interpretation
    const handleRegenerateInterpretation = () => {
        if (!dream) return;
        generateInterpretation(dream.content);
    };

    // Return to dashboard without saving
    const handleGoBack = () => {
        router.push('/dashboard');
    };

    // Return to dashboard and save automatically
    const handleSaveAndGoBack = () => {
        handleSaveInterpretation();
    };

    if (!dream) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 flex flex-col">
                <Header />
                <main className="flex-grow flex items-start justify-center p-8">
                    <div className="w-full max-w-2xl">
                        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                            <CardContent className="pt-6 pb-4 text-center">
                                <p>Loading dream...</p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 flex flex-col">
            <Header />
            <main className="flex-grow flex items-start justify-center p-8">
                <div className="w-full max-w-2xl">
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-purple-800 text-center">
                                Dream Interpretation
                            </CardTitle>
                            <p className="text-center text-purple-600 mt-2">
                                {new Date(dream.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Dream Content */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-purple-800">Your Dream</h3>
                                <div className="p-4 bg-purple-50 rounded-md">
                                    <p className="text-gray-700 whitespace-pre-wrap">{dream.content}</p>
                                </div>
                            </div>

                            {/* Interpretation */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-purple-800">AI Interpretation</h3>
                                {isLoading ? (
                                    <div className="p-4 bg-white rounded-md flex items-center justify-center min-h-32">
                                        <div className="flex flex-col items-center text-purple-600">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mb-2"></div>
                                            <p>Analyzing your dream...</p>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="p-4 bg-red-50 rounded-md text-red-700">
                                        {error}
                                        <Button
                                            onClick={handleRegenerateInterpretation}
                                            className="mt-2 bg-red-100 hover:bg-red-200 text-red-700"
                                            size="sm"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                ) : interpretation ? (
                                    <div className="p-4 bg-white rounded-md">
                                        <p className="text-gray-700">{interpretation}</p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-md">
                                        <p className="text-gray-500">No interpretation available.</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                                <Button
                                    onClick={handleGoBack}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 sm:flex-1"
                                >
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    Back to Journal
                                </Button>

                                {interpretation && (
                                    <>
                                        <Button
                                            onClick={handleRegenerateInterpretation}
                                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 sm:flex-1"
                                            disabled={isLoading}
                                        >
                                            <RotateCwIcon className="mr-2 h-4 w-4" />
                                            Regenerate
                                        </Button>

                                        <Button
                                            onClick={handleSaveAndGoBack}
                                            className="bg-purple-600 hover:bg-purple-700 text-white sm:flex-1"
                                            disabled={isLoading}
                                        >
                                            <SaveIcon className="mr-2 h-4 w-4" />
                                            Save Interpretation
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}