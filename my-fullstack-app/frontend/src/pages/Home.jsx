import { Header } from "../components/Header"
import { VerticalNav } from "../components/VerticleNav"

export const Home = () => {
    return (
        <div className="flex flex-col h-screen">
            <Header/>
            <div className="flex flex-1">
                <VerticalNav/>
                <main className="flex-1 bg-gray-50 p-6">
                    {/* Main content area */}
                </main>
            </div>
        </div>
    )
}