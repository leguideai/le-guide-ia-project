import { TarifsClient } from './tarifs-client'

export default function TarifsPage() {
  return (
    <>
      <h1 className="sr-only">
        Tarifs & Abonnements IA — Bootcamps, Replays des Masterclasses et Bibliothèque de Prompts
      </h1>
      <TarifsClient />
    </>
  )
}
