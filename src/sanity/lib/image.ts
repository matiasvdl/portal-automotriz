import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

/**
 * DETERMINA EL COLOR DE CONTRASTE (BLANCO O NEGRO)
 * Recibe un color en Hexadecimal (ej: #FF0000) y calcula si es 
 * visualmente "claro" u "oscuro" para devolver el color de texto ideal.
 */
export function getContrastColor(hexcolor: string) {
  if (!hexcolor) return '#ffffff';

  // Limpiamos el hex por si viene con el símbolo #
  const hex = hexcolor.replace("#", "");

  // Convertimos el Hexadecimal a valores RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Aplicamos la fórmula de luminosidad YIQ
  // Esta fórmula pondera los colores según cómo los percibe el ojo humano
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Si la luminosidad es alta (>= 128), el fondo es claro -> texto negro
  // Si es baja, el fondo es oscuro -> texto blanco
  return (yiq >= 128) ? '#000000' : '#ffffff';
}