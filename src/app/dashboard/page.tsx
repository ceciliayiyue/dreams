'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Header } from '@/components/ui/header'
import { Dream } from '@/lib/types'
import { useDreamStorage } from '@/lib/dreamStorage'
import { Brain, Edit, Save, Trash2, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Page() {
  const router = useRouter();
  const { dreams, saveDream, getDream, deleteDream, loading, error } = useDreamStorage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dreamContent, setDreamContent] = useState('');
  const [currentDream, setCurrentDream] = useState<Dream | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Format date to use as storage key
  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Find dates that have dreams
  const getDatesWithDreams = () => {
    return Array.from(dreams.keys()).map(dateKey => {

      const date = new Date(dateKey);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null;
      }

      // Add one day to the date
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      return nextDay;
    }).filter(Boolean) as Date[];
  };

  // Check if the selected date has a saved dream
  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const savedDream = getDream(dateKey);

    if (savedDream) {
      setCurrentDream(savedDream);
      setDreamContent(savedDream.content);
      setIsEditing(false); // Reset editing state when changing dates
    } else {
      setCurrentDream(null);
      setDreamContent('');
      setIsEditing(true); // Enable editing for new entries
    }
  }, [selectedDate, dreams, getDream]);

  // Save the dream entry
  const handleSaveDream = async () => {
    if (!dreamContent.trim()) return;

    try {
      setIsSaving(true);
      const dateKey = formatDateKey(selectedDate);
      const newDream: {
        date: Date;
        interpretation: string | undefined;
        dateKey: string;
        title: string | undefined;
        content: string
      } = {
        dateKey: selectedDate.toString(),
        date: selectedDate,
        content: dreamContent,
        interpretation: currentDream?.interpretation,
        title: currentDream?.title
      };

      // Save the dream
      await saveDream(dateKey, newDream);
      setCurrentDream(newDream);
      setIsEditing(false); // Exit editing mode after saving
    } catch (error) {
      console.error('Error saving dream:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete the dream
  const handleDeleteDream = async () => {
    if (!currentDream) return;

    try {
      setIsDeleting(true);
      const dateKey = formatDateKey(selectedDate);
      await deleteDream(dateKey);
      setCurrentDream(null);
      setDreamContent('');
      setIsEditing(true);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting dream:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Navigate to the interpretation page
  const handleAIAnalysis = async () => {
    if (!dreamContent.trim()) return;

    // Save dream first
    await handleSaveDream();

    // Navigate to interpretation page with the date as param
    router.push(`/interpret/${formatDateKey(selectedDate)}`);
  };

  // Toggle editing mode
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Show authentication prompt if user is not logged in

  return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 flex flex-col">
        <Header />
        <main className="flex-grow flex items-start justify-center p-8">
          <div className="w-full max-w-2xl">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  <span className="ml-2 text-purple-800">Loading your dreams...</span>
                </div>
            ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-purple-800 text-center">
                      Dream Journal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {error && (
                        <Alert className="mb-6 border-red-300 bg-red-50">
                          <AlertDescription className="text-red-700">
                            {error}
                          </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-700">
                          Date
                        </label>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            className="rounded-md border border-purple-200"
                            modifiers={{
                              hasDream: getDatesWithDreams()
                            }}
                            modifiersClassNames={{
                              hasDream: "bg-purple-200 text-purple-900 font-medium"
                            }}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-purple-700">
                            Your Dream
                          </label>
                          {currentDream?.interpretation && (
                              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          Has AI interpretation
                        </span>
                          )}
                        </div>

                        {isEditing ? (
                            // Show textarea in editing mode
                            <Textarea
                                value={dreamContent}
                                onChange={(e) => setDreamContent(e.target.value)}
                                placeholder="Describe your dream here..."
                                className="min-h-[200px] border-purple-200 focus:border-purple-400 w-full"
                                disabled={isSaving}
                            />
                        ) : currentDream ? (
                            // Show read-only view when not editing
                            <div className="p-4 bg-purple-50 rounded-md min-h-[100px] w-full">
                              <p className="text-gray-700 whitespace-pre-wrap">{currentDream.content}</p>
                            </div>
                        ) : (
                            // Placeholder for no dream
                            <div className="p-4 bg-purple-50 rounded-md min-h-[100px] flex items-center justify-center w-full">
                              <p className="text-gray-500">No dream recorded for this date.</p>
                            </div>
                        )}
                      </div>

                      {/* Show interpretation below the dream content when available */}
                      {currentDream?.interpretation && !isEditing && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-700">
                              AI Interpretation
                            </label>
                            <div className="p-4 bg-white rounded-md w-full">
                              <p className="text-gray-700">{currentDream.interpretation}</p>
                            </div>
                          </div>
                      )}

                      {/* Button container with same width as content boxes */}
                      <div className="w-full">
                        {isEditing ? (
                            // Buttons for editing mode
                            <div className="grid grid-cols-2 gap-3 w-full">
                              <Button
                                  onClick={handleSaveDream}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                                  disabled={!dreamContent.trim() || isSaving}
                              >
                                {isSaving ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                ) : (
                                    <>
                                      <Save className="mr-2 h-4 w-4" />
                                      Save Dream
                                    </>
                                )}
                              </Button>
                              {!currentDream?.interpretation ? (
                                  <Button
                                      onClick={handleAIAnalysis}
                                      className="bg-purple-200 hover:bg-purple-300 text-purple-800 font-medium"
                                      disabled={!dreamContent.trim() || isSaving}
                                  >
                                    <Brain className="mr-2 h-4 w-4" />
                                    AI Analysis
                                  </Button>
                              ) : (
                                  <div></div> // Empty placeholder to maintain grid
                              )}
                            </div>
                        ) : currentDream ? (
                            // Buttons for view mode with existing dream
                            <div className="grid grid-cols-3 gap-3 w-full">
                              <Button
                                  onClick={handleToggleEdit}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>

                              {!currentDream.interpretation ? (
                                  <Button
                                      onClick={handleAIAnalysis}
                                      className="bg-purple-200 hover:bg-purple-300 text-purple-800 font-medium"
                                  >
                                    <Brain className="mr-2 h-4 w-4" />
                                    AI Analysis
                                  </Button>
                              ) : (
                                  <div></div> // Empty placeholder to maintain grid
                              )}

                              {/* Delete Button with Dialog */}
                              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                      className="bg-red-100 hover:bg-red-200 text-red-700 font-medium"
                                      disabled={isDeleting}
                                  >
                                    {isDeleting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Dream</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this dream? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteDream}>
                                      {isDeleting ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                          </>
                                      ) : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                        ) : (
                            // Button for no dream
                            <Button
                                onClick={handleToggleEdit}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                            >
                              Add Dream
                            </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>
        </main>
      </div>
  )
}