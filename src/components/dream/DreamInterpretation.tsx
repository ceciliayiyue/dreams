import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { interpretDream } from '@/lib/dreamInterpreter';
import { SparklesIcon, LoaderIcon } from 'lucide-react';

interface DreamInterpretationProps {
  dreamContent: string;
  existingInterpretation?: string;
  onInterpretationSaved?: (interpretation: string) => void;
}

export function DreamInterpretation({ 
  dreamContent, 
  existingInterpretation, 
  onInterpretationSaved 
}: DreamInterpretationProps) {
  const [interpretation, setInterpretation] = useState<string | null>(existingInterpretation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(existingInterpretation ? 'interpretation' : 'dream');

  // Update interpretation state when existingInterpretation prop changes
  useEffect(() => {
    if (existingInterpretation) {
      setInterpretation(existingInterpretation);
    }
  }, [existingInterpretation]);

  const handleInterpretDream = async () => {
    if (!dreamContent.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await interpretDream(dreamContent);
      
      if (result.success && result.interpretation) {
        setInterpretation(result.interpretation);
        setActiveTab('interpretation');
        
        // Notify parent component about the new interpretation
        if (onInterpretationSaved) {
          onInterpretationSaved(result.interpretation);
        }
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

  return (
    <div className="mt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-purple-100">
          <TabsTrigger value="dream" className="text-purple-800 data-[state=active]:bg-white">Dream</TabsTrigger>
          <TabsTrigger 
            value="interpretation" 
            className="text-purple-800 data-[state=active]:bg-white"
            disabled={!interpretation}
          >
            AI Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dream" className="mt-4">
          <Card className="border-purple-200">
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap">{dreamContent || 'No dream content yet.'}</p>
              
              {dreamContent && !interpretation && (
                <div className="mt-4">
                  <Button
                    onClick={handleInterpretDream}
                    disabled={isLoading || !dreamContent.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Interpreting...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="mr-2 h-4 w-4" />
                        Interpret My Dream with AI
                      </>
                    )}
                  </Button>
                  
                  {error && (
                    <div className="mt-3 p-3 text-sm text-red-700 bg-red-50 rounded-md">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interpretation" className="mt-4">
          <Card className="border-purple-200">
            <CardContent className="pt-4">
              {interpretation ? (
                <div>
                  <h3 className="text-lg font-medium text-purple-800 mb-2">Dream Interpretation</h3>
                  <p className="text-gray-700">{interpretation}</p>
                </div>
              ) : (
                <p className="text-gray-500">
                  No interpretation available. Click &quot;Interpret My Dream with AI&quot; to get an analysis.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 