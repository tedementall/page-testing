const TEAM_MEMBERS = [
  {
    name: "Maite (Mini)",
    role: "Fundadora & CMO",
    image: "/TheHub/images/team/team-1.png"
  },
  {
    name: "Maite (Grande)",
    role: "Director de Producto",
    image: "/TheHub/images/team/team-2.png"
  },
  {
    name: "Zeus (Mini)",
    role: "Lead Experience Designer",
    image: "/TheHub/images/team/team-3.png"
  },
  {
    name: "Zeus (Grande)",
    role: "Head of Customer Care",
    image: "/TheHub/images/team/team-4.png"
  }
]

export default function Team() {
  return (
    <section className="container__team" id="equipo">
      <div className="container">
        <div className="row justify-content-center mb-5">
          <div className="col-12 col-lg-8 text-center text__team">
            <p>NUESTRO EQUIPO</p>
            <h1>Personas que viven y respiran innovación digital</h1>
          </div>
        </div>
        <div className="row g-4">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.name} className="col-12 col-sm-6 col-lg-3">
              <div className="team__card h-100">
                <img src={member.image} alt={member.name} className="img-fluid" />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
