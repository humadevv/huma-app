import { PhotoFilter } from '../types';

export const PHOTO_FILTERS: PhotoFilter[] = [
  {
    id: 'normal',
    name: 'Normal',
    filterCss: 'none',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
  },
  {
    id: 'clarendon',
    name: 'Clarendon',
    filterCss: 'contrast(120%) brightness(125%) saturate(135%)',
    brightness: 125,
    contrast: 120,
    saturation: 135,
    sepia: 0,
  },
  {
    id: 'lark',
    name: 'Lark',
    filterCss: 'contrast(90%) brightness(115%) saturate(110%)',
    brightness: 115,
    contrast: 90,
    saturation: 110,
    sepia: 0,
  },
  {
    id: 'juno',
    name: 'Juno',
    filterCss: 'contrast(115%) brightness(110%) saturate(140%) sepia(10%)',
    brightness: 110,
    contrast: 115,
    saturation: 140,
    sepia: 10,
  },
  {
    id: 'slumber',
    name: 'Slumber',
    filterCss: 'saturate(66%) brightness(105%) sepia(20%) contrast(90%)',
    brightness: 105,
    contrast: 90,
    saturation: 66,
    sepia: 20,
  },
  {
    id: 'gingham',
    name: 'Gingham',
    filterCss: 'brightness(105%) hue-rotate(-10deg) contrast(90%)',
    brightness: 105,
    contrast: 90,
    saturation: 90,
    sepia: 5,
  },
  {
    id: 'moon',
    name: 'Moon',
    filterCss: 'grayscale(100%) contrast(110%) brightness(110%)',
    brightness: 110,
    contrast: 110,
    saturation: 0,
    sepia: 0,
  },
  {
    id: 'valencia',
    name: 'Valencia',
    filterCss: 'contrast(108%) brightness(108%) sepia(25%)',
    brightness: 108,
    contrast: 108,
    saturation: 100,
    sepia: 25,
  },
  {
    id: 'ludwig',
    name: 'Ludwig',
    filterCss: 'saturate(120%) contrast(110%) brightness(105%)',
    brightness: 105,
    contrast: 110,
    saturation: 120,
    sepia: 0,
  },
  {
    id: 'reyes',
    name: 'Reyes',
    filterCss: 'sepia(22%) brightness(110%) contrast(85%) saturate(75%)',
    brightness: 110,
    contrast: 85,
    saturation: 75,
    sepia: 22,
  },
  {
    id: 'noir',
    name: 'Noir',
    filterCss: 'grayscale(100%) contrast(150%) brightness(90%)',
    brightness: 90,
    contrast: 150,
    saturation: 0,
    sepia: 0,
  }
];

export function getCustomFilterStyle(
  filterId: string,
  brightness: number = 100,
  contrast: number = 100,
  saturation: number = 100,
  sepia: number = 0,
  blur: number = 0
): string {
  const preset = PHOTO_FILTERS.find((f) => f.id === filterId);
  const baseCss = preset && preset.id !== 'normal' ? preset.filterCss : '';
  
  const customParts: string[] = [];
  if (brightness !== 100) customParts.push(`brightness(${brightness}%)`);
  if (contrast !== 100) customParts.push(`contrast(${contrast}%)`);
  if (saturation !== 100) customParts.push(`saturate(${saturation}%)`);
  if (sepia !== 0) customParts.push(`sepia(${sepia}%)`);
  if (blur > 0) customParts.push(`blur(${blur}px)`);

  if (!baseCss && customParts.length === 0) return 'none';
  return `${baseCss} ${customParts.join(' ')}`.trim();
}
