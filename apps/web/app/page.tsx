export default function Home() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Bienvenida</h1>
      <p>Este es un DEMO de sistema de reservas y cotización para un salón de uñas.</p>
      <a href="/book" className="inline-block bg-black text-white px-4 py-2 rounded-lg">Ir a Reservar</a>
    </div>
  );
}
