import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Place } from '@/components/page'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Tovna24</CardTitle>
          <CardDescription>ទៅណា២៤ — where to go in Phnom Penh</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            shadcn/ui is wired up with the Tovna24 design tokens.
          </p>
        </CardContent>
      </Card>
      
      <Place />
    </main>
  )
}

export default App
