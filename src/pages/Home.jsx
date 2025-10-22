import Hero from "../components/Hero"
import Trust from "../components/Trust"
import About from "../components/About"
import Products from "../components/Products"
import Team from "../components/Team"

export default function Home() {
  return (
    <main className="main-content-padding">
      <Hero />
      <Trust />
      <About />
      <Products />
      <Team />
    </main>
  )
}
