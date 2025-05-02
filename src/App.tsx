import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

function App() {
  const [dream, setDream] = useState({
    date: new Date(),
    content: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Dream submitted:', dream)
    setDream({ date: new Date(), content: '' })
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-purple-50 to-purple-100">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-purple-800 text-center">
              Dream Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-700">
                  Date
                </label>
                <Calendar
                  mode="single"
                  selected={dream.date}
                  onSelect={(date) => date && setDream({ ...dream, date })}
                  className="rounded-md border border-purple-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-700">
                  Your Dream
                </label>
                <Textarea
                  value={dream.content}
                  onChange={(e) => setDream({ ...dream, content: e.target.value })}
                  placeholder="Describe your dream here..."
                  className="min-h-[200px] border-purple-200 focus:border-purple-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Dream
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
