import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
          Portal de autos usados
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Bienvenido. Aquí podrás comprar y vender vehículos con facilidad.
        </p>
        <div className="mt-8">
          {/* Aquí irán componentes futuros: listado de autos, filtros, etc. */}
          <span className="text-zinc-400">Componente de listado pendiente...</span>
        </div>
      </main>
    </div>
  );
}
